-- Documente retroactivement le journal d'activite : la table, la fonction de trigger et
-- les triggers eux-memes existaient deja en base (appliques directement, hors du flux de
-- migration habituel de ce depot) avant ce fichier. Ecriture idempotente (if not exists /
-- or replace) pour refleter fidelement l'etat reel sans rien casser si rejoue.
create table if not exists public.journal_activite (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id),
  nom_utilisateur text,
  operation text not null,
  table_cible text not null,
  enregistrement_id uuid,
  anciennes_valeurs jsonb,
  nouvelles_valeurs jsonb
);

create index if not exists idx_journal_activite_created_at on public.journal_activite (created_at desc);
create index if not exists idx_journal_activite_table_cible on public.journal_activite (table_cible);
create index if not exists idx_journal_activite_user_id on public.journal_activite (user_id);

alter table public.journal_activite enable row level security;

drop policy if exists admins_lisent_le_journal on public.journal_activite;
create policy admins_lisent_le_journal
  on public.journal_activite
  for select
  to authenticated
  using (est_admin());

-- Aucune policy d'ecriture pour les utilisateurs authentifies : seule la fonction
-- SECURITY DEFINER ci-dessous ecrit dans le journal (append-only depuis l'app).
create or replace function public.fn_journaliser_activite()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_user_id uuid := auth.uid();
  v_nom text;
  v_record_id uuid;
begin
  if v_user_id is not null then
    select nom into v_nom from public.profiles where id = v_user_id;
  end if;

  v_record_id := case
    when TG_OP = 'DELETE' then (to_jsonb(OLD) ->> 'id')::uuid
    else (to_jsonb(NEW) ->> 'id')::uuid
  end;

  insert into public.journal_activite (
    user_id, nom_utilisateur, operation, table_cible, enregistrement_id,
    anciennes_valeurs, nouvelles_valeurs
  ) values (
    v_user_id,
    v_nom,
    TG_OP,
    TG_TABLE_NAME,
    v_record_id,
    case when TG_OP in ('UPDATE', 'DELETE') then to_jsonb(OLD) else null end,
    case when TG_OP in ('INSERT', 'UPDATE') then to_jsonb(NEW) else null end
  );

  if TG_OP = 'DELETE' then
    return OLD;
  end if;
  return NEW;
end;
$function$;

-- 11 tables couvertes. demandes_reservation n'a volontairement pas de trigger INSERT :
-- l'insertion se fait de facon anonyme depuis le formulaire public (policy
-- "demandes_insert_public"), ce n'est pas une action staff a journaliser.
do $$
declare
  t text;
begin
  foreach t in array array[
    'categories_vehicules', 'clients', 'contrats_location', 'entretiens', 'garants',
    'indisponibilites_vehicule', 'profiles', 'reservations', 'tarifs', 'vehicules'
  ]
  loop
    execute format('drop trigger if exists trg_journal_%1$s on public.%1$s', t);
    execute format(
      'create trigger trg_journal_%1$s after insert or update or delete on public.%1$s for each row execute function public.fn_journaliser_activite()',
      t
    );
  end loop;

  execute 'drop trigger if exists trg_journal_demandes_reservation on public.demandes_reservation';
  execute 'create trigger trg_journal_demandes_reservation after update or delete on public.demandes_reservation for each row execute function public.fn_journaliser_activite()';
end $$;

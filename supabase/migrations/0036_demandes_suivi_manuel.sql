-- Lot 2 /admin/demandes : saisie manuelle, vraies dates de contact et de relance, motif de
-- « sans suite », notes internes, lien direct demande ↔ client, langue du client.
--
-- 1. Nouvelles colonnes (toutes nulles ou avec valeur par défaut : AUCUNE ligne existante
--    n'est modifiée ; les demandes existantes prennent source = 'site').
--    - source : canal de la demande. 'site' = formulaire public (creer_demande_publique, qui
--      ne fournit pas la colonne et garde donc la valeur par défaut).
--    - notes_internes : notes du personnel. La colonne notes reste la note du visiteur.
--    - contacte_le / derniere_relance_le / prochaine_relance_le : vraies dates de suivi
--      (remplacent l'approximation par updated_at du Lot 1).
--    - motif_sans_suite : raison du statut « rejetee » (dont 'client_annule').
--    - created_by : auteur d'une saisie manuelle. Valeur par défaut auth.uid() : renseignée
--      pour une session du personnel, NULL pour le formulaire public (clé service_role,
--      sans utilisateur).
--    - client_id : lien direct vers la fiche client (ON DELETE SET NULL). Aucun remplissage
--      ici : proposé séparément.
--    - clients.langue : langue du client.
-- 2. Une saisie manuelle peut être incomplète (véhicule, dates, téléphone « à préciser ») :
--    vehicule_id, date_debut, date_fin et whatsapp deviennent NULL-ables. Les exigences sont
--    reportées :
--    - dans une contrainte CHECK (demandes_champs_requis), valable à l'insertion ET à la mise
--      à jour comme les NOT NULL qu'elle remplace : pour source = 'site', WhatsApp, véhicule
--      et dates restent obligatoires ; pour une saisie manuelle, téléphone OU courriel ;
--    - dans le trigger de validation (insertion seulement, comme avant), qui garde EXACTEMENT
--      les règles actuelles pour source = 'site' (WhatsApp E.164) et exige pour les autres
--      sources un nom non vide et, si un téléphone est donné, le format E.164.
-- 3. Policy INSERT pour le personnel connecté (authenticated + est_staff()), limitée aux
--    saisies manuelles : source différente de 'site', statut 'nouvelle' ou 'contactee'
--    (jamais « convertie »), created_by = l'utilisateur lui-même. anon ne reçoit aucun droit.
-- 4. Journal : un trigger AFTER INSERT inscrit les créations manuelles (created_by non nul)
--    avec la même fonction que les autres triggers du journal.
--
-- RETOUR ARRIÈRE (en une transaction : un échec n'applique rien. Il échoue volontairement si
-- des saisies manuelles sans téléphone, véhicule ou dates existent : les supprimer ou les
-- compléter d'abord) :
--   begin;
--   drop trigger if exists trg_journal_demandes_reservation_insert on public.demandes_reservation;
--   drop policy if exists "demandes_insert_staff" on public.demandes_reservation;
--   create or replace function public.verifier_whatsapp_e164() returns trigger language plpgsql
--     set search_path = public as $f$
--   begin
--     if new.whatsapp !~ '^\+[1-9][0-9]{6,14}$' then
--       raise exception 'Numéro WhatsApp invalide : format E.164 requis (ex. +33665439979)'
--         using errcode = '23514';
--     end if;
--     return new;
--   end; $f$;
--   alter table public.demandes_reservation drop constraint if exists demandes_champs_requis;
--   alter table public.demandes_reservation
--     alter column whatsapp set not null, alter column vehicule_id set not null,
--     alter column date_debut set not null, alter column date_fin set not null;
--   drop index if exists public.idx_demandes_reservation_client;
--   drop index if exists public.idx_demandes_reservation_prochaine_relance;
--   alter table public.demandes_reservation
--     drop column if exists source, drop column if exists notes_internes,
--     drop column if exists contacte_le, drop column if exists derniere_relance_le,
--     drop column if exists prochaine_relance_le, drop column if exists motif_sans_suite,
--     drop column if exists created_by, drop column if exists client_id;
--   alter table public.clients drop column if exists langue;
--   commit;

-- 1. Colonnes ---------------------------------------------------------------------------------
alter table public.demandes_reservation
  add column source text not null default 'site'
    constraint demandes_reservation_source_check
    check (source in ('site', 'whatsapp', 'courriel', 'telephone', 'comptoir', 'autre')),
  add column notes_internes text,
  add column contacte_le timestamptz,
  add column derniere_relance_le timestamptz,
  add column prochaine_relance_le date,
  add column motif_sans_suite text
    constraint demandes_reservation_motif_sans_suite_check
    check (motif_sans_suite in ('prix', 'indisponible', 'pas_de_reponse', 'client_annule', 'autre')),
  add column created_by uuid references auth.users (id) on delete set null,
  add column client_id uuid references public.clients (id) on delete set null;

-- Valeur par défaut posée APRÈS l'ajout de la colonne : les lignes existantes restent à NULL.
alter table public.demandes_reservation alter column created_by set default auth.uid();

create index if not exists idx_demandes_reservation_client on public.demandes_reservation (client_id);
create index if not exists idx_demandes_reservation_prochaine_relance
  on public.demandes_reservation (prochaine_relance_le) where prochaine_relance_le is not null;

alter table public.clients
  add column langue text constraint clients_langue_check check (langue in ('fr', 'en', 'es'));

-- 2. Champs facultatifs pour une saisie manuelle, règles reportées dans le trigger -----------
alter table public.demandes_reservation
  alter column whatsapp drop not null,
  alter column vehicule_id drop not null,
  alter column date_debut drop not null,
  alter column date_fin drop not null;

-- Garanties des anciens NOT NULL, à l'insertion comme à la mise à jour. Pour le site : champ
-- rempli (pas de format imposé ici : les anciennes lignes au numéro « à vérifier » restent
-- valides, le format E.164 est contrôlé à l'insertion par le trigger ci-dessous).
alter table public.demandes_reservation
  add constraint demandes_champs_requis check (
    case
      when source = 'site' then
        whatsapp is not null and vehicule_id is not null
        and date_debut is not null and date_fin is not null
      else
        whatsapp is not null or nullif(btrim(email), '') is not null
    end
  );

-- Même fonction et même trigger BEFORE INSERT qu'en 0030 (nom conservé) ; seule l'INSERTION est
-- contrôlée, comme avant : les anciennes lignes au numéro « à vérifier » restent modifiables.
create or replace function public.verifier_whatsapp_e164()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.source = 'site' then
    -- Formulaire public : exigences inchangées.
    if new.whatsapp is null or new.whatsapp !~ '^\+[1-9][0-9]{6,14}$' then
      raise exception 'Numéro WhatsApp invalide : format E.164 requis (ex. +33665439979)'
        using errcode = '23514';
    end if;
    if new.vehicule_id is null or new.date_debut is null or new.date_fin is null then
      raise exception 'Demande du site : véhicule et dates obligatoires'
        using errcode = '23502';
    end if;
  else
    -- Saisie manuelle : nom complet + téléphone E.164 ou courriel.
    if new.nom is null or btrim(new.nom) = '' then
      raise exception 'Demande : nom obligatoire' using errcode = '23514';
    end if;
    if new.whatsapp is not null and new.whatsapp !~ '^\+[1-9][0-9]{6,14}$' then
      raise exception 'Numéro WhatsApp invalide : format E.164 requis (ex. +33665439979)'
        using errcode = '23514';
    end if;
    if new.whatsapp is null and (new.email is null or btrim(new.email) = '') then
      raise exception 'Demande : téléphone ou courriel obligatoire' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;

-- 3. Insertion par le personnel (saisies manuelles uniquement) -------------------------------
create policy "demandes_insert_staff" on public.demandes_reservation
  for insert to authenticated
  with check (
    public.est_staff()
    and source <> 'site'
    and statut in ('nouvelle', 'contactee')
    and created_by = auth.uid()
  );

-- 4. Journal : création manuelle -------------------------------------------------------------
create trigger trg_journal_demandes_reservation_insert
  after insert on public.demandes_reservation
  for each row when (new.created_by is not null)
  execute function public.fn_journaliser_activite();

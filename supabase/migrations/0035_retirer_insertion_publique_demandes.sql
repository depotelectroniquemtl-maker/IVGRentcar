-- Sécurisation des demandes publiques (/reservar) — ÉTAPE RESTRICTIVE.
--
-- À appliquer UNIQUEMENT après le déploiement de la route /api/demandes qui passe par
-- creer_demande_publique (0034). Ferme l'insertion directe avec la clé publique :
--   - suppression de la policy "demandes_insert_public" (with check (true)) : plus aucune
--     policy INSERT, donc ni anon ni authenticated ne peuvent insérer directement.
--     L'admin ne crée jamais de demande (il ne fait que lire / modifier le statut) ;
--   - retrait à anon des droits INSERT, UPDATE, DELETE et TRUNCATE (déjà bloqués par RLS sauf
--     TRUNCATE, qui n'est pas soumis à RLS).
-- Inchangé : SELECT d'anon (filtré par RLS, aucune ligne visible), tous les droits
-- d'authenticated (policies demandes_select_staff / demandes_update_staff /
-- demandes_delete_admin), et creer_demande_publique (security definer, propriétaire postgres).
-- Aucune ligne existante de demandes_reservation n'est modifiée.
--
-- RETOUR ARRIÈRE :
--   grant insert, update, delete, truncate on public.demandes_reservation to anon;
--   create policy "demandes_insert_public" on public.demandes_reservation
--     for insert with check (true);

drop policy if exists "demandes_insert_public" on public.demandes_reservation;

revoke insert, update, delete, truncate on public.demandes_reservation from anon;

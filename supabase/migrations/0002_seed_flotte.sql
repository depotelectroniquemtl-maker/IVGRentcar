-- Données de référence initiales : catégories + grille tarifaire, reprises de la fiche
-- tarifaire I.V.J Polanco Rent a Car (Las Terrenas, R.D.) fournie par le client.
-- Pas d'ID généré codé en dur : on relie catégories et tarifs par le nom via une CTE.

with cat as (
  insert into public.categories_vehicules (nom, type, capacite_personnes) values
    ('Hyundai', 'voiture', 5),
    ('Changan', 'voiture', 5),
    ('Tucson 4x4', 'voiture', 5),
    ('Chevrolet 4x4', 'voiture', 5),
    ('Suzuki XL 7 Personas', 'voiture', 7),
    ('Quad 4 Roues 300cc', 'quad', 2),
    ('Kia Seltos 2026', 'voiture', 5),
    ('Pasola 175cc', 'scooter', 2)
  returning id, nom
)
insert into public.tarifs (categorie_id, palier, prix_usd)
select cat.id, t.palier, t.prix_usd
from cat
join (
  values
    ('Hyundai', '1_3_jours', 55), ('Hyundai', '4_plus_jours', 50), ('Hyundai', '15_plus_jours', 40),
    ('Changan', '1_3_jours', 65), ('Changan', '4_plus_jours', 60), ('Changan', '15_plus_jours', 55),
    ('Tucson 4x4', '1_3_jours', 70), ('Tucson 4x4', '4_plus_jours', 65), ('Tucson 4x4', '15_plus_jours', 60),
    ('Chevrolet 4x4', '1_3_jours', 65), ('Chevrolet 4x4', '4_plus_jours', 60), ('Chevrolet 4x4', '15_plus_jours', 55),
    ('Suzuki XL 7 Personas', '1_3_jours', 75), ('Suzuki XL 7 Personas', '4_plus_jours', 70), ('Suzuki XL 7 Personas', '15_plus_jours', 65),
    ('Quad 4 Roues 300cc', '1_3_jours', 50), ('Quad 4 Roues 300cc', '4_plus_jours', 40), ('Quad 4 Roues 300cc', '15_plus_jours', 30),
    ('Kia Seltos 2026', '1_3_jours', 80), ('Kia Seltos 2026', '4_plus_jours', 75), ('Kia Seltos 2026', '15_plus_jours', 70),
    ('Pasola 175cc', '1_3_jours', 20), ('Pasola 175cc', '4_plus_jours', 18), ('Pasola 175cc', '15_plus_jours', 15)
) as t (categorie_nom, palier, prix_usd) on t.categorie_nom = cat.nom;

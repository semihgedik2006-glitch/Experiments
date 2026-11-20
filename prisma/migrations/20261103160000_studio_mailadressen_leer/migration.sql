-- Nachtrag zu 20261103120000_studio_mailadressen: Bei den Studios stand
-- nicht huerth@kformen.com, sondern GAR KEINE Adresse (leer). Die Hürth-
-- Adresse auf den Studioseiten kam aus der Fußzeile. Neue Anfragen gingen
-- deshalb an die Sammeladresse (TEAM_EMAIL) statt an das Studio.
--
-- Gesetzt wird nur, wo das Feld leer ist - eine im Adminbereich
-- eingetragene Adresse bleibt unangetastet.
UPDATE "StudioLocation" AS s
SET "email" = v.email
FROM (VALUES
  ('bruehl',                 'bruehl@kformen.com'),
  ('huerth',                 'huerth@kformen.com'),
  ('koeln-ebertplatz',       'ebertplatz@kformen.com'),
  ('koeln-longerich',        'longerich@kformen.com'),
  ('koeln-nippes',           'nippes@kformen.com'),
  ('koeln-porz-wahn',        'porz@kformen.com'),
  ('koeln-rath',             'rath@kformen.com'),
  ('koeln-rondorf',          'rondorf@kformen.com'),
  ('neunkirchen-seelscheid', 'neunkirchenseelscheid@kformen.com'),
  ('niederkassel-mondorf',   'mondorf@kformen.com'),
  ('overath',                'overath@kformen.com'),
  ('overath-marialinden',    'marialinden@kformen.com'),
  ('refrath',                'refrath@kformen.com'),
  ('roesrath',               'roesrath@kformen.com')
) AS v(slug, email)
WHERE s."slug" = v.slug
  AND trim(coalesce(s."email", '')) = '';

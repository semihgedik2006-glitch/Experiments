-- Jedes Studio bekommt seine eigene Adresse.
--
-- Bis hier stand bei allen vierzehn Studios huerth@kformen.com - jede
-- neue Anfrage, egal für welches Studio, ging damit an Hürth, und auch
-- "Antworten" der Gäste landeten dort. Die richtigen Adressen stehen auf
-- den Studioseiten von koerperformen.com (Stand 03.11.2026).
--
-- Ersetzt wird NUR die alte Sammeladresse. Wer im Adminbereich schon eine
-- andere Adresse eingetragen hat, behält sie.
UPDATE "StudioLocation" AS s
SET "email" = v.email
FROM (VALUES
  ('bruehl',                 'bruehl@kformen.com'),
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
  AND lower(trim(s."email")) = 'huerth@kformen.com';

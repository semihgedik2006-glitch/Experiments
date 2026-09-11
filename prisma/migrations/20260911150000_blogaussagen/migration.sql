-- Belegpflichtige Behauptungen aus den Blogartikeln nehmen.
--
-- Die fünf Artikel stammen aus dem Seed und standen veröffentlicht auf
-- der Seite. Darin steckten Aussagen, für die nirgends eine Quelle
-- stand - am deutlichsten diese:
--
--   "Studien der Deutschen Sporthochschule Köln zeigen, dass
--    regelmäßiges EMS-Training Rückenbeschwerden deutlich reduzieren
--    kann."
--
-- Dazu "bis zu 90% der Muskelfasern" (zweimal), "rund 80% der
-- Deutschen", ein Nachbrenneffekt "noch Stunden" und "ein halbes Kilo
-- pro Woche ... bleibt dauerhaft unten". Gesundheitsbezogene Werbung mit
-- Angaben, die sich nicht belegen lassen, ist irreführend (§ 5 UWG,
-- § 3 HWG) - und haftbar ist der Betreiber, nicht der Text.
--
-- Ersetzt wird mit replace() und nicht mit einem festen neuen Inhalt:
-- So bleibt jede andere Änderung erhalten, die im Adminbereich an einem
-- Artikel gemacht wurde, und ein zweiter Lauf ändert nichts mehr.
--
-- Der Seed (prisma/seed.ts) ist gleich mit angepasst, damit eine frisch
-- aufgesetzte Datenbank nicht wieder mit den alten Sätzen startet.

UPDATE "BlogPost"
SET "content" = replace("content", $alt$Dadurch werden bis zu 90% der Muskelfasern aktiviert - deutlich mehr als beim klassischen Training. Das Ergebnis: ein intensives Ganzkörpertraining in nur 20 Minuten, einmal pro Woche.$alt$, $neu$Die Impulse erreichen dabei auch tiefer liegende Muskelschichten, die sich mit klassischen Übungen nur schwer gezielt ansteuern lassen. Deshalb dauert eine Einheit bei uns rund 20 Minuten und findet einmal pro Woche statt - wie stark sie wirkt, hängt von der Intensität ab, die dein Trainer mit dir zusammen einstellt.$neu$)
WHERE "slug" = 'was-ist-ems-training'
  AND "content" LIKE '%' || $alt$Dadurch werden bis zu 90% der Muskelfasern aktiviert - deutlich mehr als beim klassischen Training. Das Ergebnis: ein intensives Ganzkörpertraining in nur 20 Minuten, einmal pro Woche.$alt$ || '%';

UPDATE "BlogPost"
SET "content" = replace("content", $alt$Genau hier liegt die Stärke von EMS: Die elektrischen Impulse erreichen auch die tiefen Muskelschichten, die mit klassischen Übungen nur schwer gezielt trainierbar sind. Studien der Deutschen Sporthochschule Köln zeigen, dass regelmäßiges EMS-Training Rückenbeschwerden deutlich reduzieren kann.$alt$, $neu$Genau hier setzt EMS an: Die elektrischen Impulse erreichen auch die tiefen Muskelschichten, die mit klassischen Übungen nur schwer gezielt trainierbar sind. Ob das im Einzelfall hilft, hängt von der Ursache der Beschwerden ab - bei anhaltenden oder starken Schmerzen gehört die Abklärung zuerst zum Arzt, nicht ins Studio.$neu$)
WHERE "slug" = 'ems-gegen-rueckenschmerzen'
  AND "content" LIKE '%' || $alt$Genau hier liegt die Stärke von EMS: Die elektrischen Impulse erreichen auch die tiefen Muskelschichten, die mit klassischen Übungen nur schwer gezielt trainierbar sind. Studien der Deutschen Sporthochschule Köln zeigen, dass regelmäßiges EMS-Training Rückenbeschwerden deutlich reduzieren kann.$alt$ || '%';

UPDATE "BlogPost"
SET "excerpt" = replace("excerpt", $alt$Rund 80% der Deutschen kennen Rückenschmerzen.$alt$, $neu$Rückenschmerzen gehören zu den häufigsten Beschwerden überhaupt.$neu$)
WHERE "slug" = 'ems-gegen-rueckenschmerzen'
  AND "excerpt" LIKE '%' || $alt$Rund 80% der Deutschen kennen Rückenschmerzen.$alt$ || '%';

UPDATE "BlogPost"
SET "content" = replace("content", $alt$Dazu kommt der Nachbrenneffekt: Nach einer intensiven EMS-Einheit arbeitet dein Stoffwechsel noch Stunden auf erhöhtem Niveau.
Unsere Empfehlung für nachhaltige Ergebnisse: wöchentliches EMS-Training für den Muskelerhalt, dazu eine eiweißreiche, alltagstaugliche Ernährung ohne Verbote - und Geduld. Ein halbes Kilo pro Woche ist realistisch und bleibt dauerhaft unten. Bei deinem Probetermin sprechen wir offen über deine Ziele und was in welchem Zeitraum erreichbar ist.$alt$, $neu$Unsere Empfehlung für Ergebnisse, die bleiben: wöchentliches EMS-Training für den Muskelerhalt, dazu eine eiweißreiche, alltagstaugliche Ernährung ohne Verbote - und Geduld. Wie schnell es geht, ist von Mensch zu Mensch verschieden und hängt vor allem daran, ob die Ernährung mitzieht. Bei deinem Probetermin sprechen wir offen über deine Ziele und was in welchem Zeitraum für dich erreichbar ist.$neu$)
WHERE "slug" = 'abnehmen-mit-ems'
  AND "content" LIKE '%' || $alt$Dazu kommt der Nachbrenneffekt: Nach einer intensiven EMS-Einheit arbeitet dein Stoffwechsel noch Stunden auf erhöhtem Niveau.
Unsere Empfehlung für nachhaltige Ergebnisse: wöchentliches EMS-Training für den Muskelerhalt, dazu eine eiweißreiche, alltagstaugliche Ernährung ohne Verbote - und Geduld. Ein halbes Kilo pro Woche ist realistisch und bleibt dauerhaft unten. Bei deinem Probetermin sprechen wir offen über deine Ziele und was in welchem Zeitraum erreichbar ist.$alt$ || '%';

UPDATE "BlogPost"
SET "content" = replace("content", $alt$Mythos 4: '20 Minuten können nicht reichen.' Können sie - weil bis zu 90% der Muskelfasern gleichzeitig arbeiten statt nacheinander. Die Intensität ersetzt die Dauer.$alt$, $neu$Mythos 4: '20 Minuten können nicht reichen.' Für ein Krafttraining können sie reichen - weil bei EMS viele Muskelgruppen gleichzeitig arbeiten statt nacheinander. Die Intensität ersetzt die Dauer, nicht aber die Regelmäßigkeit.$neu$)
WHERE "slug" = '5-mythen-ueber-ems'
  AND "content" LIKE '%' || $alt$Mythos 4: '20 Minuten können nicht reichen.' Können sie - weil bis zu 90% der Muskelfasern gleichzeitig arbeiten statt nacheinander. Die Intensität ersetzt die Dauer.$alt$ || '%';

UPDATE "BlogPost"
SET "content" = replace("content", $alt$Mythos 1: 'EMS ist gefährlich.' Falsch. Die Impulse sind niederfrequent und wirken nur auf die Skelettmuskulatur. In Physiotherapie und Reha wird die Methode seit Jahrzehnten eingesetzt. Wichtig ist professionelle Betreuung - bei uns Standard.$alt$, $neu$Mythos 1: 'EMS ist für jeden gefährlich.' So pauschal stimmt das nicht - entscheidend sind Betreuung und Vorgeschichte. Deshalb wird bei uns jede Einheit persönlich begleitet und die Intensität langsam aufgebaut. Es gibt aber echte Gegenanzeigen: unter anderem Herzschrittmacher, Schwangerschaft, Epilepsie, akute Entzündungen und fieberhafte Infekte. Sprich im Zweifel vorher mit deinem Arzt - und sag uns beim Probetermin, was bei dir vorliegt.$neu$)
WHERE "slug" = '5-mythen-ueber-ems'
  AND "content" LIKE '%' || $alt$Mythos 1: 'EMS ist gefährlich.' Falsch. Die Impulse sind niederfrequent und wirken nur auf die Skelettmuskulatur. In Physiotherapie und Reha wird die Methode seit Jahrzehnten eingesetzt. Wichtig ist professionelle Betreuung - bei uns Standard.$alt$ || '%';

-- Dieselbe Sorte Aussage in den häufigen Fragen.
--
-- Drei Antworten aus dem Seed versprachen mehr, als sich belegen lässt:
-- EMS "eignet sich auch bei Rückenbeschwerden" (eine Heilaussage),
-- "ist gut erforscht" (ohne Quelle) und konkrete Zeiträume, nach denen
-- man Ergebnisse sehe ("4-6 Wochen", "8-12 Wochen"). Eine vierte nannte
-- eine Wochendosis, die "für spürbare Ergebnisse reicht".
--
-- Ersetzt werden ausschließlich die ANTWORTEN, nie die Fragen: Der Seed
-- legt die Einträge über die Frage an. Eine geänderte Frage ergäbe beim
-- nächsten Lauf einen zweiten Eintrag statt einer Änderung.
--
-- Wieder mit replace() und einer LIKE-Bedingung: Was im Adminbereich
-- schon anders formuliert wurde, bleibt unangetastet, und ein zweiter
-- Lauf ändert nichts mehr.

UPDATE "FaqItem"
SET "answer" = replace("answer", $alt$Ja, durch den Verzicht auf schwere Gewichte ist EMS-Training besonders schonend für Gelenke und Wirbelsäule und eignet sich auch bei Rückenbeschwerden.$alt$, $neu$Es kommt ohne schwere Gewichte aus - die Belastung für Gelenke und Wirbelsäule ist dadurch geringer als beim Hanteltraining. Ob es bei bestehenden Beschwerden für dich in Frage kommt, klärst du vorher bitte mit deinem Arzt; wir sind kein medizinischer Betrieb.$neu$)
WHERE "question" = 'Ist EMS-Training gelenkschonend?'
  AND "answer" LIKE '%' || $alt$Ja, durch den Verzicht auf schwere Gewichte ist EMS-Training besonders schonend für Gelenke und Wirbelsäule und eignet sich auch bei Rückenbeschwerden.$alt$ || '%';

UPDATE "FaqItem"
SET "answer" = replace("answer", $alt$Ja. EMS wird seit Jahrzehnten in Physiotherapie und Sport eingesetzt und ist gut erforscht. Bei uns trainierst du ausschließlich unter persönlicher Anleitung, mit modernen, geprüften Geräten und nach einem Gesundheitscheck beim ersten Termin.$alt$, $neu$Bei uns trainierst du ausschließlich unter persönlicher Anleitung, mit geprüften Geräten, und wir gehen beim ersten Termin gemeinsam durch, was bei dir zu beachten ist. Entscheidend ist die Betreuung - und dass du uns sagst, wenn etwas vorliegt. Die Fälle, in denen wir grundsätzlich nicht trainieren, stehen bei der Frage „Für wen ist EMS nicht geeignet?“.$neu$)
WHERE "question" = 'Ist EMS-Training sicher?'
  AND "answer" LIKE '%' || $alt$Ja. EMS wird seit Jahrzehnten in Physiotherapie und Sport eingesetzt und ist gut erforscht. Bei uns trainierst du ausschließlich unter persönlicher Anleitung, mit modernen, geprüften Geräten und nach einem Gesundheitscheck beim ersten Termin.$alt$ || '%';

UPDATE "FaqItem"
SET "answer" = replace("answer", $alt$Die meisten Mitglieder spüren nach 4-6 Wochen deutlich mehr Kraft und Spannung im Körper. Sichtbare Veränderungen zeigen sich je nach Ausgangslage und Ernährung typischerweise nach 8-12 Wochen regelmäßigem Training.$alt$, $neu$Das ist von Mensch zu Mensch sehr unterschiedlich und hängt an Ausgangslage, Ernährung, Schlaf und vor allem an der Regelmäßigkeit. Eine seriöse Zahl können wir dir hier nicht nennen - was in deinem Fall realistisch ist, besprechen wir beim Probetermin offen.$neu$)
WHERE "question" = 'Wie schnell sehe ich erste Ergebnisse?'
  AND "answer" LIKE '%' || $alt$Die meisten Mitglieder spüren nach 4-6 Wochen deutlich mehr Kraft und Spannung im Körper. Sichtbare Veränderungen zeigen sich je nach Ausgangslage und Ernährung typischerweise nach 8-12 Wochen regelmäßigem Training.$alt$ || '%';

UPDATE "FaqItem"
SET "answer" = replace("answer", $alt$Ein EMS-Training pro Woche mit einer Dauer von rund 20 Minuten reicht für spürbare Ergebnisse - deutlich weniger Zeitaufwand als beim klassischen Fitnesstraining.$alt$, $neu$Einmal pro Woche, rund 20 Minuten. Darauf ist das Training ausgelegt: kurz, dafür intensiv und mit genug Abstand dazwischen, damit sich die Muskulatur erholen kann. Das ist deutlich weniger Zeitaufwand als klassisches Fitnesstraining.$neu$)
WHERE "question" = 'Wie oft muss ich trainieren?'
  AND "answer" LIKE '%' || $alt$Ein EMS-Training pro Woche mit einer Dauer von rund 20 Minuten reicht für spürbare Ergebnisse - deutlich weniger Zeitaufwand als beim klassischen Fitnesstraining.$alt$ || '%';

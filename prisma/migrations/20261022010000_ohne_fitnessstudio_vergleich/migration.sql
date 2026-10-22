-- Keine Vergleiche mit Fitnessstudios mehr.
--
-- Die Website macht andere Trainingsformen nicht schlecht - das gilt auch
-- für die Texte in der Datenbank. Zwei Antworten der häufigen Fragen
-- (aus 20260911160000_faq_aussagen) und ein Satz im Blogbeitrag für
-- Berufstätige (aus dem Seed) zogen noch den Vergleich.
--
-- Wie dort: replace() mit LIKE-Bedingung. Ersetzt wird nur genau der alte
-- Wortlaut - was im Adminbereich schon anders formuliert wurde, bleibt
-- unangetastet, und ein zweiter Lauf ändert nichts mehr.

UPDATE "FaqItem"
SET "answer" = replace("answer", $alt$ Das ist deutlich weniger Zeitaufwand als klassisches Fitnesstraining.$alt$, '')
WHERE "question" = 'Wie oft muss ich trainieren?'
  AND "answer" LIKE '%' || $alt$ Das ist deutlich weniger Zeitaufwand als klassisches Fitnesstraining.$alt$ || '%';

UPDATE "FaqItem"
SET "answer" = replace("answer", $alt$die Belastung für Gelenke und Wirbelsäule ist dadurch geringer als beim Hanteltraining.$alt$, $neu$es lastet also kein zusätzliches Gewicht auf Gelenken und Wirbelsäule.$neu$)
WHERE "question" = 'Ist EMS-Training gelenkschonend?'
  AND "answer" LIKE '%' || $alt$die Belastung für Gelenke und Wirbelsäule ist dadurch geringer als beim Hanteltraining.$alt$ || '%';

UPDATE "BlogPost"
SET "content" = replace("content", $alt$ - ganz ohne stundenlange Einheiten im Fitnessstudio. So bleibt$alt$, $neu$ - einmal pro Woche, fest im Kalender. So bleibt$neu$)
WHERE "content" LIKE '%' || $alt$ - ganz ohne stundenlange Einheiten im Fitnessstudio. So bleibt$alt$ || '%';

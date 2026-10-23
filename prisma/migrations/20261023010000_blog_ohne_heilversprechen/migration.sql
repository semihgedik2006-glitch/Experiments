-- Zwei Blogbeiträge vorsichtiger formuliert.
--
-- "EMS gegen Rückenschmerzen" klang nach Heilversprechen ("Genau hier setzt
-- EMS an", "an dein Beschwerdebild angepasst") - für Werbung mit Gesundheit
-- gelten strenge Regeln. Der Beitrag sagt jetzt, was Training leisten kann
-- und was nicht, wie die Fragen-Seite /fragen/ruecken.
--
-- "Abnehmen mit EMS" verglich EMS mit "fast jedem anderen Training" -
-- Vergleiche mit anderen Trainingsformen ziehen wir nicht mehr.
--
-- Wie in 20261022010000_ohne_fitnessstudio_vergleich: Geändert wird nur,
-- was noch genau den alten Wortlaut hat. Was im Adminbereich schon anders
-- formuliert wurde, bleibt unangetastet; ein zweiter Lauf ändert nichts.

UPDATE "BlogPost"
SET "title" = $neu$EMS-Training und der Rücken: Was Training leisten kann – und was nicht$neu$
WHERE "slug" = 'ems-gegen-rueckenschmerzen'
  AND "title" = $alt$EMS gegen Rückenschmerzen: Was steckt dahinter?$alt$;

UPDATE "BlogPost"
SET "excerpt" = $neu$Viele, die viel sitzen, spüren ihren Rücken. Was EMS-Training für Rücken und Rumpf bedeutet, wo die Grenzen sind und wann der Arzt zuerst dran ist.$neu$
WHERE "slug" = 'ems-gegen-rueckenschmerzen'
  AND "excerpt" = $alt$Rückenschmerzen gehören zu den häufigsten Beschwerden überhaupt. Warum EMS-Training gerade die tiefe Rumpfmuskulatur erreicht, die klassisches Training oft verfehlt.$alt$;

UPDATE "BlogPost"
SET "content" = $neu$Wer viel sitzt, kennt das Ziehen im unteren Rücken. Rückenbeschwerden können viele Ursachen haben – welche bei dir dahintersteckt, kann nur ein Arzt klären. Bei anhaltenden oder starken Schmerzen gehört die Abklärung deshalb zuerst in die Praxis, nicht ins Studio.
Was EMS-Training leisten kann: Es kräftigt die Muskulatur – auch an Rücken und Rumpf – und kommt dabei ohne schwere Gewichte aus. Eine Therapie ist es nicht, und eine Heilung versprechen wir nicht.
Wichtig ist die Betreuung: Bei Körperformen ist bei jeder Einheit ein Trainer dabei, und die Impulsstärke wird für jede Muskelgruppe einzeln eingestellt. Wenn bei dir etwas vorliegt, sag es uns beim ersten Termin.
Unser Tipp: Ergänze das wöchentliche Training mit kleinen Gewohnheiten im Alltag – regelmäßig aufstehen, Schulterkreisen am Schreibtisch, ein kurzer Spaziergang in der Mittagspause.$neu$
WHERE "slug" = 'ems-gegen-rueckenschmerzen'
  AND "content" LIKE $alt$Wer viel sitzt, kennt das Ziehen im unteren Rücken. Die Ursache ist selten ein einzelnes Ereignis%$alt$
  AND "content" LIKE '%' || $alt$an dein Beschwerdebild angepasst.$alt$ || '%';

UPDATE "BlogPost"
SET "content" = replace("content", $alt$Was EMS aber besser kann als fast jedes andere Training: In kurzer Zeit viel Muskulatur aktivieren. Mehr Muskelmasse bedeutet einen höheren Grundumsatz - dein Körper verbrennt also auch in Ruhe mehr Kalorien. Genau dieser Effekt macht EMS zu einem starken Partner beim Abnehmen.$alt$, $neu$Was EMS dabei beitragen kann: In kurzer Zeit viel Muskulatur trainieren. Muskeln zu erhalten und aufzubauen ist beim Abnehmen sinnvoll – EMS-Training kann so ein Baustein sein, neben der Ernährung.$neu$)
WHERE "slug" = 'abnehmen-mit-ems'
  AND "content" LIKE '%' || $alt$Was EMS aber besser kann als fast jedes andere Training$alt$ || '%';

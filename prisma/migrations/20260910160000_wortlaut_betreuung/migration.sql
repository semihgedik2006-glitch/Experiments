-- Wortlaut: "1:1" wird überall zu "persönlich".
--
-- Im Code steht der neue Wortlaut schon. Die Blogbeiträge liegen aber in
-- der Datenbank, und das Anlege-Skript überschreibt vorhandene Beiträge
-- bewusst nicht - sonst wären eigene Änderungen bei jedem Durchlauf weg.
-- Deshalb hier einmalig als Datenänderung.
UPDATE "BlogPost"
   SET content = replace(content, '1:1 begleitet', 'persönlich begleitet'),
       excerpt = replace(excerpt, '1:1', 'persönlich'),
       title   = replace(title,   '1:1', 'persönlich')
 WHERE content LIKE '%1:1%' OR excerpt LIKE '%1:1%' OR title LIKE '%1:1%';

UPDATE "FaqItem"
   SET question = replace(question, '1:1', 'persönlich'),
       answer   = replace(answer,   '1:1', 'persönlich')
 WHERE question LIKE '%1:1%' OR answer LIKE '%1:1%';

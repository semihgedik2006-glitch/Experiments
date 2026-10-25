-- Die englische Fassung der Texte, die heute auf der Website stehen.
--
-- Fragen & Antworten und Blogbeiträge sind im Adminbereich gepflegt und
-- bekommen hier einmalig ihre Übersetzung. Danach pflegt das Studio sie im
-- Adminbereich unter "Englische Fassung" weiter.
--
-- Wie in den bisherigen Textmigrationen: Übersetzt wird nur, was noch genau
-- den deutschen Wortlaut hat, von dem die Übersetzung stammt - wurde der
-- deutsche Text im Adminbereich inzwischen geändert, passte die Übersetzung
-- nicht mehr und bleibt weg (dann steht dort der deutsche Text). Und nur,
-- wo noch keine englische Fassung eingetragen ist; ein zweiter Lauf ändert
-- nichts.
--
-- Öffnungszeiten brauchen keinen Eintrag: Sie werden auf der englischen
-- Seite aus dem deutschen Text übersetzt (siehe @/lib/i18n/oeffnungszeiten).

UPDATE "FaqItem"
SET "questionEn" = $t$How often do I need to train?$t$, "answerEn" = $t$Once a week, for about 20 minutes. That is what the training is designed for: short but intense, with enough time in between for your muscles to recover.$t$
WHERE "question" = $t$Wie oft muss ich trainieren?$t$
  AND "answer" = $t$Einmal pro Woche, rund 20 Minuten. Darauf ist das Training ausgelegt: kurz, dafür intensiv und mit genug Abstand dazwischen, damit sich die Muskulatur erholen kann.$t$
  AND "questionEn" IS NULL AND "answerEn" IS NULL;

UPDATE "FaqItem"
SET "questionEn" = $t$Is EMS training suitable for beginners?$t$, "answerEn" = $t$Yes. The training is tailored to your fitness level, and our trainers stay with you throughout – whether you are a beginner or experienced.$t$
WHERE "question" = $t$Ist EMS-Training für Anfänger geeignet?$t$
  AND "answer" = $t$Ja. Das Training wird individuell auf deinen Fitnesslevel abgestimmt und von unseren Trainern durchgehend begleitet - unabhängig davon, ob du Anfänger oder erfahren bist.$t$
  AND "questionEn" IS NULL AND "answerEn" IS NULL;

UPDATE "FaqItem"
SET "questionEn" = $t$Is EMS training easy on the joints?$t$, "answerEn" = $t$It works without heavy weights – so there is no extra load on your joints and spine. If you have existing complaints, please check with your doctor beforehand whether it is right for you; we are not a medical practice.$t$
WHERE "question" = $t$Ist EMS-Training gelenkschonend?$t$
  AND "answer" = $t$Es kommt ohne schwere Gewichte aus - es lastet also kein zusätzliches Gewicht auf Gelenken und Wirbelsäule. Ob es bei bestehenden Beschwerden für dich in Frage kommt, klärst du vorher bitte mit deinem Arzt; wir sind kein medizinischer Betrieb.$t$
  AND "questionEn" IS NULL AND "answerEn" IS NULL;

UPDATE "FaqItem"
SET "questionEn" = $t$What should I bring to training?$t$, "answerEn" = $t$Comfortable sportswear plus one large and one small towel are all you need. We provide the EMS equipment at the studio.$t$
WHERE "question" = $t$Was sollte ich zum Training mitbringen?$t$
  AND "answer" = $t$Bequeme Sportkleidung sowie ein großes und ein kleines Handtuch reichen aus. Die EMS-Ausrüstung stellen wir dir im Studio zur Verfügung.$t$
  AND "questionEn" IS NULL AND "answerEn" IS NULL;

UPDATE "FaqItem"
SET "questionEn" = $t$Can I try the training for free?$t$, "answerEn" = $t$Yes – at a no-obligation trial session you get to know the studio, our team and the EMS technology at no cost.$t$
WHERE "question" = $t$Kann ich das Training kostenlos testen?$t$
  AND "answer" = $t$Ja, bei einem unverbindlichen Probetermin lernst du das Studio, unser Team und die EMS-Technologie ganz ohne Kosten kennen.$t$
  AND "questionEn" IS NULL AND "answerEn" IS NULL;

UPDATE "FaqItem"
SET "questionEn" = $t$How quickly will I see first results?$t$, "answerEn" = $t$That varies a lot from person to person and depends on your starting point, nutrition, sleep and above all on regularity. We cannot give you a reliable number here – we will talk openly about what is realistic in your case at your trial session.$t$
WHERE "question" = $t$Wie schnell sehe ich erste Ergebnisse?$t$
  AND "answer" = $t$Das ist von Mensch zu Mensch sehr unterschiedlich und hängt an Ausgangslage, Ernährung, Schlaf und vor allem an der Regelmäßigkeit. Eine seriöse Zahl können wir dir hier nicht nennen - was in deinem Fall realistisch ist, besprechen wir beim Probetermin offen.$t$
  AND "questionEn" IS NULL AND "answerEn" IS NULL;

UPDATE "FaqItem"
SET "questionEn" = $t$Is EMS training safe?$t$, "answerEn" = $t$With us you only ever train under personal guidance and with tested equipment, and at your first appointment we go through together what needs to be considered in your case. What matters is the supervision – and that you tell us if anything applies to you. The cases in which we do not train at all are listed under the question “Who is EMS not suitable for?”.$t$
WHERE "question" = $t$Ist EMS-Training sicher?$t$
  AND "answer" = $t$Bei uns trainierst du ausschließlich unter persönlicher Anleitung, mit geprüften Geräten, und wir gehen beim ersten Termin gemeinsam durch, was bei dir zu beachten ist. Entscheidend ist die Betreuung - und dass du uns sagst, wenn etwas vorliegt. Die Fälle, in denen wir grundsätzlich nicht trainieren, stehen bei der Frage „Für wen ist EMS nicht geeignet?“.$t$
  AND "questionEn" IS NULL AND "answerEn" IS NULL;

UPDATE "FaqItem"
SET "questionEn" = $t$Will I get sore muscles?$t$, "answerEn" = $t$After the first sessions, very likely – even in places where you did not know you had muscles. That is a good sign: it shows how deep the training works. It settles down over time.$t$
WHERE "question" = $t$Bekomme ich Muskelkater?$t$
  AND "answer" = $t$Nach den ersten Einheiten sehr wahrscheinlich - und zwar auch an Stellen, von denen du nicht wusstest, dass dort Muskeln sind. Das ist ein gutes Zeichen: Es zeigt, wie tief das Training wirkt. Mit der Zeit reguliert sich das.$t$
  AND "questionEn" IS NULL AND "answerEn" IS NULL;

UPDATE "FaqItem"
SET "questionEn" = $t$Who is EMS not suitable for?$t$, "answerEn" = $t$With pacemakers and other electronic implants, during pregnancy, with epilepsy, acute illnesses or thrombosis, we do not offer EMS training at all. If in doubt, check briefly with your doctor – we will give you honest advice.$t$
WHERE "question" = $t$Für wen ist EMS nicht geeignet?$t$
  AND "answer" = $t$Bei Herzschrittmachern und anderen elektronischen Implantaten, in der Schwangerschaft, bei Epilepsie, akuten Erkrankungen oder Thrombosen verzichten wir grundsätzlich auf EMS-Training. Im Zweifel klärst du das kurz mit deinem Arzt - wir beraten dich ehrlich.$t$
  AND "questionEn" IS NULL AND "answerEn" IS NULL;

UPDATE "FaqItem"
SET "questionEn" = $t$Do I need to bring or prepare anything?$t$, "answerEn" = $t$No. We provide functional underwear and the EMS equipment. All you need is yourself, one large and one small towel – and a little curiosity.$t$
WHERE "question" = $t$Muss ich etwas mitbringen oder vorbereiten?$t$
  AND "answer" = $t$Nein. Funktionsunterwäsche und die EMS-Ausrüstung stellen wir. Du brauchst nur dich selbst, ein großes und ein kleines Handtuch - und etwas Neugier.$t$
  AND "questionEn" IS NULL AND "answerEn" IS NULL;

UPDATE "FaqItem"
SET "questionEn" = $t$How much does a membership cost?$t$, "answerEn" = $t$That depends on your goals and the training package that suits you. We discuss the terms personally and transparently at your free trial session – with no hidden costs and no pressure.$t$
WHERE "question" = $t$Was kostet eine Mitgliedschaft?$t$
  AND "answer" = $t$Das hängt von deinen Zielen und dem passenden Trainingspaket ab. Wir besprechen die Konditionen persönlich und transparent bei deinem kostenlosen Probetermin - ohne versteckte Kosten und ohne Druck.$t$
  AND "questionEn" IS NULL AND "answerEn" IS NULL;

UPDATE "BlogPost"
SET "titleEn" = $t$What is EMS training and how does it work?$t$, "excerptEn" = $t$EMS stands for electrical muscle stimulation. We explain how the training works and why 20 minutes a week is enough.$t$, "contentEn" = $t$EMS training combines classic exercises with electrical impulses that act directly on your muscles through a special vest. The impulses also reach deeper layers of muscle that are hard to target with classic exercises. That is why a session with us lasts about 20 minutes and takes place once a week – how strong the effect is depends on the intensity your trainer sets together with you.$t$
WHERE "slug" = $t$was-ist-ems-training$t$
  AND "title" = $t$Was ist EMS-Training und wie funktioniert es?$t$
  AND "titleEn" IS NULL AND "excerptEn" IS NULL AND "contentEn" IS NULL;

UPDATE "BlogPost"
SET "titleEn" = $t$EMS training for busy professionals$t$, "excerptEn" = $t$No time lost on travel, changing or long training sessions. This is how effective training fits into a full schedule.$t$, "contentEn" = $t$Especially for working people between 30 and 70, time is the scarcest resource. An EMS session at Körperformen takes only about 20 minutes including advice – once a week, fixed in your calendar. That keeps training doable even when everyday life gets stressful.$t$
WHERE "slug" = $t$ems-fuer-berufstaetige$t$
  AND "title" = $t$EMS-Training für Berufstätige mit wenig Zeit$t$
  AND "titleEn" IS NULL AND "excerptEn" IS NULL AND "contentEn" IS NULL;

UPDATE "BlogPost"
SET "titleEn" = $t$EMS training and your back: what training can do – and what it cannot$t$, "excerptEn" = $t$Many people who sit a lot feel it in their back. What EMS training means for your back and core, where the limits are, and when to see a doctor first.$t$, "contentEn" = $t$Anyone who sits a lot knows that pull in the lower back. Back complaints can have many causes – only a doctor can tell which one applies to you. With persistent or severe pain, the first step is a medical check-up, not the studio.
What EMS training can do: it strengthens your muscles – including those of your back and core – without heavy weights. It is not a therapy, and we do not promise any cure.
What matters is the supervision: at Körperformen a trainer is with you in every session, and the impulse strength is set individually for each muscle group. If anything applies to you, tell us at your first appointment.
Our tip: add small everyday habits to your weekly training – stand up regularly, roll your shoulders at your desk, take a short walk at lunchtime.$t$
WHERE "slug" = $t$ems-gegen-rueckenschmerzen$t$
  AND "title" = $t$EMS-Training und der Rücken: Was Training leisten kann – und was nicht$t$
  AND "titleEn" IS NULL AND "excerptEn" IS NULL AND "contentEn" IS NULL;

UPDATE "BlogPost"
SET "titleEn" = $t$Losing weight with EMS: a realistic look$t$, "excerptEn" = $t$Can you really lose weight with 20 minutes a week? Yes – but differently from what some providers' ads promise. An honest look.$t$, "contentEn" = $t$The honest answer first: EMS is not a miracle cure. Losing weight only works with a calorie deficit – no technology changes that.
What EMS can contribute: training a lot of muscle in a short time. Maintaining and building muscle makes sense when you are losing weight – EMS training can be one building block, alongside nutrition.
Our recommendation for results that last: weekly EMS training to maintain your muscles, a protein-rich, everyday-friendly diet without bans – and patience. How fast it goes differs from person to person and depends above all on whether your diet plays along. At your trial session we talk openly about your goals and what you can realistically achieve, and in what time.$t$
WHERE "slug" = $t$abnehmen-mit-ems$t$
  AND "title" = $t$Abnehmen mit EMS: realistisch erklärt$t$
  AND "titleEn" IS NULL AND "excerptEn" IS NULL AND "contentEn" IS NULL;

UPDATE "BlogPost"
SET "titleEn" = $t$5 myths about EMS training – fact-checked$t$, "excerptEn" = $t$Electricity on your body? Stubborn rumours persist. We clear up the five most common myths.$t$, "contentEn" = $t$Myth 1: 'EMS is dangerous for everyone.' Put that generally, it is not true – what matters is supervision and your medical history. That is why every session with us is personally supervised and the intensity is built up slowly. There are real contraindications, though: among others pacemakers, pregnancy, epilepsy, acute inflammation and feverish infections. If in doubt, talk to your doctor first – and tell us at your trial session what applies to you.
Myth 2: 'It is only for professional athletes.' Quite the opposite: most of our members are working people between 30 and 70, many of them beginners. The training is adapted to every level.
Myth 3: 'You do not have to move.' You do. EMS amplifies active movements – if you just stand there limply, you give away most of the effect. That is why you do simple exercises with us while the impulses work.
Myth 4: '20 minutes cannot be enough.' For strength training they can be – because with EMS many muscle groups work at the same time instead of one after another. The intensity replaces the duration, but not the regularity.
Myth 5: 'EMS replaces all movement in everyday life.' No. EMS is a highly efficient strength training, but walking, cycling and taking the stairs remain valuable for your heart and circulation. The combination is what keeps you fit.$t$
WHERE "slug" = $t$5-mythen-ueber-ems$t$
  AND "title" = $t$5 Mythen über EMS-Training im Faktencheck$t$
  AND "titleEn" IS NULL AND "excerptEn" IS NULL AND "contentEn" IS NULL;

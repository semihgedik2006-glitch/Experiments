# -*- coding: utf-8 -*-
"""Take the original Lernzettel markdown VERBATIM and only ADD:
   - a navigation/front-matter chapter (quick access + formula sheet)
   - invisible '^^' index markers after headings (for the keyword index)
   - a few BEISPIEL boxes sourced from the study materials
No existing line is modified or removed."""
import io, sys

SRC, DST = sys.argv[1], sys.argv[2]
orig = io.open(SRC, encoding="utf-8").read().split("\n")

# ---------------------------------------------------------------- front matter
FRONT = u"""
# Schnellzugriff: Navigation & Formeln

## So nutzt du diesen Lernzettel in der Klausur

- **Farbige Griffmarken am rechten Seitenrand** zeigen die Kapitelnummer (1–9). Blättern nach Position statt nach Seitenzahl.
- **Stichwortverzeichnis** ganz hinten: alphabetisch mit Seitenzahl – der schnellste Weg zu einem Begriff.
- **„Wo finde ich was?"** (unten): typische Frageformulierungen → passendes Kapitel.
- **Box-Farben:** grün = Definition, Merksatz oder Formel · blau = Beispiel · orange = eigene Ergänzung (**[EXTRA]**, nicht aus den Unterlagen).
- Inhaltlich ist dieser Lernzettel identisch mit der ersten Fassung – ergänzt wurden ausschließlich Navigation und Beispiele aus den Unterlagen.

## Wo finde ich was? (Frageformulierung → Kapitel)

| Wenn in der Klausur steht … | Kapitel |
|---|---|
| Dienstleistung vs. Sachgut, Immaterialität, Uno-actu, externer Faktor, Ausprägungsformen | **1** |
| Kompetenzen, Handlungskompetenz, Anforderungen an DL-Mitarbeiter | **1** |
| Drei-Sektoren-Modell, Tertiarisierung, Branchenzahlen | **1** |
| Sender/Empfänger, Sende- und Informationskanäle, kommunikative Kompetenz | **2** |
| Axiome von Watzlawick, Eisbergmodell, psychologischer Nebel | **2** |
| Schulz von Thun, Vier-Ohren-Modell, Qualitätsstufen der Kommunikation | **2** |
| Nonverbale Kommunikation, Mimik/Gestik, Distanzzonen, Staffage, 55-38-7 | **2** |
| Passive/aktive Telefonate, Begrüßungsformel, Terminvereinbarung und -sicherung | **3** |
| DSGVO, UWG, Kaltakquise, Opt-in, Bußgelder | **3** |
| Bedürfnis/Bedarf/Nachfrage, Maslow, Kaufmotive, „Was kaufen Kunden?" | **4** |
| Phasen des Beratungsgesprächs, Hot Button, OPAL, Einwand vs. Vorwand | **4** |
| Fragearten, aktives Zuhören, positive Sprache, belohnende Reize, Reaktanz | **4** |
| Nutzenargumentation, Abschlusssignale, Probeabschluss, After-Sales | **4** |
| Up-Selling, Cross-Selling, Zusatzverkäufe | **4** |
| Service-Definition, Servicemanagement, Touchpoints, Customer Experience | **5** |
| Zeit und Freizeit, Funktionen der Freizeit, Werte, Konsequenzsummenspiel | **5** |
| Motivation, Selbstkonkordanz, SMART, Transtheoretisches Modell (Stages of Change) | **5** |
| Servicestrategie, Serviceversprechen, Kano-Modell, Servicestandard/-drehbuch, Servicekultur | **5** |
| Kundenzufriedenheit, CD-Paradigma, Erfolgskette, Kundenbindung, NPS | **5** |
| Beschwerden, Recovery-Paradox, Beschwerdemanagementprozess, Beschwerde vor Ort | **6** |
| Kennzahlen, Formeln, Rechenaufgaben, absolute/relative Kennzahlen | **7** |
| Offizielle Wiederholungsfragen Tag 1 und Tag 2 mit Antworten | **8** |
| Alles auf einen Blick kurz vor der Klausur | **9** |

## Formelsammlung (alle Formeln auf einen Blick)

**FORMELN**
**Telefonquote** = (telefonisch vereinbarte Beratungstermine ÷ telefonische Interessentenkontakte) × 100
**Passive Telefonquote** = (passiv vereinbarte Termine ÷ Interessenten**anrufe**) × 100
**Aktive Telefonquote** = (aktiv vereinbarte Termine ÷ aktiv **angerufene** Interessenten) × 100
**Termineinhaltungsquote** = (erschienene Termine ÷ vereinbarte Termine) × 100
**Abschlussquote** = (Verkaufsabschlüsse ÷ durchgeführte Beratungen) × 100
**Fluktuationsquote** = (Abgänge ÷ durchschnittlicher Mitgliederbestand) × 100
**Beschwerdequote** = (Anzahl Beschwerden ÷ durchschnittlicher Kundenbestand) × 100
**Net Promoter Score** = % Promotoren (9–10) − % Kritiker (0–6)
**Bedarf** = Bedürfnis + Kaufkraft
**Ø Mitgliederbestand:** (Jahresanfang + Jahresende) ÷ 2 · oder Summe der 12 Monatsendbestände ÷ 12 · oder (Monatsanfang Januar + 12 Monatsendbestände) ÷ 13

## Alle Reihenfolgen auf einen Blick

| Ablauf | Reihenfolge |
|---|---|
| **Erfolgskette** | Marketing → Kontakt → Termin → Beratung → Abschluss → Service → Kundenbindung |
| **Passives Telefonat** | Vorbereitung → Begrüßung → Gesprächsübernahme → Terminvereinbarung & -sicherung → Abschluss → Nachbereitung |
| **Aktives Telefonat** | Vorbereitung → Begrüßung → Umgang mit Kundenreaktionen → Terminvereinbarung & -sicherung → Gesprächsabschluss |
| **Beratungsgespräch** | Vorbereitung → Begrüßung → Bedarfsanalyse → Angebotspräsentation → Abschluss → Nachbereitung |
| **Bedarfsanalyse** | Bedürfnisse herausfinden → Bedarf ableiten (OPAL) → Einwandvorbehandlung → Feedback |
| **Nutzenorientierte Argumentation** | Eigenschaften → Vorteile → individueller Nutzen |
| **Abschlussphase** | Abschlusssignale erkennen → Probeabschluss → Einwandbehandlung → Abschluss → After-Sales |
| **Entstehung der Nachfrage** | Mangel → Bedürfnis → Bedarf → Nachfrage |
| **Erfolgskette Qualitätsmanagement** | Erstkontakt → Kundenzufriedenheit → Kundenloyalität → Kundenbindung → ökonomischer Erfolg |
| **Beschwerdemanagement (direkt)** | Stimulierung → Annahme → Bearbeitung → Reaktion |
| **Beschwerde vor Ort** | wahrnehmen → ernst nehmen → Lösung anbieten |
| **Stages of Change** | Absichtslosigkeit → Absichtsbildung → Vorbereitung → Handlung → Aufrechterhaltung |
| **Managementkreislauf** | Ist-Analyse → Ziele setzen → Planen → Entscheiden → Realisieren → Kontrollieren |
| **Prozesselemente Servicemanagement** | Servicestrategie → Serviceversprechen → Servicefaktoren → Serviceorganisation & -kultur → Basiselemente |

## Zahlen, die man kennen sollte

| Zahl | Bedeutung |
|---|---|
| **55-38-7** | Sympathie: 55 % nonverbal, 38 % paraverbal, 7 % verbal |
| **75–80 %** | Anteil der Kommunikation über die Stimme |
| **15 %** | Anteil rein gehörter Informationen, den Menschen speichern |
| **7 ± 2** | Merkeinheiten im Kurzzeitgedächtnis |
| **80 / 20** | Redeanteil Bedarfsanalyse: Kunde 80 %, Berater 20 % |
| **3.500 EUR** | Wert eines Interessentenanrufs |
| **2–3×** | Klingeln lassen vor dem Abheben |
| **20–30 Sekunden** | entscheiden über den Verlauf eines Telefonats |
| **6 %** | Anteil unzufriedener Kunden, die sich beschweren |
| **1 : 50** | eine Beschwerde ↔ bis zu 50 unzufriedene Kunden |
| **4 / 8 / 16** | Personen, denen von positivem / negativem / schwer negativem Erlebnis erzählt wird |
| **5×** | Neukundengewinnung ist ca. 5-mal teurer als Kundenbindung |
| **9–10 / 7–8 / 0–6** | NPS: Promotoren / passiv Zufriedene / Kritiker |
| **30 Tage / 6 Monate** | TTM: Vorbereitung / Absichtsbildung und Aufrechterhaltung |
| **45 / 120 / 350 cm** | Distanzzonen: intim / persönlich / gesellschaftlich (darüber öffentlich) |
| **75,3 %** | Erwerbstätige im tertiären Sektor (2023) |
| **300.000 EUR** | mögliches Bußgeld nach § 20 UWG |
"""

# ------------------------------------------------- index markers (heading -> terms)
IDX = {
 u"# 1. Dienstleistungen & Dienstleistungsbranche": u"Dienstleistung | Ausprägungsformen von Dienstleistungen",
 u"## 1.1 Definition der Dienstleistung (3 Dimensionen)": u"Potenzialorientierung | Prozessorientierung | Ergebnisorientierung",
 u"## 1.3 Eigenschaften von Dienstleistungen (klausurrelevant!)": u"Immaterialität | Externer Faktor | Uno-actu-Prinzip | Nicht-Lagerfähigkeit | Prosument | Sachgüter vs. Dienstleistungen",
 u"## 1.4 Drei-Sektoren-Modell & Tertiarisierung": u"Drei-Sektoren-Modell | Tertiarisierung | Tertiärer Sektor",
 u"## 1.5 Anforderungen an Mitarbeiter & Kompetenzen": u"Kompetenz | Fachkompetenz | Methodenkompetenz | Sozialkompetenz | Handlungskompetenz | Empathie",
 u"# 2. Grundlagen der Kommunikation": u"Kommunikation | Sender und Empfänger",
 u"## 2.1 Basisbegriffe": u"Sendekanäle | Informationskanäle | Kommunikative Kompetenz | Lasswell-Formel",
 u"## 2.2 Qualitätsstufen der Kommunikation (4 Stufen)": u"Qualitätsstufen der Kommunikation",
 u"## 2.3 Die 5 Axiome von Watzlawick": u"Watzlawick | Axiome | Eisbergmodell | Psychologischer Nebel | Sachebene | Beziehungsebene | Interpunktion | Metakommunikation",
 u"## 2.4 Kommunikationsquadrat von Schulz von Thun": u"Schulz von Thun | Vier-Ohren-Modell | Kommunikationsquadrat | Selbstoffenbarung | Appell",
 u"## 2.5 Verbale Kommunikation": u"Syntax | Semantik | Pragmatik | Denotation | Konnotation | Diskurs | Chomsky",
 u"## 2.6 Paraverbale Kommunikation": u"Paraverbale Kommunikation | Stimme | Tonalität",
 u"## 2.7 Nonverbale Kommunikation (Bestandteile!)": u"Nonverbale Kommunikation | Mimik | Blickkontakt | Gestik | Körperhaltung | Proxemik | Distanzzonen | Staffage | 55-38-7-Regel | Embleme | Illustratoren | Adaptoren | Pantomimik",
 u"# 3. Telefonate": u"Telefonate | Akustische Visitenkarte",
 u"## 3.2 Passive vs. aktive Telefonate": u"Passive Telefonate | Aktive Telefonate | Inbound | Outbound | Terminvereinbarungsmethode",
 u"## 3.3 Phasen des passiven Telefonats (Standardtelefonat)": u"Standardtelefonat | Begrüßungsformel | Gesprächsübernahme | Terminsicherung",
 u"## 3.4 Aktive Telefonate": u"Kaltakquise | DSGVO | UWG | Opt-in | Kopplungsverbot | Konkludentes Einverständnis",
 u"# 4. Beratung & Verkauf von Sport-, Fitness- und Gesundheitsdienstleistungen": u"Beratung | Verkauf",
 u"## 4.1 Die Erfolgskette (PPT)": u"Erfolgskette",
 u"## 4.2 Entstehung der Nachfrage": u"Mangelgefühl | Bedürfnis | Bedarf | Nachfrage | Maslow | Bedürfnispyramide | Progressionsprinzip",
 u"## 4.3 Besonderheiten im Verkauf von Gesundheitsdienstleistungen (3 Stück!)": u"Besonderheiten Gesundheitsdienstleistungen | Kausalität | Loss of face | Demografischer Wandel",
 u"## 4.4 Beratungskompetenzen": u"Positive Verkaufssprache | Belohnende Reize | Bestrafende Reize | Fragearten | Offene Frage | Geschlossene Frage | Alternativfrage | Suggestivfrage | Feedbackfrage | Rhetorische Frage | Aktives Zuhören | Pacing | Rapport | Reaktanz | Bumerangeffekt | Stereotype | Halo-Effekt",
 u"## 4.5 Das Beratungsgespräch: 4 Phasen (+ Vor-/Nachbereitung)": u"Beratungsgespräch | Sozialer Dialekt | Denker | Direktor | Unterhalter | Beziehungsmensch | Bedarfsanalyse | Hot Button | Eisbergtheorie | OPAL-Methode | Kaufmotive | Einwand | Vorwand | Einwandvorbehandlung | Angebotspräsentation | Nutzenorientierte Argumentation | Preispräsentation | Grundsatzentscheidung | Abschlusssignale | Probeabschluss | Einwandbehandlung | After-Sales | Kognitive Dissonanz | Händedruck",
 u"## 4.6 Verkaufsstrategien: Zusatzverkäufe, Up- & Cross-Selling": u"Zusatzverkäufe | Up-Selling | Cross-Selling",
 u"# 5. Servicemanagement": u"Service | Servicemanagement",
 u"## 5.2 Customer Touchpoints & Customer Experience": u"Customer Touchpoints | Customer Experience | Omnichannel | Customer Service Points",
 u"## 5.3 Zeit, Freizeit & Werte (Kunden betreuen I)": u"Werte | Hin-zu-Werte | Weg-von-Werte | Konsequenzsummenspiel | Rollen | Determinationszeit | Obligationszeit | Dispositionszeit | Funktionen der Freizeit",
 u"## 5.4 Motivation & Transtheoretisches Modell (Kunden betreuen II)": u"Motiv | Motivation | Intrinsische Motivation | Extrinsische Motivation | Selbstkonkordanz | SMART-Formel | Transtheoretisches Modell | Stages of Change | Absichtslosigkeit | Absichtsbildung | Aufrechterhaltung",
 u"## 5.5 Service managen: die Prozesselemente": u"Servicestrategie | Serviceversprechen | Servicefaktoren | Kano-Modell | Basisfaktoren | Leistungsfaktoren | Begeisterungsfaktoren | Overkillfaktoren | Serviceorganisation | Aufbauorganisation | Ablauforganisation | Servicestandards | Servicedrehbuch | Servicekultur | Gastgeberverhalten | Basiselemente des Service",
 u"## 5.6 Kundenzufriedenheit & Kundenbindung": u"Kundenzufriedenheit | Kundenbindung | Kundenloyalität | CD-Paradigma | Konfirmation | Diskonfirmation | Net Promoter Score | Promotoren | Detraktoren",
 u"# 6. Beschwerdemanagement": u"Beschwerdemanagement | Beschwerde",
 u"## 6.1 Bedeutung von Beschwerden": u"Recovery-Paradox | Beschwerdequote (Bedeutung)",
 u"## 6.3 Der Beschwerdemanagementprozess (Stauss & Seidel)": u"Beschwerdestimulierung | Beschwerdeannahme | Beschwerdebearbeitung | Beschwerdereaktion | Beschwerdeauswertung | Process Owner | Complaint Owner | Task Owner | Beschwerdekanäle",
 u"## 6.4 Persönliche Beschwerden vor Ort – 3 Stufen (klausurrelevant!)": u"Beschwerde vor Ort | Empowerment | Ad-hoc-Maßnahmen",
 u"## 6.5 Negatives Feedback im Internet": u"Online-Bewertungen | Reputationsmanagement",
 u"# 7. Kennzahlen im Beratungs- und Servicemanagement": u"Kennzahlen | Grundzahlen | Verhältniszahlen | Gliederungszahlen | Beziehungszahlen | Indexzahlen",
 u"## 7.2 Die 5 zentralen Kennzahlen (FORMELN AUSWENDIG!)": u"Telefonquote | Termineinhaltungsquote | Abschlussquote | Fluktuationsquote | Beschwerdequote | Durchschnittlicher Mitgliederbestand",
 u"# 8. Offizielle Wiederholungs-/Prüfungsfragen der Präsenzphase (mit Kurzantworten)": u"Prüfungsfragen | Wiederholungsfragen",
 u"# 9. Last-Minute-Check (1 Seite vor der Klausur)": u"Last-Minute-Check",
}

# -------------------------------------------- example boxes (inserted, nothing changed)
# key = existing line that acts as anchor; value = (position, text)
EX = {}

EX[u"MERKE (Meffert"] = (
 "after", u"""
**BEISPIEL – die drei Dimensionen am Beispiel Autowerkstatt (Studienbrief):** *Potenzialdimension* (sichtbare Leistungsfähigkeit): „Wir sind Vertragswerkstatt", „Wir genießen das Vertrauen des Herstellers". *Prozessdimension* (angenehmes Serviceerlebnis): Warteraum mit Kaffee, Zeitungen, freundliche Bedienung, kompetente Beratung. *Ergebnisdimension* (positives Resultat): volle Mängelbehebung, einwandfreies Funktionieren des Fahrzeugs, Termineinhaltung, fairer Preis. **Jede Dienstleistung stiftet in mindestens einer dieser drei Dimensionen Nutzen.**
""")

EX[u"Gegenüberstellung Sachgüter"] = (
 "before", u"""
**BEISPIEL – Integration des externen Faktors (Anwalt, Studienbrief):** Der Anwalt hält Ressourcen vor (Räume, Personal, Gesetze) und arbeitet sich vorab in die Rechtslage ein. Kommt der Kunde zur Beratung, klärt der Anwalt ihn über Rechtslage und Handlungsalternativen auf – der Kunde hört aktiv zu, stellt Fragen, macht Notizen; am Ende wird gemeinsam eine Strategie besprochen. **Ohne Anwesenheit und aktive Mitarbeit des Kunden wäre die Beratung so nicht möglich** (vgl. Arzt–Patient: die Diagnose beruht auf einer Kette von Wechselseitigkeiten).
""")

EX[u"Klassisches Beispiel"] = (
 "after", u"""
**BEISPIEL – Aussage einer Dozentin (Studienbrief):** „Die Bücher aus dem Literaturverzeichnis sind alle in der Online-Bibliothek zu finden." *Sachinformation:* Der Fundort der Bücher ist die Online-Bibliothek. *Selbstoffenbarung:* Der Dozentin ist wichtig, dass die Literatur auf einfachstem Weg erreichbar ist. *Beziehungsaussage:* Sie schätzt die Studierenden als interessiert ein und bestimmt, was für sie relevant ist. *Appell:* „Lesen Sie die Bücher!"
""")

EX[u"Belohnende Reize einsetzen"] = (
 "after", u"""
**BEISPIEL – negative Sprache im Beratungsdialog (Übungsaufgabe PPT 1):** „Der Senioren- oder Hausfrauentarif kommt ja für Sie grundsätzlich **nicht in Frage**, da man hier abends **nicht** trainieren kann. Der erste **Vertrag**, den ich Ihnen anbieten kann … Bei der Gold-Mitgliedschaft dagegen **binden Sie sich** zwei Jahre …" → Zu suchen sind die Schwächen: Ausschluss und Bewertung des Kunden, negativ besetzte Begriffe (Vertrag, binden, kostet, zahlen), Gegenübersitzen statt über Eck. **Besser:** Mitgliedschaft statt Vertrag, Beitrag statt Preis, Investition statt Kosten, Laufzeit statt Bindung.
""")

EX[u"Achtung Dynamik"] = (
 "before", u"""
**BEISPIEL – Servicefaktoren am Beispiel Flugreise (Studienbrief):** *Basisfaktoren:* Das Flugzeug hebt pünktlich ab und kommt pünktlich an, freundlicher Empfang und Verabschiedung – fehlt eines davon, entsteht schnell Unzufriedenheit. *Leistungsfaktoren:* Kaffee/Kaltgetränk und Sandwich – je besser, desto zufriedener. *Begeisterungsfaktoren:* Das Personal bietet dem 1,95 m großen Gast unaufgefordert einen Platz mit Beinfreiheit an, dazu ein Kissen und den freien Nachbarplatz. **Achtung:** Dieselbe Leistung wird bei Emirates anders bewertet als bei Ryanair – die Positionierung bestimmt die Erwartung.
""")

EX[u"Servicekultur"] = (
 "before", u"""
**BEISPIEL – Auszug aus einem Servicedrehbuch (Restaurant, Studienbrief):** *Step 1 – Der Tisch:* eingedeckt, bevor der Gast sich setzt. *Step 2 – Der Kunde:* wird grundsätzlich zum Tisch begleitet, Karten werden am Platz übergeben (die Karte ist das **Zeichen**, dass er bereits bedient wird). *Step 3 – Erster Servicekontakt:* **WAS** Begrüßung – **WIE** freundlich mit Augen- und Mundlächeln – **WANN** spätestens 2 Minuten nach dem Platznehmen; danach Brot anbieten (Hinweis auf hausgemachtes Brot, sofort nach der Begrüßung), Tagesmenü nennen, 2–3 Aperitifs anbieten, Mineralwasser anbieten. → Genau das unterscheidet **Servicedrehbuch** (WAS + WIE + WARUM + WANN) vom bloßen **Servicestandard** (nur WAS).
""")

EX[u"Werkzeuge für den Erstkontakt"] = (
 "after", u"""
**BEISPIEL – „Energetische Sprache im Service": Don'ts und bessere Alternativen (Studienbrief, Hartauer):**

| Don't | Wirkung auf den Kunden | Besser |
|---|---|---|
| „Kann ich Ihnen helfen?" | „Du kennst meinen Stil doch gar nicht" → „Nein danke, ich schaue mich nur um" | Natürlich begrüßen und abwarten; oder auf eine konkrete Leistung ansprechen |
| „Suchen Sie etwas Bestimmtes?" | übt Druck aus | direkt ansprechen: „Die Umkleiden sind hier." |
| „Der Nächste, bitte." | „Ich fühle mich wie beim Amt" | nette persönliche Begrüßung |
| „Werden Sie schon bedient?" | „Warum wissen Sie das nicht?" – wirkt unorganisiert | begrüßen, Augenkontakt, abwarten |
| „Ist das alles?" | wird fast immer mit „Ja" beantwortet | Bezug zum Gekauften herstellen, Ergänzung anbieten |
| „Hat es geschmeckt?" / „War alles in Ordnung?" | stellt die eigene Leistung in Frage, Zeichen von Unsicherheit | „Was hat Ihnen besonders gefallen?" |
| „Sie waren schon länger nicht mehr da." | Kunde fühlt sich ertappt | „Schön, Sie wiederzusehen!" |
""")

# ------------------------------------------------------------------- assemble
out, used_ex = [], set()
for line in orig:
    s = line.strip()
    hit = None
    for _k, _v in EX.items():
        if _k in s:
            hit, s = _v, _k
            break
    if hit and hit[0] == "before" and s not in used_ex:
        out.extend(hit[1].split("\n")); used_ex.add(s)
    out.append(line)
    if s in IDX:
        out.append(u"^^ " + IDX[s])
    if hit and hit[0] == "after" and s not in used_ex:
        out.extend(hit[1].split("\n")); used_ex.add(s)

missing = [k[:60] for k in EX if k not in used_ex]
if missing:
    sys.stderr.write("WARN: anchor not found -> " + repr(missing) + "\n")

# insert front matter right after the intro block (before first '---')
idx = out.index(u"---")
final = out[:idx + 1] + FRONT.split("\n") + out[idx + 1:]
io.open(DST, "w", encoding="utf-8").write(u"\n".join(final))
print("geschrieben:", DST, "| Zeilen:", len(final), "| Beispiele eingefügt:", len(used_ex))

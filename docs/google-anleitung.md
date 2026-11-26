# Google und Bing: Search Console, Bing Webmaster Tools, Google-Profile

Stand: Oktober 2026. Website: https://www.koerperformen-koeln.de

## 1. Google Search Console einrichten (ca. 10 Minuten)

Die Search Console zeigt, bei welchen Suchbegriffen die Website erscheint,
wie oft sie angeklickt wird und ob Google Fehler findet. Kostenlos.

1. https://search.google.com/search-console öffnen und mit dem
   Google-Konto anmelden, das auch die Google-Profile verwaltet.
2. „Property hinzufügen" → rechts **„URL-Präfix"** wählen →
   `https://www.koerperformen-koeln.de` eintragen → Weiter.
3. Als Bestätigungsmethode **„HTML-Tag"** aufklappen. Dort steht etwas wie
   `<meta name="google-site-verification" content="AbC123xyz..." />`.
   Nur den Teil in den Anführungszeichen nach `content=` kopieren.
4. In Vercel: Projekt → Settings → Environment Variables →
   Name `GOOGLE_SITE_VERIFICATION`, Wert = der kopierte Code,
   Umgebung „Production" → Save.
5. In Vercel unter Deployments beim obersten Eintrag „…" → **Redeploy**.
6. Wenn das fertig ist (2–3 Minuten), in der Search Console auf
   **„Bestätigen"** klicken.
7. Links im Menü **„Sitemaps"** → `sitemap.xml` eintragen → Senden.

Danach braucht Google ein paar Tage, bis die ersten Zahlen erscheinen.
Interessant sind später vor allem: **Leistung** (Suchbegriffe, Klicks) und
**Seitenindexierung** (welche Seiten Google kennt).

## 1b. Bing Webmaster Tools einrichten (ca. 5 Minuten)

Bing liefert auch die Websuche von ChatGPT und Copilot. Am einfachsten
geht es, wenn die Search Console (Abschnitt 1) schon bestätigt ist.

1. https://www.bing.com/webmasters öffnen und mit demselben Google-Konto
   anmelden („Sign in with Google").
2. **„Import from Google Search Console"** wählen → Zugriff erlauben →
   `https://www.koerperformen-koeln.de` ankreuzen → Import. Bestätigung
   und Sitemap kommen dabei automatisch mit, ein Code ist nicht nötig.
3. Nur falls der Import nicht geht: „Add site manually" →
   `https://www.koerperformen-koeln.de` → Methode **„HTML Meta Tag"**. Den
   Teil nach `content=` kopieren, in Vercel als `BING_SITE_VERIFICATION`
   eintragen (wie in Abschnitt 1, Schritt 4 und 5), dann „Verify". Danach
   unter „Sitemaps" die Adresse
   `https://www.koerperformen-koeln.de/sitemap.xml` einreichen.

Zusätzlich meldet die Website ihre Seiten per IndexNow selbst an Bing:
Der Schlüssel steht in Vercel als `INDEXNOW_KEY` (seit 26.11.2026) und
ist unter `/indexnow.txt` abrufbar. Nach größeren Änderungen:
`INDEXNOW_KEY=... npm run indexnow`.

## 2. Google-Profile mit Kennung verlinken

Bisher zeigen die Google-Profile (Google Maps) vermutlich auf die Startseite.
Besser: Jedes Profil verlinkt direkt auf **seine** Studioseite – mit
Kennung. Dann landet der Gast gleich beim richtigen Studio samt
Terminformular, und im Adminbereich steht bei der Anfrage unter
„Herkunft" die Kampagne **google-profil**.

So geht's je Profil: https://business.google.com → Profil wählen →
„Profil bearbeiten" → **Kontakt** → **Website** → Link einfügen → Speichern.

| Studio | Link für das Feld „Website" |
|---|---|
| Brühl | https://www.koerperformen-koeln.de/studio/bruehl?k=google-profil |
| Hürth | https://www.koerperformen-koeln.de/studio/huerth?k=google-profil |
| Köln-Ebertplatz | https://www.koerperformen-koeln.de/studio/koeln-ebertplatz?k=google-profil |
| Köln-Longerich | https://www.koerperformen-koeln.de/studio/koeln-longerich?k=google-profil |
| Köln-Nippes | https://www.koerperformen-koeln.de/studio/koeln-nippes?k=google-profil |
| Köln-Porz-Wahn | https://www.koerperformen-koeln.de/studio/koeln-porz-wahn?k=google-profil |
| Köln-Rath | https://www.koerperformen-koeln.de/studio/koeln-rath?k=google-profil |
| Köln-Rondorf | https://www.koerperformen-koeln.de/studio/koeln-rondorf?k=google-profil |
| Neunkirchen-Seelscheid | https://www.koerperformen-koeln.de/studio/neunkirchen-seelscheid?k=google-profil |
| Niederkassel-Mondorf | https://www.koerperformen-koeln.de/studio/niederkassel-mondorf?k=google-profil |
| Overath | https://www.koerperformen-koeln.de/studio/overath?k=google-profil |
| Overath-Marialinden | https://www.koerperformen-koeln.de/studio/overath-marialinden?k=google-profil |
| Refrath | https://www.koerperformen-koeln.de/studio/refrath?k=google-profil |
| Rösrath | https://www.koerperformen-koeln.de/studio/roesrath?k=google-profil |

Optional zusätzlich im Profil: **Terminlink** (unter „Kontakt" bzw.
„Termine") auf dieselbe Adresse mit `#termin` am Ende setzen, z. B.
`https://www.koerperformen-koeln.de/studio/bruehl?k=google-profil#termin` –
dann springt die Seite direkt zum Formular.

Hinweis: Google sieht trotz Kennung nur eine Seite je Studio (die Seite
nennt Google selbst ihre Adresse ohne `?k=`), es entstehen also keine
doppelten Seiten.

Dasselbe Prinzip funktioniert überall: `?k=instagram-bio`, `?k=flyer-messe`
usw. – was hinter `k=` steht, erscheint bei der Anfrage als Kampagne.

## 3. Echte Google-Bewertungen auf den Studioseiten (ca. 20 Minuten)

Die Studioseiten können die Google-Sterne und die drei neuesten
Bewertungen mit Text zeigen – echte Daten direkt von Google, nichts
Erfundenes. Dafür braucht es einmalig einen Schlüssel von Google und pro
Studio die sogenannte Place-ID.

**Kosten:** Google verlangt eine hinterlegte Zahlungsart. Die Website fragt
pro Studio höchstens einmal am Tag ab; das liegt bei 14 Studios weit
innerhalb des Freikontingents, das Google jeden Monat gutschreibt.

### Schlüssel anlegen

1. https://console.cloud.google.com öffnen und mit dem Google-Konto
   anmelden.
2. Oben auf die Projektauswahl → **„Neues Projekt“** → Name z. B.
   „Körperformen Website“ → Erstellen.
3. Links **„APIs & Dienste“ → „Bibliothek“** → nach **„Places API (New)“**
   suchen → **Aktivieren**. (Falls gefragt: Abrechnungskonto anlegen.)
4. **„APIs & Dienste“ → „Anmeldedaten“ → „Anmeldedaten erstellen“ →
   „API-Schlüssel“**. Der Schlüssel beginnt mit `AIza…`.
5. Beim Schlüssel auf **„Schlüssel bearbeiten“** → unter
   „API-Einschränkungen“ **„Schlüssel einschränken“** → nur
   **„Places API (New)“** anhaken → Speichern. So taugt der Schlüssel für
   nichts anderes, falls er je in falsche Hände gerät.
6. In Vercel: Projekt → Settings → Environment Variables → Name
   `GOOGLE_PLACES_API_KEY`, Wert = der Schlüssel, Umgebung „Production“ →
   Save → unter Deployments einmal **Redeploy**.

### Place-ID je Studio eintragen

1. Im Adminbereich unter **Studios** ein Studio öffnen.
2. Beim Feld **„Google-Place-ID“** auf **„Place-ID suchen“** klicken. Die
   Suche nimmt Name und Adresse aus dem Formular und zeigt passende Treffer.
3. Den richtigen Treffer anklicken – die ID steht dann im Feld – und das
   Studio **speichern**.

Danach erscheinen auf der Studioseite die Sterne und die Bewertungen
(spätestens nach einigen Minuten). Fehlt Schlüssel oder ID, zeigt die
Seite an dieser Stelle einfach nichts.

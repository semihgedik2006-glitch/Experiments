# LogX (TryNow) mit der Website verbinden

Stand: November 2026.

## Was das bringt

Ist ein Studio angebunden, zeigt das Anfrageformular auf der Website **freie
Probetraining-Zeiten direkt aus eurem LogX-Kalender**. So läuft es dann:

1. Der Gast wählt eine Zeit und schickt die Anfrage ab.
2. Der Termin steht sofort in LogX, **als unbestätigt vorgemerkt**. In der
   Bemerkung steht „Website-Anfrage – NOCH UNBESTÄTIGT, bitte anrufen“, dazu
   Erreichbarkeit, Ziel und Nachricht.
3. Das Studio bekommt wie bisher die Mail „Neue Probetermin-Anfrage“. Darin
   steht, dass der Termin in LogX schon vorgemerkt ist.
4. Ihr ruft an. Passt die Zeit, gebt ihr den Termin **in LogX frei** und klickt
   **im Adminbereich der Website auf „Bestätigen“**. Erst dann bekommt der
   Gast die Terminbestätigung per Mail, und am Vortag geht die Erinnerung raus.
5. Passt es nicht, **löscht den Termin in LogX** und lehnt die Anfrage im
   Adminbereich ab oder tragt eine andere Zeit ein. Die Website kann Termine in
   LogX nicht löschen, das geht nur in LogX selbst.

Wer keine passende Zeit findet, kann weiterhin Wunschzeiten angeben, genau
wie bisher. Bei Studios ohne LogX-Anbindung ändert sich nichts.

## Schritt 1: In LogX einrichten (pro Studio)

Die Einrichtung folgt der miha-Hilfe „TryNow Konfiguration“.

1. **Terminart anlegen:** Links „Stammdaten“ → „Terminarten“ → neue
   Terminart, z. B. **„Probetraining – Anfrage Website“**.
   - Haken setzen bei **„Dieser Termin ist ein Probetraining“**.
   - Eine **auffällige Farbe** wählen, dann seht ihr unbestätigte
     Website-Termine im Kalender sofort.
   - Dauer wie euer normales Probetraining (z. B. 60 oder 90 Minuten).
2. **TryNow öffnen:** Unter „Terminarten“ oben rechts auf **„TryNow
   Konfiguration“** klicken und TryNow dort **aktivieren**.
3. **Profil anlegen:** „+ Profil erstellen“, Name z. B. **„Website“**.
   - Oben rechts **„Profil aktiv“** einschalten.
   - **Terminart für Probeanwendung:** die Terminart aus Schritt 1.
   - **Buchungszeitraster:** z. B. 30 Minuten.
   - **Minimale Vorlaufzeit:** so, dass ihr vorher anrufen könnt, z. B.
     720 Minuten (12 Stunden), wenn nachts gebuchte Termine erst am nächsten
     Tag bestätigt werden.
   - **Freigabezeiten (optional):** Wenn nur zu bestimmten Zeiten
     Probetrainings möglich sein sollen, eine Terminart wie „Frei für PrT“
     anlegen und diese Zeiten im Kalender eintragen.
4. **CRM-Integration im Profil:**
   - **Kontaktart:** „Anfrage Homepage“ (gibt es sie nicht, unter
     „Stammdaten“ → „Kontaktarten“ anlegen).
   - **Wiedervorlage:** z. B. „Probetraining bestätigen (Anruf)“.
   - **Mitarbeiter:in:** wer anrufen soll, oder der Team-Zugang.
5. **Speichern.**

## Schritt 2: Zugangsdaten herausfinden

Ihr braucht drei Angaben, am besten von miha bodytec bzw. aus LogX:

- **API-Schlüssel** (eine lange Zeichenfolge mit Bindestrichen).
- **Studio-Kennung (Hash)** dieses Studios, ebenfalls eine lange Zeichenfolge.
  Sie steht in der API-Dokumentation von miha in der Adresse, wenn man sich
  dort mit dem Schlüssel anmeldet: `…openapi.json?category=trynow&studio=HIER`.
- **Profil-Nummer** (optional): Die Website zeigt sie euch beim
  „Verbindung testen“ an. Ohne Angabe wird das Standardprofil benutzt.

Gilt ein Schlüssel nur für ein Studio, braucht jedes Studio seinen eigenen.
Den Schlüssel bitte nicht per Mail herumschicken, sondern direkt im
Adminbereich eintragen.

## Schritt 3: Im Adminbereich der Website eintragen

1. Adminbereich → **Studios** → Studio aufklappen.
2. Im Kasten **„LogX (TryNow)“** Studio-Kennung, gegebenenfalls Profil-Nr. und
   API-Schlüssel eintragen.
3. **„Verbindung testen“** klicken. Die Website sagt dann in einfachen Worten,
   was noch fehlt, zum Beispiel:
   - „Profil ausgeschaltet“: in LogX „Profil aktiv“ einschalten.
   - „Keine Terminart“: in LogX bei der Terminart „Dieser Termin ist ein
     Probetraining“ anhaken und im Profil auswählen.
   - „Zurzeit keine freien Zeiten“: Kalender bzw. Freigabezeiten prüfen.
4. Erst **„Speichern“** übernimmt die Angaben.

Der gespeicherte Schlüssel wird danach nur noch als „•••• gespeichert“
angezeigt. Ein leeres Feld lässt ihn unverändert. Zum Abschalten das Häkchen
„Gespeicherten Schlüssel löschen“ setzen und speichern.

## Gut zu wissen

- **Störungen:** Antwortet LogX nicht, zeigt das Formular automatisch wieder
  die Wunschzeiten. Keine Anfrage geht verloren.
- **Zeit gerade weg:** Ist eine Zeit beim Absenden schon vergeben, bekommt der
  Gast die Meldung „Diese Zeit ist gerade weg – bitte eine andere wählen“, und
  die Liste wird neu geladen.
- **Buchung in LogX fehlgeschlagen:** Die Anfrage kommt trotzdem an. Die
  gewählte Zeit steht dann als Wunsch dabei, mit dem Hinweis „nicht in LogX
  eingetragen – bitte von Hand“.
- **Im Adminbereich** tragen solche Anfragen das Kennzeichen „In LogX
  vorgemerkt“. Beim Ablehnen oder Stornieren erinnert die Website daran, den
  Termin auch in LogX zu löschen.
- **Datenschutz:** In der Datenschutzerklärung steht ein eigener Abschnitt
  dazu. Mit miha bodytec braucht es einen Auftragsverarbeitungsvertrag; bitte
  prüfen, ob es ihn schon gibt.

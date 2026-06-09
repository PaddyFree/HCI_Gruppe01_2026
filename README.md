# Visuelle Suche unter Netzbrummen

Webanwendung zur Untersuchung des Einflusses von Netzbrummen auf präattentive und attentive visuelle Suchaufgaben.

## Forschungsfrage

> Beeinflusst ein konstantes Hintergrundgeräusch (Netzbrummen) die Reaktionszeit und Genauigkeit bei visuellen Suchaufgaben?

---

## Versuchsaufbau

Jede Versuchsperson bearbeitet insgesamt **80 Trials**.

Unterschieden werden zwei Sucharten:

* **Präattentiv:** Zielobjekt hebt sich direkt von den Distraktoren ab.
* **Attentiv:** Zielobjekt muss durch Vergleich mehrerer Merkmale identifiziert werden.

Zusätzlich gibt es zwei Audiobedingungen:

* Mit Netzbrummen
* Ohne Netzbrummen

---

## Gruppen

Zur Vermeidung von Reihenfolgeeffekten werden vier Gruppen verwendet.

### Gruppe A

1. Präattentiv + Brummen
2. Präattentiv + Still
3. Attentiv + Brummen
4. Attentiv + Still

### Gruppe B

1. Präattentiv + Still
2. Präattentiv + Brummen
3. Attentiv + Still
4. Attentiv + Brummen

### Gruppe C

1. Attentiv + Brummen
2. Attentiv + Still
3. Präattentiv + Brummen
4. Präattentiv + Still

### Gruppe D

1. Attentiv + Still
2. Attentiv + Brummen
3. Präattentiv + Still
4. Präattentiv + Brummen

Jede Bedingung wird zweimal mit jeweils 10 Trials durchgeführt.

Nach den ersten 40 Trials erfolgt automatisch eine 30-sekündige Pause.

---

## Ablauf eines Trials

1. Fixationskreuz (1 Sekunde)
2. Anzeige des Suchfeldes
3. Zielobjekt auswählen
4. Reaktionszeit messen
5. Nächstes Trial

---

## Erfasste Daten

Für jeden Trial werden gespeichert:

* Gruppe
* Suchtyp
* Audiobedingung
* Reaktionszeit
* Korrektheit

Nach Abschluss wird automatisch eine CSV-Datei exportiert.

Zusätzlich werden pro Block berechnet:

* Gesamtzeit
* Durchschnittliche Reaktionszeit
* Anzahl korrekter Antworten

---

## Technologien

* React
* Vite
* JavaScript
* HTML Audio API

---

## Start

Installation:

```bash
npm install
```

Entwicklungsserver starten:

```bash
npm run dev
```

Produktionsbuild erstellen:

```bash
npm run build
```

---

## Projekt

HCI1 – Hochschule Flensburg

Sommersemester 2026

Untersuchung präattentiver und attentiver visueller Suchprozesse unter auditiver Belastung durch simuliertes Netzbrummen.

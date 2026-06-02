# Visuelle Suche Experiment

Webbasierte Anwendung zur Untersuchung visueller Suchprozesse unter verschiedenen auditiven Bedingungen. Das Experiment wurde im Rahmen eines HCI-Projekts an der Hochschule Flensburg entwickelt.

## Zielsetzung

Untersucht werden Reaktionszeiten und Fehlerraten bei visuellen Suchaufgaben unter unterschiedlichen Bedingungen.

Verglichen werden:

* Präattentive Suchaufgaben
* Attentive Suchaufgaben
* Mit Hintergrundgeräusch
* Ohne Hintergrundgeräusch

## Versuchsaufbau

Das Experiment besteht aus insgesamt 80 Trials, aufgeteilt in vier Blöcke mit jeweils 20 Aufgaben.

### Präattentive Suche

Alle Distraktoren sind graue Kreise.

Mögliche Zielobjekte:

* Roter, grüner oder blauer Kreis
* Graues, rotes, grünes oder blaues Quadrat
* Graues, rotes, grünes oder blaues Dreieck

### Attentive Suche

Distraktoren unterscheiden sich sowohl in Form als auch Farbe.

Das Zielobjekt kann entweder:

* eine neue Form besitzen oder
* eine neue Kombination aus vorhandener Farbe und Form darstellen

Dadurch muss die Zielperson mehrere Merkmale gleichzeitig berücksichtigen.

## Gruppen

Zur Kontrolle von Reihenfolgeeffekten werden vier Versuchsgruppen verwendet:

| Gruppe | Reihenfolge                                               |
| ------ | --------------------------------------------------------- |
| A      | Prä + Brummen → Prä + Still → Att + Brummen → Att + Still |
| B      | Prä + Still → Prä + Brummen → Att + Still → Att + Brummen |
| C      | Att + Brummen → Att + Still → Prä + Brummen → Prä + Still |
| D      | Att + Still → Att + Brummen → Prä + Still → Prä + Brummen |

## Ablauf

1. Auswahl einer Versuchsgruppe
2. Start des Experiments
3. Fixationskreuz
4. Anzeige des Suchfeldes
5. Auswahl des Zielobjekts
6. Nächster Trial

## Datenerfassung

Für jeden Trial werden folgende Daten gespeichert:

* Versuchsgruppe
* Trialnummer
* Suchtyp
* Audiobedingung
* Reaktionszeit
* Korrektheit

Nach Abschluss wird automatisch eine CSV-Datei erzeugt und heruntergeladen.

## Technologien

* React
* Vite
* JavaScript
* HTML/CSS

## Installation

```bash
npm install
npm run dev
```

Produktionsbuild:

```bash
npm run build
```

## Hinweis

Die Anwendung dient ausschließlich Forschungs- und Lehrzwecken im Rahmen eines Hochschulprojekts.

© 2026 HCI Gruppe 01 – Hochschule Flensburg

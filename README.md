# Visuelle Suche Experiment (Netzbrummen vs. Kein Netzbrummen)

Dieses Projekt ist eine webbasierte Anwendung zur Untersuchung visueller Suchprozesse unter verschiedenen auditiven Bedingungen.
Teilnehmende müssen in einem Raster aus grauen Punkten möglichst schnell einen roten Zielpunkt identifizieren.

Ein Teil der Trials wird mit einem simulierten **Netzbrummen (50 Hz + Obertöne)** durchgeführt, ein anderer Teil ohne akustische Stimulation.

---

## 🧠 Ziel des Experiments

Untersuchung der Frage:

> Beeinflusst ein konstantes Hintergrundgeräusch (Netzbrummen) die Reaktionszeit und Genauigkeit bei visuellen Suchaufgaben?

---

## ⚙️ Funktionsweise

* Pro Durchlauf gibt es **24 Trials**
* Gleichmäßige Verteilung:

    * 50% mit Netzbrummen
    * 50% ohne Netzbrummen
* Zufällige Feldgrößen:

    * 3×3, 4×4, 5×5, 6×6
* In jedem Feld:

    * genau **ein roter Zielpunkt**
    * restliche Punkte sind grau

### Ablauf eines Trials

1. Fixationskreuz (1 Sekunde)
2. Anzeige des Suchfeldes
3. Nutzer klickt auf Zielpunkt
4. Reaktionszeit wird gemessen
5. nächstes Trial

---

## 🔊 Audio

Das Netzbrummen wird über die Web Audio API erzeugt:

* Grundfrequenz: **50 Hz**
* Obertöne: **100 Hz, 150 Hz**
* Leise Wiedergabe zur Simulation realer Umgebungsbedingungen

Hinweis:
Browser blockieren Audio ohne Benutzerinteraktion → wird beim Start aktiviert.

---

## 📊 Erfasste Daten

Für jeden Trial werden gespeichert:

* Feldgröße
* Audio-Bedingung (mit / ohne Netzbrummen)
* Reaktionszeit (ms)
* Korrektheit (Treffer / Fehler)

Am Ende werden aggregierte Statistiken angezeigt:

* Trefferquote
* Fehleranzahl
* Durchschnittliche Reaktionszeit

---

## 🧪 Technische Umsetzung

* React (Hooks)
* Vite (Build-Tool)
* Web Audio API (Soundgenerierung)
* Inline CSS (kein externes Styling-Framework)

---

## 🚀 Setup & Start

### 1. Installation

```bash
npm install
```

### 2. Entwicklungsserver starten

```bash
npm run dev
```

### 3. Build erstellen

```bash
npm run build
```

---

## ⚠️ Hinweise

* Audio funktioniert nur nach Nutzerinteraktion (Browser-Security)
* Reaktionszeiten sind abhängig von:

    * Hardware
    * Eingabegerät
    * Browser

---

## 🧩 Erweiterungsmöglichkeiten

Mögliche nächste Schritte:

* Randomisierte Fixationsdauer (800–1200 ms)
* Vergleich verschiedener Eingabegeräte (Maus vs. Touch)
* Export der Daten (CSV)
* Erweiterte Visualisierung (Diagramme)

---

## ⚛️ React + Vite Basis

Dieses Projekt basiert auf einem minimalen React + Vite Setup mit HMR und ESLint.

Offizielle Plugins:

* [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) (Oxc)
* [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) (SWC)

---

## 🧹 ESLint & Codequalität

Für produktive Anwendungen wird empfohlen:

* TypeScript zu nutzen
* type-aware linting zu aktivieren

Mehr Infos:

* https://typescript-eslint.io
* https://react.dev/learn/react-compiler/installation

---

## 📌 Fazit

Das Projekt stellt eine einfache, aber kontrollierte Umgebung zur Untersuchung von Wahrnehmung und Reaktionsverhalten dar und eignet sich besonders für HCI-, Psychologie- oder UX-nahe Experimente.

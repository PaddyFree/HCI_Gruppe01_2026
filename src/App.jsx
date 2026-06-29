import { useEffect, useRef, useState } from "react";
import humSound from "./assets/Netzbrummen Simulation.wav";

const FIELD_SIZES = [64];
const TRIALS_TOTAL = 80;

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function createExperimentPlan(group) {

    const CONDITIONS = {
        1: {
            searchType: "praeattentiv",
            soundCondition: "mit_netzbrummen"
        },
        2: {
            searchType: "praeattentiv",
            soundCondition: "ohne_netzbrummen"
        },
        3: {
            searchType: "attentiv",
            soundCondition: "mit_netzbrummen"
        },
        4: {
            searchType: "attentiv",
            soundCondition: "ohne_netzbrummen"
        }
    };

    const GROUPS = {
        A: [1, 2, 3, 4],
        B: [2, 1, 4, 3],
        C: [3, 4, 1, 2],
        D: [4, 3, 2, 1]
    };

    const order = GROUPS[group];

    const trials = [];

    order.forEach(() => {
        for (let round = 0; round < 2; round++) {

            order.forEach(conditionNumber => {

                const condition =
                    CONDITIONS[
                        conditionNumber
                        ];

                for (let i = 0; i < 10; i++) {

                    trials.push({
                        searchType:
                        condition.searchType,

                        soundCondition:
                        condition.soundCondition
                    });
                }

            });

        }
    });

    return trials;
}

function generateTrial(soundCondition, searchType) {

    const size = getRandomElement(FIELD_SIZES);

    const targetIndex =
        Math.floor(Math.random() * size);

    let items = [];

    // PRÄATTENTIV
    if (searchType === "praeattentiv") {

        const possibleTargets = [

            { color: "red", shape: "circle" },
            { color: "green", shape: "circle" },
            { color: "blue", shape: "circle" },

            { color: "#666", shape: "square" },
            { color: "red", shape: "square" },
            { color: "green", shape: "square" },
            { color: "blue", shape: "square" },

            { color: "#666", shape: "triangle" },
            { color: "red", shape: "triangle" },
            { color: "green", shape: "triangle" },
            { color: "blue", shape: "triangle" }
        ];

        const target =
            possibleTargets[
                Math.floor(
                    Math.random() *
                    possibleTargets.length
                )
                ];

        items = Array.from(
            { length: size },
            (_, index) => {

                if (index === targetIndex) {

                    return {
                        isTarget: true,
                        color: target.color,
                        shape: target.shape
                    };
                }

                return {
                    isTarget: false,
                    color: "#666",
                    shape: "circle"
                };
            }
        );
    }

    // ATTENTIV
    if (searchType === "attentiv") {

        const colors = [
            "red",
            "green",
            "blue"
        ];

        const shapes = [
            "circle",
            "square",
            "triangle"
        ];

        // 2 verschiedene Farben
        const colorA =
            colors[
                Math.floor(
                    Math.random() * colors.length
                )
                ];

        let colorB =
            colors[
                Math.floor(
                    Math.random() * colors.length
                )
                ];

        while (colorA === colorB) {

            colorB =
                colors[
                    Math.floor(
                        Math.random() * colors.length
                    )
                    ];
        }

        // 2 verschiedene Formen
        const shapeA =
            shapes[
                Math.floor(
                    Math.random() * shapes.length
                )
                ];

        let shapeB =
            shapes[
                Math.floor(
                    Math.random() * shapes.length
                )
                ];

        while (shapeA === shapeB) {

            shapeB =
                shapes[
                    Math.floor(
                        Math.random() * shapes.length
                    )
                    ];
        }

        // verbleibende Form
        const shapeC =
            shapes.find(
                shape =>
                    shape !== shapeA &&
                    shape !== shapeB
            );

        // Zieltyp
        const targetType =
            Math.random() < 0.5
                ? "newShape"
                : "swapCombination";

        let target;

        // Neues Dreieck / Quadrat / Kreis
        if (targetType === "newShape") {

            target =
                Math.random() < 0.5
                    ? {
                        color: colorA,
                        shape: shapeC
                    }
                    : {
                        color: colorB,
                        shape: shapeC
                    };
        }

        // Farb-Form Kombination tauschen
        else {

            target =
                Math.random() < 0.5
                    ? {
                        color: colorA,
                        shape: shapeB
                    }
                    : {
                        color: colorB,
                        shape: shapeA
                    };
        }

        items = Array.from(
            { length: size },
            (_, index) => {

                if (index === targetIndex) {

                    return {
                        isTarget: true,
                        color: target.color,
                        shape: target.shape
                    };
                }

                const distractor =
                    Math.random() < 0.5
                        ? {
                            color: colorA,
                            shape: shapeA
                        }
                        : {
                            color: colorB,
                            shape: shapeB
                        };

                return {
                    isTarget: false,
                    ...distractor
                };
            }
        );
    }

    return {
        size,
        items,
        targetIndex,
        soundCondition,
        searchType
    };
}

function getGridVisuals() {

    return {
        buttonSize: 52,
        dotSize: 16,
        gap: 6
    };
}

function formatSoundLabel(soundCondition) {

    return soundCondition === "mit_netzbrummen"
        ? "Mit Netzbrummen"
        : "Ohne Netzbrummen";
}

function formatSearchLabel(searchType) {

    return searchType === "praeattentiv"
        ? "Präattentiv"
        : "Attentiv";
}

function downloadCSV({
                         results,
                         group,
                         participantId,
                         preAnswers,
                         postAnswers
                     }) {

    // Tidy long format: eine Zeile pro Trial, damit sich
    // die Daten direkt mit pandas auswerten lassen.
    const TRIALS_PER_BLOCK = 10;

    // Feste Spaltenstruktur (für alle Teilnehmer identisch)
    const header = [
        "teilnehmer_id",
        "gruppe",
        ...PRE_QUESTIONS.map(question => question.id),
        ...POST_QUESTIONS.map(question => question.id),
        "block",
        "trial_in_block",
        "trial_global",
        "suchtyp",
        "audio",
        "zeit_ms",
        "richtig"
    ];

    // Fragebogen-Antworten werden pro Trial-Zeile wiederholt
    const preValues =
        PRE_QUESTIONS.map(question =>
            getAnswerValue(question, preAnswers)
        );

    const postValues =
        POST_QUESTIONS.map(question =>
            getAnswerValue(question, postAnswers)
        );

    const rows = [header];

    results.forEach(entry => {

        const block =
            Math.floor(
                (entry.trialNumber - 1) / TRIALS_PER_BLOCK
            ) + 1;

        const trialInBlock =
            ((entry.trialNumber - 1) % TRIALS_PER_BLOCK) + 1;

        rows.push([
            participantId,
            group,
            ...preValues,
            ...postValues,
            block,
            trialInBlock,
            entry.trialNumber,
            entry.searchType,
            entry.soundCondition,
            entry.reactionTime,
            entry.correct ? 1 : 0
        ]);
    });

    const csvContent =
        rows
            .map(row =>
                row
                    .map(escapeCSV)
                    .join(",")
            )
            .join("\n");

    // UTF-8 BOM voranstellen, damit Excel/LibreOffice die
    // Umlaute (ä, ö, ü, ß ...) korrekt als UTF-8 erkennen.
    const blob = new Blob(
        ["\uFEFF" + csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    const now = new Date();

    const fileName =
        `HCI1_Gruppe${group}_ID-${participantId}_` +
        `${String(now.getDate()).padStart(2, "0")}-` +
        `${String(now.getMonth() + 1).padStart(2, "0")}-` +
        `${now.getFullYear()}_` +
        `${String(now.getHours()).padStart(2, "0")}-` +
        `${String(now.getMinutes()).padStart(2, "0")}-` +
        `${String(now.getSeconds()).padStart(2, "0")}.csv`;

    const link =
        document.createElement("a");

    const url =
        URL.createObjectURL(blob);

    link.setAttribute("href", url);

    link.setAttribute(
        "download",
        fileName
    );

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}
function renderShape(item, size) {

    if (item.shape === "circle") {

        return (
            <div
                style={{
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    background: item.color
                }}
            />
        );
    }

    if (item.shape === "square") {

        return (
            <div
                style={{
                    width: size,
                    height: size,
                    background: item.color
                }}
            />
        );
    }

    if (item.shape === "triangle") {

        return (
            <div
                style={{
                    width: 0,
                    height: 0,
                    borderLeft:
                        `${size / 2}px solid transparent`,
                    borderRight:
                        `${size / 2}px solid transparent`,
                    borderBottom:
                        `${size}px solid ${item.color}`
                }}
            />
        );
    }

    return null;
}
function generateParticipantId() {

    // Mehrdeutige Zeichen (0/O, 1/I) bewusst weggelassen
    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let id = "";

    for (let i = 0; i < 8; i++) {

        id +=
            chars[
                Math.floor(
                    Math.random() * chars.length
                )
                ];
    }

    return `${id.slice(0, 4)}-${id.slice(4)}`;
}

// Vorfragebogen (zu Beginn)
const PRE_QUESTIONS = [
    {
        id: "alter",
        label: "Alter",
        type: "text",
        required: true,
        placeholder: "Dein Alter"
    },
    {
        id: "geschlecht",
        label: "Geschlecht",
        type: "radio",
        required: true,
        options: [
            "Divers",
            "Weiblich",
            "Männlich",
            "Keine Angaben"
        ],
        other: true
    },
    {
        id: "ohrenkrankheiten",
        label: "Hast du bekannte Ohrenkrankheiten?",
        type: "radio",
        required: true,
        options: ["Ja", "Nein"]
    },
    {
        id: "ohrenkrankheiten_welche",
        label: "Welche Ohrenerkrankungen",
        type: "text",
        required: false,
        placeholder: "z. B. Tinnitus",
        showIf: answers =>
            answers.ohrenkrankheiten === "Ja"
    },
    {
        id: "arbeitsplatz_laut",
        label: "Wie laut ist dein Arbeitsplatz?",
        type: "scale",
        required: true,
        min: 1,
        max: 5,
        minLabel: "Leise",
        maxLabel: "Laut"
    },
    {
        id: "bueromaschinen",
        label:
            "Wie viel arbeitest du mit elektrischen " +
            "Bürogeräten (PC, Tablet, etc.)",
        type: "scale",
        required: true,
        min: 1,
        max: 5,
        minLabel: "Wenig",
        maxLabel: "Viel"
    },
    {
        id: "haushaltsgeraete",
        label:
            "Wie viel arbeitest du mit elektrischen " +
            "Haushaltsgeräten (Waschmaschinen, Mixer, " +
            "Herd, etc.)",
        type: "scale",
        required: true,
        min: 1,
        max: 5,
        minLabel: "Wenig",
        maxLabel: "Viel"
    },
    {
        id: "baumaschinen",
        label:
            "Wie viel arbeitest du mit elektrischen " +
            "Baumaschinen (Bohrmaschinen, Hydraulikpressen, " +
            "Kompressoren, etc.)",
        type: "scale",
        required: true,
        min: 1,
        max: 5,
        minLabel: "Wenig",
        maxLabel: "Viel"
    },
    {
        id: "noise_cancelling",
        label:
            "Wie viel trägst du Noise-Cancelling Kopfhörer?",
        type: "scale",
        required: true,
        min: 1,
        max: 10,
        minLabel: "Nie",
        maxLabel: "Immer"
    }
];

// Nachfragebogen (am Ende)
const POST_QUESTIONS = [
    {
        id: "anstrengung",
        label:
            "Wie anstrengend empfandest du die " +
            "Suchaufgaben insgesamt?",
        type: "radio",
        required: true,
        options: [
            "Gar nicht",
            "Eher nicht",
            "Mittelmäßig",
            "Eher anstregend",
            "Sehr anstregend"
        ]
    },
    {
        id: "schwierige_aufgaben",
        label:
            "Welche Suchaufgaben empfandest du als schwierig?",
        type: "radio",
        required: true,
        options: [
            "Präattentive Aufgaben",
            "Attentive Aufgaben",
            "Gleich schwer"
        ]
    },
    {
        id: "brummen_einfluss",
        label:
            "Wie stark hat dich das Netzbrummen während " +
            "der Aufgaben beeinflusst?",
        type: "radio",
        required: true,
        options: [
            "Gar nicht",
            "Eher nicht",
            "Mittelmäßig",
            "Eher beeinflusst",
            "Sehr stark beeinflust"
        ]
    },
    {
        id: "brummen_hinsicht",
        label:
            "In welcher Hinsicht hat dich das Netzbrummen " +
            "beeinflusst?",
        type: "radio",
        required: true,
        options: [
            "Gar nicht",
            "Leicht abgelenkt",
            "Gestresst",
            "Genervt",
            "Konzentration verbessert"
        ],
        other: true
    },
    {
        id: "gefuehl_langsamer",
        label:
            "Hattest du das Gefühl, mit Netzbrummen " +
            "langsamer zu sein?",
        type: "radio",
        required: true,
        options: ["Ja", "Nein", "Unsicher"]
    },
    {
        id: "gefuehl_fehler",
        label:
            "Hattest du das Gefühl, mit Netzbrummen " +
            "mehr Fehler zu machen?",
        type: "radio",
        required: true,
        options: ["Ja", "Nein", "Unsicher"]
    },
    {
        id: "lautstaerke",
        label:
            "Wie angenehm war die Lautstärke des Tons?",
        type: "radio",
        required: true,
        options: [
            "Zu leise",
            "Eher zu leise",
            "Angenehem",
            "Eher zu laut",
            "Zu laut"
        ]
    },
    {
        id: "bewusst_wahrgenommen",
        label:
            "Hast du das Netzbrummen während des " +
            "Experiments bewusst wahrgenommen?",
        type: "radio",
        required: true,
        options: [
            "Gar nicht",
            "Selten",
            "Gelegentlich",
            "Häufig",
            "Die ganze Zeit"
        ]
    },
    {
        id: "strategie",
        label:
            "Welche Strategie hast du beim Suchen verwendet?",
        type: "radio",
        required: true,
        options: [
            "Zielobjekt sprang sofort ins Auge",
            "Ich habe systematisch gesucht",
            "Mischung aus beiden",
            "Keine bestimmte Strategie"
        ],
        other: true
    }
];

const OTHER_VALUE = "__other__";

function isQuestionVisible(question, answers) {

    return (
        !question.showIf ||
        question.showIf(answers)
    );
}

function getAnswerValue(question, answers) {

    const value = answers[question.id];

    if (value === OTHER_VALUE) {

        const otherText =
            answers[`${question.id}_other`] || "";

        return `Sonstiges: ${otherText}`;
    }

    return value ?? "";
}

function escapeCSV(value) {

    const text = String(value ?? "");

    if (/[",\n]/.test(text)) {

        return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
}

function Questionnaire({
                           title,
                           description,
                           questions,
                           answers,
                           onChange,
                           onSubmit,
                           submitLabel
                       }) {

    const [showError, setShowError] =
        useState(false);

    const visibleQuestions =
        questions.filter(
            question =>
                isQuestionVisible(question, answers)
        );

    function isAnswered(question) {

        const value = answers[question.id];

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return false;
        }

        if (value === OTHER_VALUE) {

            return Boolean(
                answers[`${question.id}_other`] &&
                answers[`${question.id}_other`].trim()
            );
        }

        return true;
    }

    function handleSubmit() {

        const incomplete =
            visibleQuestions.some(
                question =>
                    question.required &&
                    !isAnswered(question)
            );

        if (incomplete) {

            setShowError(true);

            return;
        }

        setShowError(false);

        onSubmit();
    }

    return (
        <div style={pageStyle}>
            <div
                style={{
                    ...cardStyle,
                    maxWidth: 720,
                    textAlign: "left"
                }}
            >

                <h1 style={{ textAlign: "center" }}>
                    {title}
                </h1>

                {description && (
                    <p
                        style={{
                            marginTop: 16,
                            marginBottom: 8,
                            lineHeight: 1.6,
                            opacity: 0.85,
                            whiteSpace: "pre-line"
                        }}
                    >
                        {description}
                    </p>
                )}

                {visibleQuestions.map(question => {

                    const missing =
                        showError &&
                        question.required &&
                        !isAnswered(question);

                    return (
                        <div
                            key={question.id}
                            style={{
                                marginTop: 26,
                                paddingTop: 18,
                                borderTop:
                                    "1px solid #2a2c34"
                            }}
                        >

                            <label
                                style={{
                                    display: "block",
                                    marginBottom: 12,
                                    fontWeight: 600,
                                    color: missing
                                        ? "#ff8a80"
                                        : "white"
                                }}
                            >
                                {question.label}
                                {question.required && (
                                    <span
                                        style={{
                                            color: "#ff5252",
                                            marginLeft: 4
                                        }}
                                    >
                                        *
                                    </span>
                                )}
                            </label>

                            {question.type === "text" && (
                                <input
                                    type="text"
                                    value={
                                        answers[question.id] ||
                                        ""
                                    }
                                    placeholder={
                                        question.placeholder ||
                                        ""
                                    }
                                    onChange={event =>
                                        onChange(
                                            question.id,
                                            event.target.value
                                        )
                                    }
                                    style={inputStyle}
                                />
                            )}

                            {question.type === "scale" && (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        flexWrap: "wrap"
                                    }}
                                >
                                    <span
                                        style={{
                                            opacity: 0.7,
                                            minWidth: 50
                                        }}
                                    >
                                        {question.minLabel}
                                    </span>

                                    {Array.from(
                                        {
                                            length:
                                                question.max -
                                                question.min +
                                                1
                                        },
                                        (_, i) =>
                                            question.min + i
                                    ).map(number => {

                                        const selected =
                                            answers[question.id] ===
                                            number;

                                        return (
                                            <button
                                                key={number}
                                                type="button"
                                                onClick={() =>
                                                    onChange(
                                                        question.id,
                                                        number
                                                    )
                                                }
                                                style={{
                                                    ...scaleButtonStyle,
                                                    background:
                                                        selected
                                                            ? "#4caf50"
                                                            : "#2a2c34",
                                                    borderColor:
                                                        selected
                                                            ? "#4caf50"
                                                            : "#555"
                                                }}
                                            >
                                                {number}
                                            </button>
                                        );
                                    })}

                                    <span
                                        style={{
                                            opacity: 0.7,
                                            minWidth: 50
                                        }}
                                    >
                                        {question.maxLabel}
                                    </span>
                                </div>
                            )}

                            {question.type === "radio" && (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 8
                                    }}
                                >
                                    {question.options.map(
                                        option => {

                                            const selected =
                                                answers[
                                                    question.id
                                                    ] === option;

                                            return (
                                                <label
                                                    key={option}
                                                    style={{
                                                        ...optionStyle,
                                                        borderColor:
                                                            selected
                                                                ? "#4caf50"
                                                                : "#3a3c44"
                                                    }}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={
                                                            question.id
                                                        }
                                                        checked={
                                                            selected
                                                        }
                                                        onChange={() =>
                                                            onChange(
                                                                question.id,
                                                                option
                                                            )
                                                        }
                                                    />
                                                    {option}
                                                </label>
                                            );
                                        }
                                    )}

                                    {question.other && (
                                        <label
                                            style={{
                                                ...optionStyle,
                                                borderColor:
                                                    answers[
                                                        question.id
                                                        ] ===
                                                    OTHER_VALUE
                                                        ? "#4caf50"
                                                        : "#3a3c44",
                                                alignItems:
                                                    "center"
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name={question.id}
                                                checked={
                                                    answers[
                                                        question.id
                                                        ] ===
                                                    OTHER_VALUE
                                                }
                                                onChange={() =>
                                                    onChange(
                                                        question.id,
                                                        OTHER_VALUE
                                                    )
                                                }
                                            />
                                            Sonstiges:
                                            <input
                                                type="text"
                                                value={
                                                    answers[
                                                        `${question.id}_other`
                                                        ] || ""
                                                }
                                                onChange={event => {
                                                    onChange(
                                                        question.id,
                                                        OTHER_VALUE
                                                    );
                                                    onChange(
                                                        `${question.id}_other`,
                                                        event.target
                                                            .value
                                                    );
                                                }}
                                                style={{
                                                    ...inputStyle,
                                                    marginLeft: 8,
                                                    flex: 1,
                                                    marginTop: 0
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {showError && (
                    <p
                        style={{
                            color: "#ff5252",
                            marginTop: 20
                        }}
                    >
                        Bitte beantworte alle mit *
                        markierten Pflichtfragen.
                    </p>
                )}

                <button
                    type="button"
                    onClick={handleSubmit}
                    style={{
                        ...buttonStyle,
                        marginTop: 28,
                        background: "#4caf50",
                        border: "1px solid #4caf50"
                    }}
                >
                    {submitLabel}
                </button>
            </div>
        </div>
    );
}

export default function App() {

    const [phase, setPhase] =
        useState("prequestionnaire");

    const [participantId] =
        useState(generateParticipantId);

    const [preAnswers, setPreAnswers] =
        useState({});

    const [postAnswers, setPostAnswers] =
        useState({});

    const [trialIndex, setTrialIndex] =
        useState(0);

    const [trial, setTrial] =
        useState(null);

    const [startTime, setStartTime] =
        useState(null);

    const [results, setResults] =
        useState([]);

    const [experimentPlan, setExperimentPlan] =
        useState([]);

    const [selectedGroup, setSelectedGroup] =
        useState(null);

    const [pauseTime, setPauseTime] =
        useState(30);

    const [pauseProgress, setPauseProgress] = useState(30);

    const [pauseDone, setPauseDone] =
        useState(false);

    const humAudioRef =
        useRef(null);

    useEffect(() => {

        const audio =
            new Audio(humSound);

        audio.loop = true;

        audio.volume = 0.35;

        humAudioRef.current = audio;

        return () => {

            if (humAudioRef.current) {

                humAudioRef.current.pause();

                humAudioRef.current = null;
            }
        };

    }, []);

    // SOUND MANAGEMENT
    useEffect(() => {

        if (!trial) {
            return;
        }

        if (
            trial.soundCondition ===
            "mit_netzbrummen"
        ) {

            if (
                humAudioRef.current &&
                humAudioRef.current.paused
            ) {

                startHum();
            }

        } else {

            stopHum();
        }

    }, [trial]);

    // FIXATION TIMER
    useEffect(() => {

        if (phase !== "fixation") return;

        const timeout = setTimeout(() => {

            prepareNextTrial(
                trialIndex,
                experimentPlan
            );

        }, 1000);

        return () => clearTimeout(timeout);

    }, [experimentPlan, phase, trialIndex]);

    useEffect(() => {

        if (phase !== "pause") {
            return;
        }

        const duration = 30000;
        const start = Date.now();

        const interval = setInterval(() => {

            const elapsed =
                Date.now() - start;

            const remaining =
                Math.max(
                    0,
                    duration - elapsed
                );

            setPauseProgress(
                remaining / 1000
            );

            setPauseTime(
                Math.ceil(
                    remaining / 1000
                )
            );

            if (remaining <= 0) {

                clearInterval(interval);

                setPauseDone(true);

                setPauseTime(30);

                setPauseProgress(30);

                setPhase("fixation");
            }

        }, 50);

        return () => clearInterval(interval);

    }, [phase]);

    async function ensureAudioReady() {

        try {

            if (!humAudioRef.current) {
                return false;
            }

            await humAudioRef.current.play();

            humAudioRef.current.pause();

            humAudioRef.current.currentTime = 0;

            return true;

        } catch (error) {

            console.error(error);

            return false;
        }
    }

    function startHum() {

        if (!humAudioRef.current) {
            return;
        }

        humAudioRef.current.play();
    }

    function stopHum() {

        if (!humAudioRef.current) {
            return;
        }

        humAudioRef.current.pause();

        humAudioRef.current.currentTime = 0;
    }

    function prepareNextTrial(
        currentTrialIndex,
        currentExperimentPlan
    ) {

        const currentConfig =
            currentExperimentPlan[
                currentTrialIndex
                ];

        const newTrial =
            generateTrial(
                currentConfig.soundCondition,
                currentConfig.searchType
            );

        setTrial(newTrial);

        setStartTime(Date.now());

        setPhase("trial");
    }

    function updatePreAnswer(id, value) {

        setPreAnswers(previous => ({
            ...previous,
            [id]: value
        }));
    }

    function updatePostAnswer(id, value) {

        setPostAnswers(previous => ({
            ...previous,
            [id]: value
        }));
    }

    function handleFinishPostQuestionnaire() {

        downloadCSV({
            results,
            group: selectedGroup,
            participantId,
            preAnswers,
            postAnswers
        });

        setPhase("results");
    }

    async function handleStartExperiment() {

        const audioReady =
            await ensureAudioReady();

        if (!audioReady) {

            alert(
                "Audio konnte nicht freigeschaltet werden."
            );

            return;
        }

        const newExperimentPlan =
            createExperimentPlan(
                selectedGroup
            );

        setExperimentPlan(
            newExperimentPlan
        );

        const firstTrial =
            generateTrial(
                newExperimentPlan[0]
                    .soundCondition,

                newExperimentPlan[0]
                    .searchType
            );

        setTrialIndex(0);

        setResults([]);

        setTrial(firstTrial);

        setStartTime(Date.now());

        setPhase("trial");
    }

    function finishTrial(clickedItem) {

        if (
            !trial ||
            startTime === null ||
            phase !== "trial"
        ) {

            return;
        }

        const reactionTime =
            Date.now() - startTime;

        const correct =
            clickedItem.isTarget;

        const nextResults = [
            ...results,
            {
                trialNumber:
                    results.length + 1,

                fieldSize:
                trial.size,

                soundCondition:
                trial.soundCondition,

                soundLabel:
                    formatSoundLabel(
                        trial.soundCondition
                    ),

                reactionTime,

                correct,

                searchType:
                trial.searchType
            }
        ];

        const nextTrialIndex =
            trialIndex + 1;

        setResults(nextResults);

        setTrialIndex(
            nextTrialIndex
        );

        if (
            nextTrialIndex === 40 &&
            !pauseDone
        ) {

            stopHum();

            setPhase("pause");

            return;
        }

        if (
            nextTrialIndex >=
            TRIALS_TOTAL
        ) {

            stopHum();

            setTrial(null);

            setStartTime(null);

            setPhase("postquestionnaire");

            return;
        }

        setPhase("fixation");
    }

    if (phase === "prequestionnaire") {

        return (
            <Questionnaire
                title="Vorfragebogen"
                description={
                    "Bitte beantworte zunächst einige Fragen " +
                    "zu deiner Person. Erst danach beginnt das " +
                    "Experiment."
                }
                questions={PRE_QUESTIONS}
                answers={preAnswers}
                onChange={updatePreAnswer}
                onSubmit={() => setPhase("intro")}
                submitLabel="Weiter"
            />
        );
    }

    if (phase === "postquestionnaire") {

        return (
            <Questionnaire
                title="Nachfragebogen – Visuelle Suche Experiment"
                description={
                    'Das "Netzbrummen" ist der Ton der ' +
                    "abgespielt wurde (50hz Ton)\n" +
                    "Präattentiv = Genau ein Merkmal unterschied " +
                    "(meistens schneller find bar)\n" +
                    "Attentiv = Mehr los auf ein Feld " +
                    "(genaueres Suchen erforderlich)"
                }
                questions={POST_QUESTIONS}
                answers={postAnswers}
                onChange={updatePostAnswer}
                onSubmit={handleFinishPostQuestionnaire}
                submitLabel="Abschließen & CSV speichern"
            />
        );
    }

    if (phase === "intro") {

        return (
            <div style={pageStyle}>
                <div style={cardStyle}>

                    <h1>
                        Visuelle Suche
                    </h1>

                    <p
                        style={{
                            marginTop: 20,
                            lineHeight: 1.6,
                            textAlign: "center",
                            opacity: 0.85
                        }}
                    >
                        Diese Studie untersucht Reaktionszeiten und
                        Genauigkeit bei visuellen Suchaufgaben unter
                        unterschiedlichen Darstellungsbedingungen.
                    </p>
                    <br/>
                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            marginBottom: 20,
                            justifyContent: "center",
                            flexWrap: "wrap"
                        }}
                    >

                        {["A", "B", "C", "D"].map(group => (

                            <button
                                key={group}
                                onClick={() =>
                                    setSelectedGroup(group)
                                }
                                style={{
                                    padding: "10px 20px",
                                    cursor: "pointer",

                                    background:
                                        selectedGroup === group
                                            ? "#4caf50"
                                            : "#333",

                                    color: "white",

                                    border:
                                        "1px solid #666",

                                    borderRadius: 6
                                }}
                            >
                                Gruppe {group}
                            </button>

                        ))}

                    </div>
                    <p>
                        Ausgewählt:
                        {" "}
                        Gruppe {selectedGroup ?? "-"}
                    </p>
                    <br/>
                    <button
                        onClick={
                            handleStartExperiment
                        }

                        disabled={!selectedGroup}

                        style={{
                            ...buttonStyle,

                            opacity:
                                selectedGroup
                                    ? 1
                                    : 0.5
                        }}
                    >
                        Experiment starten
                    </button>

                    <p
                        style={{
                            marginTop: 40,
                            fontSize: 12,
                            opacity: 0.6,
                            textAlign: "center"
                        }}
                    >
                        © 2026 HCI1 Gruppe01 — Hochschule Flensburg
                        <br />
                        Forschungsprojekt zur visuellen Wahrnehmung
                    </p>

                </div>
            </div>
        );
    }

    if (phase === "results") {

        return (
            <div style={pageStyle}>
                <div
                    style={{
                        ...cardStyle,
                        maxWidth: 1200
                    }}
                >

                    <h1>
                        Ergebnisse
                    </h1>

                    <div
                        style={{
                            margin: "16px 0 24px",
                            padding: "16px 20px",
                            border: "1px solid #4caf50",
                            borderRadius: 10,
                            background: "#1d2a1f",
                            textAlign: "center"
                        }}
                    >
                        <div
                            style={{
                                opacity: 0.8,
                                fontSize: 14
                            }}
                        >
                            Deine Teilnehmer-ID
                        </div>
                        <div
                            style={{
                                fontSize: 32,
                                fontWeight: "bold",
                                letterSpacing: 2,
                                marginTop: 4
                            }}
                        >
                            {participantId}
                        </div>
                        <div
                            style={{
                                opacity: 0.7,
                                fontSize: 12,
                                marginTop: 6
                            }}
                        >
                            Die CSV-Datei mit allen Antworten und
                            Messdaten wurde gespeichert.
                        </div>
                    </div>

                    <table
                        style={tableStyle}
                    >

                        <thead>
                        <tr>

                            <th style={tableHeaderStyle}>
                                Trial
                            </th>

                            <th style={tableHeaderStyle}>
                                Suchtyp
                            </th>

                            <th style={tableHeaderStyle}>
                                Audio
                            </th>

                            <th style={tableHeaderStyle}>
                                Zeit
                            </th>

                            <th style={tableHeaderStyle}>
                                Korrekt
                            </th>

                        </tr>
                        </thead>

                        <tbody>

                        {results.map(
                            (entry) => (

                                <tr
                                    key={
                                        entry.trialNumber
                                    }
                                >

                                    <td style={tableCellStyle}>
                                        {
                                            entry.trialNumber
                                        }
                                    </td>

                                    <td style={tableCellStyle}>
                                        {formatSearchLabel(
                                            entry.searchType
                                        )}
                                    </td>

                                    <td style={tableCellStyle}>
                                        {
                                            entry.soundLabel
                                        }
                                    </td>

                                    <td style={tableCellStyle}>
                                        {
                                            entry.reactionTime
                                        }
                                        ms
                                    </td>

                                    <td
                                        style={{
                                            ...tableCellStyle,
                                            color:
                                                entry.correct
                                                    ? "green"
                                                    : "red"
                                        }}
                                    >

                                        {
                                            entry.correct
                                                ? "Ja"
                                                : "Nein"
                                        }

                                    </td>

                                </tr>
                            )
                        )}

                        </tbody>

                    </table>

                </div>
            </div>
        );
    }

    if (phase === "pause") {

        const radius = 90;

        const circumference =
            2 * Math.PI * radius;

        const progress =
            pauseProgress / 30;

        const dashOffset =
            circumference * (1 - progress);

        return (
            <div style={pageStyle}>
                <p
                    style={{
                        color: "white",
                        marginTop: 20
                    }}
                >
                    Eine kleine Pause! Gleich geht's weiter..!
                </p>
                <div
                    style={{
                        position: "relative",
                        width: 250,
                        height: 250
                    }}
                >

                    <svg
                        width="250"
                        height="250"
                    >

                        <circle
                            cx="125"
                            cy="125"
                            r={radius}
                            stroke="#444"
                            strokeWidth="12"
                            fill="none"
                        />

                        <circle
                            cx="125"
                            cy="125"
                            r={radius}
                            stroke="#4caf50"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            transform="rotate(-90 125 125)"
                            style={{
                                transition:
                                    "stroke-dashoffset 0.05s linear"
                            }}
                        />

                    </svg>

                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 64,
                            color: "white",
                            fontWeight: "bold"
                        }}
                    >
                        {pauseTime}
                    </div>

                </div>
            </div>
        );
    }

    if (phase === "fixation") {

        return (
            <div style={pageStyle}>
                <h1
                    style={{
                        color: "white",
                        fontSize: 80
                    }}
                >
                    +
                </h1>
            </div>
        );
    }

    if (!trial) return null;

    const visuals =
        getGridVisuals();

    return (
        <div style={pageStyle}>

            <div
                style={{
                    display: "grid",

                    gridTemplateColumns:
                        `repeat(8, 1fr)`,

                    gap: visuals.gap
                }}
            >

                {trial.items.map(
                    (item, index) => (

                        <button
                            key={index}

                            onPointerDown={() =>
                                finishTrial(item)
                            }

                            style={{
                                width:
                                visuals.buttonSize,

                                height:
                                visuals.buttonSize,

                                background:
                                    "darkgray",

                                display: "flex",

                                alignItems:
                                    "center",

                                justifyContent:
                                    "center",

                                border:
                                    "1px solid #bdbdbd",

                                borderRadius: 8,

                                cursor:
                                    "pointer",

                                padding: 0
                            }}
                        >

                            {renderShape(
                                item,
                                visuals.dotSize
                            )}

                        </button>
                    )
                )}

            </div>
        </div>
    );
}

const pageStyle = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 20,
    padding: 24,
    boxSizing: "border-box",
    background: "#16171C"
};

const cardStyle = {
    width: "100%",
    maxWidth: 760,
    background: "#16171C",
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 24,
    color: "white"
};

const buttonStyle = {
    padding: "12px 24px",
    fontSize: 16,
    cursor: "pointer",
    borderRadius: 8,
    border: "1px solid #ccc",
    background: "black",
    color: "white"
};

const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    marginTop: 4,
    borderRadius: 6,
    border: "1px solid #555",
    background: "#2a2c34",
    color: "white",
    fontSize: 15
};

const scaleButtonStyle = {
    width: 40,
    height: 40,
    borderRadius: 6,
    border: "1px solid #555",
    color: "white",
    cursor: "pointer",
    fontSize: 15
};

const optionStyle = {
    display: "flex",
    gap: 10,
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #3a3c44",
    cursor: "pointer"
};

const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    background: "white",
    color: "black"
};

const tableHeaderStyle = {
    borderBottom: "2px solid #ccc",
    padding: "10px 8px",
    textAlign: "center",
    background: "#f0f0f0"
};

const tableCellStyle = {
    borderBottom: "1px solid #e0e0e0",
    padding: "8px",
    textAlign: "center"
};
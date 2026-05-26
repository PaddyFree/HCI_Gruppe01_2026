import { useEffect, useRef, useState } from "react";
import humSound from "./assets/Netzbrummen Simulation.wav";

const FIELD_SIZES = [64];
const TRIALS_TOTAL = 80;

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function createExperimentPlan() {

    const startWithPraeattentiv =
        Math.random() < 0.5;

    const firstSearchType =
        startWithPraeattentiv
            ? "praeattentiv"
            : "attentiv";

    const secondSearchType =
        startWithPraeattentiv
            ? "attentiv"
            : "praeattentiv";

    const firstAudioOrder =
        Math.random() < 0.5
            ? ["mit_netzbrummen", "ohne_netzbrummen"]
            : ["ohne_netzbrummen", "mit_netzbrummen"];

    const secondAudioOrder =
        Math.random() < 0.5
            ? ["mit_netzbrummen", "ohne_netzbrummen"]
            : ["ohne_netzbrummen", "mit_netzbrummen"];

    const blocks = [
        {
            searchType: firstSearchType,
            soundCondition: firstAudioOrder[0],
            count: 20
        },
        {
            searchType: firstSearchType,
            soundCondition: firstAudioOrder[1],
            count: 20
        },
        {
            searchType: secondSearchType,
            soundCondition: secondAudioOrder[0],
            count: 20
        },
        {
            searchType: secondSearchType,
            soundCondition: secondAudioOrder[1],
            count: 20
        }
    ];

    const trials = [];

    blocks.forEach((block) => {

        for (let i = 0; i < block.count; i++) {

            trials.push({
                soundCondition:
                block.soundCondition,

                searchType:
                block.searchType
            });
        }
    });

    return trials;
}

function generateTrial(soundCondition, searchType) {

    const size = getRandomElement(FIELD_SIZES);

    const targetIndex =
        Math.floor(Math.random() * size);

    const targetVariant =
        Math.random() < 0.5
            ? "targetA"
            : "targetB";

    let items = [];

    // PRÄATTENTIV
    if (searchType === "praeattentiv") {

        items = Array.from(
            { length: size },
            (_, index) => {

                if (index === targetIndex) {

                    // Roter Kreis
                    if (targetVariant === "targetA") {

                        return {
                            isTarget: true,
                            color: "red",
                            shape: "circle"
                        };
                    }

                    // Graues Quadrat
                    return {
                        isTarget: true,
                        color: "#666",
                        shape: "square"
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

        items = Array.from(
            { length: size },
            (_, index) => {

                if (index === targetIndex) {

                    // Roter Kreis
                    if (targetVariant === "targetA") {

                        return {
                            isTarget: true,
                            color: "red",
                            shape: "circle"
                        };
                    }

                    // Blaues Quadrat
                    return {
                        isTarget: true,
                        color: "blue",
                        shape: "square"
                    };
                }

                const distractor =
                    Math.random() < 0.5
                        ? {
                            color: "red",
                            shape: "square"
                        }
                        : {
                            color: "blue",
                            shape: "circle"
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

function downloadCSV(results) {

    const headers = [
        "trial",
        "searchType",
        "soundCondition",
        "reactionTime",
        "correct"
    ];

    const rows = results.map((entry) => [
        entry.trialNumber,
        entry.searchType,
        entry.soundCondition,
        entry.reactionTime,
        entry.correct
    ]);

    const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(","))
    ].join("\n");

    const blob = new Blob(
        [csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    const now = new Date();

    const fileName =
        `HCI2-Experiment_${now.getFullYear()}-` +
        `${String(now.getMonth() + 1).padStart(2, "0")}-` +
        `${String(now.getDate()).padStart(2, "0")}_` +
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

export default function App() {

    const [phase, setPhase] =
        useState("intro");

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
            createExperimentPlan();

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
            nextTrialIndex >=
            TRIALS_TOTAL
        ) {

            stopHum();

            downloadCSV(nextResults);

            setTrial(null);

            setStartTime(null);

            setPhase("results");

            return;
        }

        setPhase("fixation");
    }

    if (phase === "intro") {

        return (
            <div style={pageStyle}>
                <div style={cardStyle}>

                    <h1>
                        Visuelle Suche
                    </h1>


                    <button
                        onClick={
                            handleStartExperiment
                        }
                        style={buttonStyle}
                    >
                        Experiment starten
                    </button>


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

                            <div
                                style={{
                                    width:
                                    visuals.dotSize,

                                    height:
                                    visuals.dotSize,

                                    borderRadius:
                                        item.shape ===
                                        "circle"
                                            ? "50%"
                                            : "0%",

                                    background:
                                    item.color
                                }}
                            />

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
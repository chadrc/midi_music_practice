import {
    ADD_2_CHORDS_SET_NAME,
    ADD_9_CHORDS_SET_NAME,
    AUGMENTED_7TH_CHORDS_SET_NAME,
    AUGMENTED_CHORDS_SET_NAME,
    DIMINISHED_7TH_CHORDS_SET_NAME,
    DIMINISHED_CHORDS_SET_NAME,
    DOMINANT_7TH_CHORDS_SET_NAME,
    DOMINANT_9TH_CHORDS_SET_NAME,
    HALF_DIMINISHED_7TH_CHORDS_SET_NAME,
    MAJOR_6TH_CHORDS_SET_NAME,
    MAJOR_7TH_CHORDS_SET_NAME,
    MAJOR_9TH_CHORDS_SET_NAME,
    MAJOR_CHORDS_SET_NAME,
    MINOR_6TH_CHORDS_SET_NAME,
    MINOR_7TH_CHORDS_SET_NAME,
    MINOR_CHORDS_SET_NAME,
    POWER_CHORDS_SET_NAME,
    SHELL_CHORDS_SET_NAME,
    SUS_2_CHORDS_SET_NAME,
    SUS_4_CHORDS_SET_NAME,
} from "./chords";

export * from "./notes";
export * from "./chords";

export const LETTER_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const LETTER_NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const CHORD_TYPE_TO_NAME: {[key: string]: string} = {
    [MAJOR_CHORDS_SET_NAME]: "maj",
    [MINOR_CHORDS_SET_NAME]: "min",
    [DIMINISHED_CHORDS_SET_NAME]: "dim",
    [MAJOR_7TH_CHORDS_SET_NAME]: "maj7",
    [MINOR_7TH_CHORDS_SET_NAME]: "m7",
    [DIMINISHED_7TH_CHORDS_SET_NAME]: "dim7",
    [HALF_DIMINISHED_7TH_CHORDS_SET_NAME]: "m7b5",
    [DOMINANT_7TH_CHORDS_SET_NAME]: "7",
    [DOMINANT_9TH_CHORDS_SET_NAME]: "9",
    [MAJOR_9TH_CHORDS_SET_NAME]: "maj9",
    [AUGMENTED_CHORDS_SET_NAME]: "aug",
    [AUGMENTED_7TH_CHORDS_SET_NAME]: "aug7",
    [MAJOR_6TH_CHORDS_SET_NAME]: "6",
    [MINOR_6TH_CHORDS_SET_NAME]: "m6",
    [SUS_2_CHORDS_SET_NAME]: "sus2",
    [SUS_4_CHORDS_SET_NAME]: "sus4",
    [ADD_9_CHORDS_SET_NAME]: "add9",
    [ADD_2_CHORDS_SET_NAME]: "add2",
    [POWER_CHORDS_SET_NAME]: "5",
    [SHELL_CHORDS_SET_NAME]: "maj7shell",
};

export const formatMidiNote = (midiNote: number, preferFlats = false) => {
    // 0 is C-1
    const letterNo = ((midiNote % 12) + 12) % 12;
    const octave = scientificOctaveFromMidi(midiNote);
    const letters = preferFlats ? LETTER_NOTES_FLAT : LETTER_NOTES;

    return `${letters[letterNo]}${octave}`;
}

/** Scientific octave used in {@link formatMidiNote} (e.g. MIDI 60 → 4 for “C4”). */
export function scientificOctaveFromMidi(midiNote: number): number {
    return Math.floor(midiNote / 12) - 1;
}

export const formatMidiLetter = (midiNote: number, preferFlats = false) => {
    const letterNo = ((midiNote % 12) + 12) % 12;
    const letters = preferFlats ? LETTER_NOTES_FLAT : LETTER_NOTES;
    return `${letters[letterNo]}`;
}

export const formatChord = (type: string, note: number) => {
    return {
        note: formatMidiNote(note),
        chordType: CHORD_TYPE_TO_NAME[type]
    };
}

import {DIMINISHED_CHORDS_SET_NAME, MAJOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME} from "./chords";

export * from "./notes";
export * from "./chords";

export const LETTER_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHORD_TYPE_TO_NAME: {[key: string]: string} = {
    [MAJOR_CHORDS_SET_NAME]: "maj",
    [MINOR_CHORDS_SET_NAME]: "min",
    [DIMINISHED_CHORDS_SET_NAME]: "dim"
}

export const formatMidiNote = (midiNote: number) => {
    // 0 is C-1
    const letterNo = midiNote % 12;
    const octave = scientificOctaveFromMidi(midiNote);

    return `${LETTER_NOTES[letterNo]}${octave}`;
}

/** Scientific octave used in {@link formatMidiNote} (e.g. MIDI 60 → 4 for “C4”). */
export function scientificOctaveFromMidi(midiNote: number): number {
    return Math.floor(midiNote / 12) - 1;
}

export const formatMidiLetter = (midiNote: number) => {
    const letterNo = midiNote % 12;
    return `${LETTER_NOTES[letterNo]}`;
}

export const formatChord = (type: string, note: number) => {
    return {
        note: formatMidiNote(note),
        chordType: CHORD_TYPE_TO_NAME[type]
    };
}
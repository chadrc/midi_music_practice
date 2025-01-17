import {DIMINISHED_CHORDS_SET_NAME, MAJOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME} from "./scales";

export const LETTER_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHORD_TYPE_TO_NAME: {[key: string]: string} = {
    [MAJOR_CHORDS_SET_NAME]: "maj",
    [MINOR_CHORDS_SET_NAME]: "min",
    [DIMINISHED_CHORDS_SET_NAME]: "dmin"
}

export const formatMidiNote = (midiNote: number) => {
    // 0 is C-1
    const letterNo = midiNote % 12;
    const octave = Math.floor(midiNote / 12) - 1;

    return `${LETTER_NOTES[letterNo]}${octave}`;
}

export const formatMidiLetter = (midiNote: number) => {
    const letterNo = midiNote % 12;
    return `${LETTER_NOTES[letterNo]}`;
}

export const formatChord = (type: string, note: number) => {
    const chord = CHORD_TYPE_TO_NAME[type];
    return `${formatMidiNote(note)}${chord}`;
}
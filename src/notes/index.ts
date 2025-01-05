
export const LETTER_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const formatMidiNote = (midiNote: number) => {
    // 0 is C-1
    let letterNo = midiNote % 12;
    let octave = Math.floor(midiNote / 12) - 1;

    return `${LETTER_NOTES[letterNo]}${octave}`;
}

export const formatMidiLetter = (midiNote: number) => {
    let letterNo = midiNote % 12;
    return `${LETTER_NOTES[letterNo]}`;
}
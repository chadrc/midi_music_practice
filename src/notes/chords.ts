import type {BaseNoteRef, ScaleDegreePattern} from "./scales";
import {BaseNotes} from "./scales";

export class Chord {
    public readonly baseNote: BaseNoteRef;
    public readonly pattern: ScaleDegreePattern;

    /**
     * @param pattern Semitone degrees from root, same encoding as {@link NoteScale} (e.g. `MAJOR_CHORD_PATTERN`).
     */
    constructor(baseNote: BaseNoteRef, pattern: ScaleDegreePattern) {
        this.baseNote = baseNote;
        this.pattern = pattern;
    }

    get fundamental(): BaseNoteRef {
        return this.baseNote;
    }
}

export const MINOR_CHORDS_SET_NAME = "MINOR";
export const MAJOR_CHORDS_SET_NAME = "MAJOR";
export const DIMINISHED_CHORDS_SET_NAME = "DIMINISHED";

export const MAJOR_CHORD_PATTERN = [1, 5, 8];
export const MAJOR_7TH_CHORD_PATHERN = [1, 5, 8, 12];
export const MINOR_CHORD_PATTERN = [1, 4, 8];
export const MINOR_7th_CHORD_PATTERN = [1, 4, 8, 11];
export const DIMINISHED_CHORD_PATTERN = [1, 4, 7];
export const DIMINISHED_7TH_CHORD_PATTERN = [1, 4, 7, 10];
export const HALF_DIMINISHED_7TH_CHORD_PATTERN = [1, 4, 7, 11];
export const AUGMENTED_CHORD_PATTERN = [1, 5, 9];
export const AUGMENTED_7TH_CHORD_PATTERN = [1, 5, 9, 11];
export const DOMINANT_7TH_CHORD_PATTERN = [1, 5, 8, 11];
export const DOMINANT_9TH_CHORD_PATTERN = [1, 5, 8, 11, 15];
export const MAJOR_6TH_CHORD_PATTERN = [1, 5, 8, 10];
export const MINOR_6TH_CHORD_PATTERN = [1, 4, 8, 10];
export const SUS_2_CHORD_PATTERN = [1, 3, 8];
export const SUS_4_CHORD_PATTERN = [1, 6, 8];
export const ADD_9_CHORD_PATTERN = [1, 5, 8, 15];
export const ADD_2_CHORD_PATTERN = [1, 3, 5, 8];
export const FIVE_CHORD_PATTERN = [1, 8];

const CHORDS_MAP: { [key: string]: { [key: string]: Chord } } = {};

function makeChordsForPattern(degreePattern: ScaleDegreePattern) {
    const chords: {[key: string]: Chord} = {};

    [
        BaseNotes.C,
        BaseNotes.CSharp,
        BaseNotes.DFlat,
        BaseNotes.D,
        BaseNotes.DSharp,
        BaseNotes.EFlat,
        BaseNotes.E,
        BaseNotes.F,
        BaseNotes.FSharp,
        BaseNotes.GFlat,
        BaseNotes.G,
        BaseNotes.GSharp,
        BaseNotes.AFlat,
        BaseNotes.A,
        BaseNotes.ASharp,
        BaseNotes.BFlat,
        BaseNotes.B,
    ].forEach((note) => {
        chords[note.mapKey] = new Chord(note, degreePattern);
    });

    return chords;
}

CHORDS_MAP[MINOR_CHORDS_SET_NAME] = makeChordsForPattern(MINOR_CHORD_PATTERN);
CHORDS_MAP[MAJOR_CHORDS_SET_NAME] = makeChordsForPattern(MAJOR_CHORD_PATTERN);
CHORDS_MAP[DIMINISHED_CHORDS_SET_NAME] = makeChordsForPattern(DIMINISHED_CHORD_PATTERN);

export const CHORDS = CHORDS_MAP;

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
export const MAJOR_7TH_CHORDS_SET_NAME = "MAJOR_7TH";
export const MINOR_7TH_CHORDS_SET_NAME = "MINOR_7TH";
export const DIMINISHED_7TH_CHORDS_SET_NAME = "DIMINISHED_7TH";
export const HALF_DIMINISHED_7TH_CHORDS_SET_NAME = "HALF_DIMINISHED_7TH";
export const DOMINANT_7TH_CHORDS_SET_NAME = "DOMINANT_7TH";
export const DOMINANT_9TH_CHORDS_SET_NAME = "DOMINANT_9TH";
export const MAJOR_9TH_CHORDS_SET_NAME = "MAJOR_9TH";
export const AUGMENTED_CHORDS_SET_NAME = "AUGMENTED";
export const AUGMENTED_7TH_CHORDS_SET_NAME = "AUGMENTED_7TH";
export const MAJOR_6TH_CHORDS_SET_NAME = "MAJOR_6TH";
export const MINOR_6TH_CHORDS_SET_NAME = "MINOR_6TH";
export const SUS_2_CHORDS_SET_NAME = "SUS2";
export const SUS_4_CHORDS_SET_NAME = "SUS4";
export const ADD_9_CHORDS_SET_NAME = "ADD9";
export const ADD_2_CHORDS_SET_NAME = "ADD2";
export const POWER_CHORDS_SET_NAME = "POWER";
export const SHELL_CHORDS_SET_NAME = "SHELL";

/** All chord qualities selectable in routines (order = editor list order). */
export const CHORD_TYPE_OPTIONS = [
    MAJOR_CHORDS_SET_NAME,
    MINOR_CHORDS_SET_NAME,
    DIMINISHED_CHORDS_SET_NAME,
    MAJOR_7TH_CHORDS_SET_NAME,
    MINOR_7TH_CHORDS_SET_NAME,
    DIMINISHED_7TH_CHORDS_SET_NAME,
    HALF_DIMINISHED_7TH_CHORDS_SET_NAME,
    DOMINANT_7TH_CHORDS_SET_NAME,
    DOMINANT_9TH_CHORDS_SET_NAME,
    MAJOR_9TH_CHORDS_SET_NAME,
    AUGMENTED_CHORDS_SET_NAME,
    AUGMENTED_7TH_CHORDS_SET_NAME,
    MAJOR_6TH_CHORDS_SET_NAME,
    MINOR_6TH_CHORDS_SET_NAME,
    SUS_2_CHORDS_SET_NAME,
    SUS_4_CHORDS_SET_NAME,
    ADD_9_CHORDS_SET_NAME,
    ADD_2_CHORDS_SET_NAME,
    POWER_CHORDS_SET_NAME,
    SHELL_CHORDS_SET_NAME,
] as const;

export type ChordTypeFromOptions = (typeof CHORD_TYPE_OPTIONS)[number];

/** Qualities whose chord tones read more clearly with eb/bb spellings (e.g. C minor third as Eb not D#). */
const FLAT_SPELLING_CHORD_TYPES: ReadonlySet<ChordTypeFromOptions> = new Set([
    MINOR_CHORDS_SET_NAME,
    MINOR_7TH_CHORDS_SET_NAME,
    MINOR_6TH_CHORDS_SET_NAME,
    DIMINISHED_CHORDS_SET_NAME,
    DIMINISHED_7TH_CHORDS_SET_NAME,
    HALF_DIMINISHED_7TH_CHORDS_SET_NAME,
    DOMINANT_7TH_CHORDS_SET_NAME,
    DOMINANT_9TH_CHORDS_SET_NAME,
]);

export function chordSpellPrefersFlats(type: ChordTypeFromOptions): boolean {
    return FLAT_SPELLING_CHORD_TYPES.has(type);
}

export const MAJOR_CHORD_PATTERN = [1, 5, 8];
export const MAJOR_7TH_CHORD_PATTERN = [1, 5, 8, 12];
export const MINOR_CHORD_PATTERN = [1, 4, 8];
export const MINOR_7TH_CHORD_PATTERN = [1, 4, 8, 11];
export const DIMINISHED_CHORD_PATTERN = [1, 4, 7];
export const DIMINISHED_7TH_CHORD_PATTERN = [1, 4, 7, 10];
export const HALF_DIMINISHED_7TH_CHORD_PATTERN = [1, 4, 7, 11];
export const AUGMENTED_CHORD_PATTERN = [1, 5, 9];
export const AUGMENTED_7TH_CHORD_PATTERN = [1, 5, 9, 11];
export const DOMINANT_7TH_CHORD_PATTERN = [1, 5, 8, 11];
export const DOMINANT_9TH_CHORD_PATTERN = [1, 5, 8, 11, 15];
export const MAJOR_9TH_CHORD_PATTERN = [1, 5, 8, 12, 15];
export const MAJOR_6TH_CHORD_PATTERN = [1, 5, 8, 10];
export const MINOR_6TH_CHORD_PATTERN = [1, 4, 8, 10];
export const SUS_2_CHORD_PATTERN = [1, 3, 8];
export const SUS_4_CHORD_PATTERN = [1, 6, 8];
export const ADD_9_CHORD_PATTERN = [1, 5, 8, 15];
export const ADD_2_CHORD_PATTERN = [1, 3, 5, 8];
export const FIVE_CHORD_PATTERN = [1, 8];
export const SHELL_CHORD_PATTERN = [1, 5, 12];

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

const CHORD_REGISTRY: [string, ScaleDegreePattern][] = [
    [MAJOR_CHORDS_SET_NAME, MAJOR_CHORD_PATTERN],
    [MINOR_CHORDS_SET_NAME, MINOR_CHORD_PATTERN],
    [DIMINISHED_CHORDS_SET_NAME, DIMINISHED_CHORD_PATTERN],
    [MAJOR_7TH_CHORDS_SET_NAME, MAJOR_7TH_CHORD_PATTERN],
    [MINOR_7TH_CHORDS_SET_NAME, MINOR_7TH_CHORD_PATTERN],
    [DIMINISHED_7TH_CHORDS_SET_NAME, DIMINISHED_7TH_CHORD_PATTERN],
    [HALF_DIMINISHED_7TH_CHORDS_SET_NAME, HALF_DIMINISHED_7TH_CHORD_PATTERN],
    [DOMINANT_7TH_CHORDS_SET_NAME, DOMINANT_7TH_CHORD_PATTERN],
    [DOMINANT_9TH_CHORDS_SET_NAME, DOMINANT_9TH_CHORD_PATTERN],
    [MAJOR_9TH_CHORDS_SET_NAME, MAJOR_9TH_CHORD_PATTERN],
    [AUGMENTED_CHORDS_SET_NAME, AUGMENTED_CHORD_PATTERN],
    [AUGMENTED_7TH_CHORDS_SET_NAME, AUGMENTED_7TH_CHORD_PATTERN],
    [MAJOR_6TH_CHORDS_SET_NAME, MAJOR_6TH_CHORD_PATTERN],
    [MINOR_6TH_CHORDS_SET_NAME, MINOR_6TH_CHORD_PATTERN],
    [SUS_2_CHORDS_SET_NAME, SUS_2_CHORD_PATTERN],
    [SUS_4_CHORDS_SET_NAME, SUS_4_CHORD_PATTERN],
    [ADD_9_CHORDS_SET_NAME, ADD_9_CHORD_PATTERN],
    [ADD_2_CHORDS_SET_NAME, ADD_2_CHORD_PATTERN],
    [POWER_CHORDS_SET_NAME, FIVE_CHORD_PATTERN],
    [SHELL_CHORDS_SET_NAME, SHELL_CHORD_PATTERN],
];

for (const [setName, pattern] of CHORD_REGISTRY) {
    CHORDS_MAP[setName] = makeChordsForPattern(pattern);
}

export const CHORDS = CHORDS_MAP;

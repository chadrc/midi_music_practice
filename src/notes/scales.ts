import {exists} from "../utilities";

export enum BaseNotes {
    C = 0,
    CSharp = 1,
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
    DFlat = 1,
    D = 2,
    DSharp = 3,
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
    EFlat = 3,
    E = 4,
    F = 5,
    FSharp = 6,
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
    GFlat = 6,
    G = 7,
    GSharp = 8,
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
    AFlat = 8,
    A = 9,
    ASharp = 10,
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
    BFlat = 10,
    B = 11,
}

/**
 * Each value `d` is interpreted as (d − 1) semitones above the root (1 = P1, 2 = m2, …, 12 = 11 semitones, i.e. M7 — e.g. in C major, 1 = C and 12 = B, not the root an octave up). Same encoding as IONIAN_MODE_PATTERN.
 */
export type ScaleDegreePattern = number[];

function assertPitchClassDegree(baseNote: number, deg: number): void {
    if (!Number.isInteger(baseNote) || baseNote < 0 || baseNote > 11) {
        throw new RangeError(
            `NoteScale: baseNote must be an integer 0–11, got ${String(baseNote)}`,
        );
    }
    if (!Number.isInteger(deg) || deg < 1) {
        throw new RangeError(
            `NoteScale: each degree must be a positive integer (1 = unison, …), got ${String(deg)}`,
        );
    }
}

function pitchClassFromDegrees(baseNote: number, pattern: number[]): number[] {
    return pattern.map((deg) => {
        assertPitchClassDegree(baseNote, deg);
        return (baseNote + (deg - 1)) % 12;
    });
}

export class NoteScale {
    public readonly notes: number[];

    /**
     * @param pattern Each `d` encodes (d−1) semitones from the root (1 = root, 12 = M7, not P8). E.g. `IONIAN_MODE_PATTERN`.
     */
    constructor(
        baseNote: BaseNotes,
        pattern: ScaleDegreePattern,
    ) {
        this.notes = pitchClassFromDegrees(baseNote, pattern);
    }

    public get fundamental(): BaseNotes {
        return this.notes[0]
    }

    public contains(note: number): boolean {
        if (note < 0 || note > 127) {
            return false;
        }

        const col = note % 12;

        for (const scaleNote of this.notes) {
            if (col === scaleNote) {
                return true;
            }
        }

        return false;
    }
}

export class Chord {
    public readonly baseNote: BaseNotes;
    public readonly pattern: ScaleDegreePattern;

    /**
     * @param pattern Semitone degrees from root, same encoding as {@link NoteScale} (e.g. `MAJOR_CHORD_PATTERN`).
     */
    constructor(baseNote: BaseNotes, pattern: ScaleDegreePattern) {
        this.baseNote = baseNote;
        this.pattern = pattern;
    }

    get fundamental(): BaseNotes {
        return this.baseNote;
    }
}

export const MINOR_CHORDS_SET_NAME = "MINOR";
export const MAJOR_CHORDS_SET_NAME = "MAJOR";
export const DIMINISHED_CHORDS_SET_NAME = "DIMINISHED";

export const MAJOR_CHORD_PATTERN = [1, 5, 8]
export const MAJOR_7TH_CHORD_PATHERN = [1, 5, 8, 12]
export const MINOR_CHORD_PATTERN = [1, 4, 8]
export const MINOR_7th_CHORD_PATTERN = [1, 4, 8, 11]
export const DIMINISHED_CHORD_PATTERN = [1, 4, 7]
export const DIMINISHED_7TH_CHORD_PATTERN = [1, 4, 7, 10]
export const HALF_DIMINISHED_7TH_CHORD_PATTERN = [1, 4, 7, 11]
export const AUGMENTED_CHORD_PATTERN = [1, 5, 9]
export const AUGMENTED_7TH_CHORD_PATTERN = [1, 5, 9, 11]
export const DOMINANT_7TH_CHORD_PATTERN = [1, 5, 8, 11]
export const DOMINANT_9TH_CHORD_PATTERN = [1, 5, 8, 11, 15]
export const MAJOR_6TH_CHORD_PATTERN = [1, 5, 8, 10]
export const MINOR_6TH_CHORD_PATTERN = [1, 4, 8, 10]
export const SUS_2_CHORD_PATTERN = [1, 3, 8]
export const SUS_4_CHORD_PATTERN = [1, 6, 8]
export const ADD_9_CHORD_PATTERN = [1, 5, 8, 15]
export const ADD_2_CHORD_PATTERN = [1, 3, 5, 8]
export const FIVE_CHORD_PATTERN = [1, 8]

export const IONIAN_MODE_PATTERN = [1, 3, 5, 6, 8, 10, 12]
export const DORIAN_MODE_PATTERN = [1, 3, 4, 6, 8, 10, 11]
export const PHRYGIAN_MODE_PATTERN = [1, 2, 4, 6, 8, 9, 11]
export const LYDIAN_MODE_PATTERN = [1, 3, 5, 7, 8, 10, 12]
export const MIXOLYDIAN_MODE_PATTERN = [1, 3, 5, 6, 8, 10, 11]
export const AEOLIAN_MODE_PATTERN = [1, 3, 4, 6, 8, 9, 11]
export const LOCRIAN_MODE_PATTERN = [1, 2, 4, 6, 7, 9, 11]

export const CHROMATIC_DEGREES: ScaleDegreePattern = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
export const MAJOR_PENTATONIC_DEGREES: ScaleDegreePattern = [1, 3, 5, 8, 10]
export const MINOR_PENTATONIC_DEGREES: ScaleDegreePattern = [1, 4, 6, 8, 11]

// When NoteScale held per-degree chord type labels, these paired with IONIAN / AEOLIAN for diatonic harmony.
// export const MAJOR_SCALE_CHORDS = [MAJOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME, MAJOR_CHORDS_SET_NAME, MAJOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME, DIMINISHED_CHORDS_SET_NAME];
// export const MINOR_SCALE_CHORDS = [MINOR_CHORDS_SET_NAME, DIMINISHED_CHORDS_SET_NAME, MAJOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME, MAJOR_CHORDS_SET_NAME, MAJOR_CHORDS_SET_NAME]

const SCALES_MAP: { [key: string]: { [key: string]: NoteScale } } = {}
const CHORDS_MAP: { [key: string]: { [key: string]: Chord } } = {}

const registerScale = (baseNote: BaseNotes, pattern: number[], setName: string) => {
    const scale = new NoteScale(baseNote, pattern);
    if (!exists(SCALES_MAP[setName])) {
        SCALES_MAP[setName] = {};
    }

    const set = SCALES_MAP[setName];
    set[BaseNotes[baseNote]] = scale;
}

export const CHROMATIC_SCALE_SET_NAME = "Chromatic"
registerScale(
    BaseNotes.C,
    CHROMATIC_DEGREES,
    CHROMATIC_SCALE_SET_NAME
);

export const MAJOR_SCALE_SET_NAME = "Major";
[
    BaseNotes.A,
    BaseNotes.AFlat,
    BaseNotes.B,
    BaseNotes.BFlat,
    BaseNotes.C,
    BaseNotes.D,
    BaseNotes.DFlat,
    BaseNotes.E,
    BaseNotes.EFlat,
    BaseNotes.F,
    BaseNotes.FSharp,
    BaseNotes.G,
].forEach((note) => registerScale(note, IONIAN_MODE_PATTERN, MAJOR_SCALE_SET_NAME));

export const MAJOR_PENTATONIC_SCALE_SET_NAME = "MajorPentatonic";
[
    BaseNotes.C,
    BaseNotes.CSharp,
    BaseNotes.D,
    BaseNotes.DSharp,
    BaseNotes.E,
    BaseNotes.F,
    BaseNotes.FSharp,
    BaseNotes.G,
    BaseNotes.GSharp,
    BaseNotes.A,
    BaseNotes.ASharp,
    BaseNotes.B,
].forEach((note) => registerScale(note, MAJOR_PENTATONIC_DEGREES, MAJOR_PENTATONIC_SCALE_SET_NAME));

export const MINOR_SCALE_SET_NAME = "Minor";
[
    BaseNotes.A,
    BaseNotes.B,
    BaseNotes.BFlat,
    BaseNotes.C,
    BaseNotes.CSharp,
    BaseNotes.D,
    BaseNotes.DSharp,
    BaseNotes.E,
    BaseNotes.F,
    BaseNotes.FSharp,
    BaseNotes.G,
    BaseNotes.GSharp,
].forEach((note) => registerScale(note, AEOLIAN_MODE_PATTERN, MINOR_SCALE_SET_NAME));

export const MINOR_PENTATONIC_SCALE_SET_NAME = "MinorPentatonic";
[
    BaseNotes.C,
    BaseNotes.CSharp,
    BaseNotes.D,
    BaseNotes.DSharp,
    BaseNotes.E,
    BaseNotes.F,
    BaseNotes.FSharp,
    BaseNotes.G,
    BaseNotes.GSharp,
    BaseNotes.A,
    BaseNotes.BFlat,
    BaseNotes.B,
].forEach((note) => registerScale(note, MINOR_PENTATONIC_DEGREES, MINOR_PENTATONIC_SCALE_SET_NAME));

function makeChordsForPattern(degreePattern: ScaleDegreePattern) {
    const chords: {[key: string]: Chord} = {};

    [BaseNotes.C,
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
        BaseNotes.B
    ].forEach((note) => {
        chords[BaseNotes[note]] = new Chord(note, degreePattern)
    });

    return chords;
}

CHORDS_MAP[MINOR_CHORDS_SET_NAME] = makeChordsForPattern(MINOR_CHORD_PATTERN);
CHORDS_MAP[MAJOR_CHORDS_SET_NAME] = makeChordsForPattern(MAJOR_CHORD_PATTERN);
CHORDS_MAP[DIMINISHED_CHORDS_SET_NAME] = makeChordsForPattern(DIMINISHED_CHORD_PATTERN);

export const SCALES = SCALES_MAP

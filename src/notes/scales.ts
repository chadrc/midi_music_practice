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

export class NoteScale {
    public readonly notes: number[];
    private readonly _chords: string[];

    constructor(
        baseNote: BaseNotes,
        intervals: number[],
        chords: string[] = [],
    ) {
        this.notes = [baseNote];
        this._chords = chords;
        let currentNote = baseNote;
        for (const interval of intervals) {
            currentNote += interval;
            this.notes.push(currentNote % 12);
        }
    }

    public get fundamental(): BaseNotes {
        return this.notes[0]
    }

    public get chords(): Chord[] {
        const c: Chord[] = []

        for (let i = 0; i < this._chords.length; i++) {
            const note = this.notes[i];
            const chord = this._chords[i];

            c.push(CHORDS_MAP[chord][BaseNotes[note]]);
        }

        return c;
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

export class Chord extends NoteScale {
    public readonly type: string;

    constructor(
        baseNote: BaseNotes,
        intervals: number[],
        type: string,
    ) {
        super(baseNote, intervals, []);
        this.type = type;
    }

    public contains(note: number): boolean {
        return exists(this.notes.find((n) => n === note));
    }
}

const WHOLE = 2;
const HALF = 1;

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

export const MAJOR_SCALE_PATTERN = [WHOLE, WHOLE, HALF, WHOLE, WHOLE, WHOLE]
export const MAJOR_PENTATONIC_SCALE_PATTERN = [WHOLE, WHOLE, WHOLE + HALF, WHOLE, WHOLE + HALF]
export const MINOR_SCALE_PATTERN = [WHOLE, HALF, WHOLE, WHOLE, HALF, WHOLE]
export const MINOR_PENTATONIC_SCALE_PATTERN = [WHOLE + HALF, WHOLE, WHOLE, WHOLE + HALF]

export const MAJOR_SCALE_CHORDS = [MAJOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME, MAJOR_CHORDS_SET_NAME, MAJOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME, DIMINISHED_CHORDS_SET_NAME];
export const MINOR_SCALE_CHORDS = [MINOR_CHORDS_SET_NAME, DIMINISHED_CHORDS_SET_NAME, MAJOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME, MAJOR_CHORDS_SET_NAME, MAJOR_CHORDS_SET_NAME]

const SCALES_MAP: { [key: string]: { [key: string]: NoteScale } } = {}
const CHORDS_MAP: { [key: string]: { [key: string]: Chord } } = {}

const registerScale = (baseNote: BaseNotes, pattern: number[], chords: string[], setName: string) => {
    const scale = new NoteScale(baseNote, pattern, chords);
    if (!exists(SCALES_MAP[setName])) {
        SCALES_MAP[setName] = {};
    }

    const set = SCALES_MAP[setName];
    set[BaseNotes[baseNote]] = scale;
}

export const CHROMATIC_SCALE_SET_NAME = "Chromatic"
registerScale(
    BaseNotes.C,
    [HALF, HALF, HALF, HALF, HALF, HALF, HALF, HALF, HALF, HALF, HALF],
    [],
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
].forEach((note) => registerScale(note, MAJOR_SCALE_PATTERN, MAJOR_SCALE_CHORDS, MAJOR_SCALE_SET_NAME));

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
].forEach((note) => registerScale(note, MAJOR_PENTATONIC_SCALE_PATTERN, [], MAJOR_PENTATONIC_SCALE_SET_NAME));

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
].forEach((note) => registerScale(note, MINOR_SCALE_PATTERN, MINOR_SCALE_CHORDS, MINOR_SCALE_SET_NAME));

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
].forEach((note) => registerScale(note, MINOR_PENTATONIC_SCALE_PATTERN, [], MINOR_PENTATONIC_SCALE_SET_NAME));

function makeChordsForPattern(pattern: number[], type: string) {
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
        chords[BaseNotes[note]] = new Chord(note, pattern, type)
    });

    return chords;
}

CHORDS_MAP[MINOR_CHORDS_SET_NAME] = makeChordsForPattern([3, 4], MINOR_CHORDS_SET_NAME);
CHORDS_MAP[MAJOR_CHORDS_SET_NAME] = makeChordsForPattern([4, 3], MAJOR_CHORDS_SET_NAME);
CHORDS_MAP[DIMINISHED_CHORDS_SET_NAME] = makeChordsForPattern([3, 3], DIMINISHED_CHORDS_SET_NAME);

export const SCALES = SCALES_MAP

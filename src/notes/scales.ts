import {arrayOf, exists} from "../utilities";

export enum BaseNotes {
    C = 0,
    CSharp = 1,
    DFlat = 1,
    D = 2,
    DSharp = 3,
    EFlat = 3,
    E = 4,
    F = 5,
    FSharp = 6,
    GFlat = 6,
    G = 7,
    GSharp = 8,
    AFlat = 8,
    A = 9,
    ASharp = 10,
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
        for (let interval of intervals) {
            currentNote += interval;
            this.notes.push(currentNote % 12);
        }
    }

    public get fundamental(): BaseNotes {
        return this.notes[0]
    }

    public get chords(): Chord[] {
        let c: Chord[] = []

        for (let i = 0; i < this._chords.length; i++) {
            let note = this.notes[i];
            let chord = this._chords[i];

            c.push(CHORDS_MAP[chord][BaseNotes[note]]);
        }

        return c;
    }

    public contains(note: number): boolean {
        if (note < 0 || note > 127) {
            return false;
        }

        let col = note % 12;

        for (let scaleNote of this.notes) {
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

export const MAJOR_SCALE_PATTERN = [WHOLE, WHOLE, HALF, WHOLE, WHOLE, WHOLE]
export const MAJOR_PENTATONIC_SCALE_PATTERN = [WHOLE, WHOLE, WHOLE + HALF, WHOLE, WHOLE + HALF]
export const MINOR_SCALE_PATTERN = [WHOLE, HALF, WHOLE, WHOLE, HALF, WHOLE]
export const MINOR_PENTATONIC_SCALE_PATTERN = [WHOLE + HALF, WHOLE, WHOLE, WHOLE + HALF]

export const MAJOR_SCALE_CHORDS = [MAJOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME, MAJOR_CHORDS_SET_NAME, MAJOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME, DIMINISHED_CHORDS_SET_NAME];
export const MINOR_SCALE_CHORDS = [MINOR_CHORDS_SET_NAME, DIMINISHED_CHORDS_SET_NAME, MAJOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME, MAJOR_CHORDS_SET_NAME, MAJOR_CHORDS_SET_NAME]

const SCALES_MAP: { [key: string]: { [key: string]: NoteScale } } = {}
const CHORDS_MAP: { [key: string]: { [key: string]: Chord } } = {}

const registerScale = (baseNote: BaseNotes, pattern: number[], chords: string[], setName: string) => {
    let scale = new NoteScale(baseNote, pattern, chords);
    if (!exists(SCALES_MAP[setName])) {
        SCALES_MAP[setName] = {};
    }

    let set = SCALES_MAP[setName];
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
    let chords: {[key: string]: Chord} = {};

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

CHORDS_MAP[MINOR_CHORDS_SET_NAME] = makeChordsForPattern([3, 7], MINOR_CHORDS_SET_NAME);
CHORDS_MAP[MAJOR_CHORDS_SET_NAME] = makeChordsForPattern([4, 7], MAJOR_CHORDS_SET_NAME);
CHORDS_MAP[DIMINISHED_CHORDS_SET_NAME] = makeChordsForPattern([3, 6], DIMINISHED_CHORDS_SET_NAME);

export const SCALES = SCALES_MAP

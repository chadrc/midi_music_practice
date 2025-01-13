import {exists} from "../utilities";

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

    constructor(
        baseNote: BaseNotes,
        intervals: number[]
    ) {
        this.notes = [baseNote];
        let currentNote = baseNote;
        for (let interval of intervals) {
            currentNote += interval;
            this.notes.push(currentNote % 12);
        }
    }

    public get baseNote(): BaseNotes {
        return this.notes[0]
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

const WHOLE = 2;
const HALF = 1;

export const MAJOR_SCALE_PATTERN = [WHOLE, WHOLE, HALF, WHOLE, WHOLE, WHOLE]
export const MAJOR_PENTATONIC_SCALE_PATTERN = [WHOLE, WHOLE, WHOLE + HALF, WHOLE, WHOLE + HALF]
export const MINOR_SCALE_PATTERN = [WHOLE, HALF, WHOLE, WHOLE, HALF, WHOLE]
export const MINOR_PENTATONIC_SCALE_PATTERN = [WHOLE + HALF, WHOLE, WHOLE, WHOLE + HALF]

export const CHROMATIC_SCALE = new NoteScale(BaseNotes.C, [HALF, HALF, HALF, HALF, HALF, HALF, HALF, HALF, HALF, HALF, HALF])

const SCALES_MAP: { [key: string]: { [key: string]: NoteScale } } = {}

const registerScale = (baseNote: BaseNotes, pattern: number[], setName: string) => {
    let scale = new NoteScale(baseNote, pattern);
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
].forEach((note) => registerScale(note, MAJOR_SCALE_PATTERN, MAJOR_SCALE_SET_NAME));

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
].forEach((note) => registerScale(note, MAJOR_PENTATONIC_SCALE_PATTERN, MAJOR_PENTATONIC_SCALE_SET_NAME));

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
].forEach((note) => registerScale(note, MINOR_SCALE_PATTERN, MINOR_SCALE_SET_NAME));

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
].forEach((note) => registerScale(note, MINOR_PENTATONIC_SCALE_PATTERN, MINOR_PENTATONIC_SCALE_SET_NAME));

export const SCALES = SCALES_MAP

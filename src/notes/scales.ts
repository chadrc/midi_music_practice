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

export const CHROMATIC_SCALE = new NoteScale(BaseNotes.C, [HALF,HALF,HALF,HALF,HALF,HALF,HALF,HALF,HALF,HALF,HALF])

export const MAJOR_SCALES = {
    A: new NoteScale(BaseNotes.A, MAJOR_SCALE_PATTERN),
    AFlat: new NoteScale(BaseNotes.AFlat, MAJOR_SCALE_PATTERN),
    B: new NoteScale(BaseNotes.B, MAJOR_SCALE_PATTERN),
    BFlat: new NoteScale(BaseNotes.BFlat, MAJOR_SCALE_PATTERN),
    C: new NoteScale(BaseNotes.C, MAJOR_SCALE_PATTERN),
    D: new NoteScale(BaseNotes.D, MAJOR_SCALE_PATTERN),
    DFlat: new NoteScale(BaseNotes.DFlat, MAJOR_SCALE_PATTERN),
    E: new NoteScale(BaseNotes.E, MAJOR_SCALE_PATTERN),
    EFlat: new NoteScale(BaseNotes.EFlat, MAJOR_SCALE_PATTERN),
    F: new NoteScale(BaseNotes.F, MAJOR_SCALE_PATTERN),
    FSharp: new NoteScale(BaseNotes.FSharp, MAJOR_SCALE_PATTERN),
    G: new NoteScale(BaseNotes.G, MAJOR_SCALE_PATTERN),
}

export const MAJOR_PENTATONIC_SCALES = {
    C: new NoteScale(BaseNotes.C, MAJOR_PENTATONIC_SCALE_PATTERN),
    CSharp: new NoteScale(BaseNotes.CSharp, MAJOR_PENTATONIC_SCALE_PATTERN),
    D: new NoteScale(BaseNotes.D, MAJOR_PENTATONIC_SCALE_PATTERN),
    DSharp: new NoteScale(BaseNotes.DSharp, MAJOR_PENTATONIC_SCALE_PATTERN),
    E: new NoteScale(BaseNotes.E, MAJOR_PENTATONIC_SCALE_PATTERN),
    F: new NoteScale(BaseNotes.F, MAJOR_PENTATONIC_SCALE_PATTERN),
    FSharp: new NoteScale(BaseNotes.FSharp, MAJOR_PENTATONIC_SCALE_PATTERN),
    G: new NoteScale(BaseNotes.G, MAJOR_PENTATONIC_SCALE_PATTERN),
    GSharp: new NoteScale(BaseNotes.GSharp, MAJOR_PENTATONIC_SCALE_PATTERN),
    A: new NoteScale(BaseNotes.A, MAJOR_PENTATONIC_SCALE_PATTERN),
    ASharp: new NoteScale(BaseNotes.ASharp, MAJOR_PENTATONIC_SCALE_PATTERN),
    B: new NoteScale(BaseNotes.B, MAJOR_PENTATONIC_SCALE_PATTERN),
}

export const MINOR_SCALES = {
    A: new NoteScale(BaseNotes.A, MINOR_SCALE_PATTERN),
    B: new NoteScale(BaseNotes.B, MINOR_SCALE_PATTERN),
    BFlat: new NoteScale(BaseNotes.BFlat, MINOR_SCALE_PATTERN),
    C: new NoteScale(BaseNotes.C, MINOR_SCALE_PATTERN),
    CSharp: new NoteScale(BaseNotes.CSharp, MINOR_SCALE_PATTERN),
    D: new NoteScale(BaseNotes.D, MINOR_SCALE_PATTERN),
    DSharp: new NoteScale(BaseNotes.DSharp, MINOR_SCALE_PATTERN),
    E: new NoteScale(BaseNotes.E, MINOR_SCALE_PATTERN),
    F: new NoteScale(BaseNotes.F, MINOR_SCALE_PATTERN),
    FSharp: new NoteScale(BaseNotes.FSharp, MINOR_SCALE_PATTERN),
    G: new NoteScale(BaseNotes.G, MINOR_SCALE_PATTERN),
    GSharp: new NoteScale(BaseNotes.GSharp, MINOR_SCALE_PATTERN),
}

export const MINOR_PENTATONIC_SCALES = {
    C: new NoteScale(BaseNotes.C, MINOR_PENTATONIC_SCALE_PATTERN),
    CSharp: new NoteScale(BaseNotes.CSharp, MINOR_PENTATONIC_SCALE_PATTERN),
    D: new NoteScale(BaseNotes.D, MINOR_PENTATONIC_SCALE_PATTERN),
    DSharp: new NoteScale(BaseNotes.DSharp, MINOR_PENTATONIC_SCALE_PATTERN),
    E: new NoteScale(BaseNotes.E, MINOR_PENTATONIC_SCALE_PATTERN),
    F: new NoteScale(BaseNotes.F, MINOR_PENTATONIC_SCALE_PATTERN),
    FSharp: new NoteScale(BaseNotes.FSharp, MINOR_PENTATONIC_SCALE_PATTERN),
    G: new NoteScale(BaseNotes.G, MINOR_PENTATONIC_SCALE_PATTERN),
    GSharp: new NoteScale(BaseNotes.GSharp, MINOR_PENTATONIC_SCALE_PATTERN),
    A: new NoteScale(BaseNotes.A, MINOR_PENTATONIC_SCALE_PATTERN),
    BFlat: new NoteScale(BaseNotes.BFlat, MINOR_PENTATONIC_SCALE_PATTERN),
    B: new NoteScale(BaseNotes.B, MINOR_PENTATONIC_SCALE_PATTERN),
}
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
    B = 11
}

export class NoteScale {
    private readonly notes: number[];

    constructor(
        baseNote: BaseNotes,
        intervals: number[]
    ) {
        this.notes = [baseNote];
        let currentNote = baseNote;
        for (let interval of intervals) {
            currentNote += interval;
            this.notes.push(currentNote);
        }
    }

    public contains(note: number): boolean {
        let col = note % 12;

        for (let scaleNote of this.notes) {
            if (col === scaleNote) {
                return true;
            }
        }

        return false;
    }
}
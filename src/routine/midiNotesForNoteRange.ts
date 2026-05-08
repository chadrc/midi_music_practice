import {NoteRangeType, type UserRoutineNoteRange} from "./types";

export const STANDARD_TUNING_OPEN_FRET_NOTES = [40, 45, 50, 55, 59, 64];

export function midiNotesForNoteRange(nr: UserRoutineNoteRange): number[] {
    const notes: number[] = [];
    const {type, range} = nr;
    const {start, end} = range;
    switch (type) {
        case NoteRangeType.Notes: {
            for (let i = start; i <= end; i++) {
                notes.push(i);
            }
            break;
        }
        case NoteRangeType.Frets: {
            for (const note in STANDARD_TUNING_OPEN_FRET_NOTES) {
                for (let i = start; i <= end; i++) {
                    notes.push(STANDARD_TUNING_OPEN_FRET_NOTES[Number(note)] + i);
                }
            }
            break;
        }
        case NoteRangeType.Octaves: {
            const startingC = start * 12;
            const noteCount = (end - start) * 12;
            const lastNote = startingC + noteCount;

            for (let i = startingC; i <= lastNote; i++) {
                notes.push(i);
            }
            break;
        }
    }

    return notes;
}

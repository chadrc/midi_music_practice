import {midiNotesForNoteRange} from "./midiNotesForNoteRange";
import {NoteRangeType, type UserRoutineNoteRange} from "./types";

export interface NoteGridLayoutFromNoteRange {
    notes: number[];
    noteStyle: "box" | "circle" | "bar";
    columns: number;
    headers: string[];
    noteFormat: "number" | "letter" | "letter-octave";
}

/** Pure mapping from practice note range to {@link NoteGrid} props (shared by instrument panel and reference view). */
export function noteGridLayoutFromNoteRange(noteRange: UserRoutineNoteRange): NoteGridLayoutFromNoteRange {
    const notes = midiNotesForNoteRange(noteRange);

    let noteStyle: NoteGridLayoutFromNoteRange["noteStyle"];
    switch (noteRange.type) {
        case NoteRangeType.Notes:
            noteStyle = "box";
            break;
        case NoteRangeType.Frets:
            noteStyle = "circle";
            break;
        case NoteRangeType.Octaves:
            noteStyle = "bar";
            break;
        default:
            noteStyle = "box";
    }

    let columns: number;
    switch (noteRange.type) {
        case NoteRangeType.Notes:
            columns = 12;
            break;
        case NoteRangeType.Frets: {
            const {start, end} = noteRange.range;
            columns = end - start + 1;
            break;
        }
        case NoteRangeType.Octaves:
            columns = notes.length;
            break;
        default:
            columns = 1;
    }

    let headers: string[];
    switch (noteRange.type) {
        case NoteRangeType.Frets: {
            const {start, end} = noteRange.range;
            headers = [];
            for (let i = start; i <= end; ++i) {
                headers.push(i.toString());
            }
            break;
        }
        case NoteRangeType.Notes:
        case NoteRangeType.Octaves:
        default:
            headers = [];
    }

    let noteFormat: NoteGridLayoutFromNoteRange["noteFormat"];
    switch (noteRange.type) {
        case NoteRangeType.Notes:
        case NoteRangeType.Frets:
            noteFormat = "letter-octave";
            break;
        case NoteRangeType.Octaves:
        default:
            noteFormat = "letter";
    }

    return {notes, noteStyle, columns, headers, noteFormat};
}

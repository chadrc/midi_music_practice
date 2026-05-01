import {expect, test} from "vitest";
import {midiNotesForNoteRange, STANDARD_TUNING_OPEN_FRET_NOTES} from "../../src/routine";
import {NoteRangeType} from "../../src/routine/types";

test("Notes mode is contiguous MIDI inclusive", () => {
    const m = midiNotesForNoteRange({
        type: NoteRangeType.Notes,
        range: {start: 60, end: 62},
    });
    expect(m).to.deep.equal([60, 61, 62]);
});

test("Frets mode enumerates each string", () => {
    const m = midiNotesForNoteRange({
        type: NoteRangeType.Frets,
        range: {start: 0, end: 0},
    });
    expect(m).to.deep.equal([...STANDARD_TUNING_OPEN_FRET_NOTES]);
});

test("Octaves span semitone blocks", () => {
    const m = midiNotesForNoteRange({
        type: NoteRangeType.Octaves,
        range: {start: 0, end: 1},
    });
    expect(m).to.deep.equal([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
});

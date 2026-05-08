import {expect, test} from "vitest";
import {noteGridLayoutFromNoteRange} from "../../src/routine/noteGridLayout";
import {NoteRangeType} from "../../src/routine/types";

test("notes mode layout matches expected NoteGrid props", () => {
    const nr = {type: NoteRangeType.Notes, range: {start: 60, end: 71}};
    expect(noteGridLayoutFromNoteRange(nr)).to.deep.equal({
        notes: [
            60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71,
        ],
        noteStyle: "box",
        columns: 12,
        headers: [],
        noteFormat: "letter-octave",
    });
});

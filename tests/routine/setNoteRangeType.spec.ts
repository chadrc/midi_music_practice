import {expect, test} from "vitest";
import {setNoteRangeType} from "../../src/routine";
import {NoteRangeType} from "../../src/routine/types";

test("mutates type and rescales range when changing mode", () => {
    const nr = {type: NoteRangeType.Notes, range: {start: 0, end: 127}};
    setNoteRangeType(nr, NoteRangeType.Frets);
    expect(nr).to.deep.equal({type: NoteRangeType.Frets, range: {start: 0, end: 22}});
});

test("no-op when type unchanged", () => {
    const nr = {type: NoteRangeType.Notes, range: {start: 10, end: 50}};
    setNoteRangeType(nr, NoteRangeType.Notes);
    expect(nr).to.deep.equal({type: NoteRangeType.Notes, range: {start: 10, end: 50}});
});

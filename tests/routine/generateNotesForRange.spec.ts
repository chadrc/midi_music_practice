import {expect, test} from "vitest";
import {generateNotesForRange, STANDARD_TUNING_OPEN_FRET_NOTES} from "../../src/routine";
import {NoteRangeType} from "../../src/routine/types";

test("Frets mode uses open-string tuning offsets", () => {
    const open = generateNotesForRange({
        noteRange: {type: NoteRangeType.Frets, range: {start: 0, end: 0}},
      });
    expect(open).to.deep.equal([...STANDARD_TUNING_OPEN_FRET_NOTES]);
});

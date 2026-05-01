import {expect, test} from "vitest";
import {defaultUserRoutineNoteRange, NOTE_RANGE_MAX_MIDI} from "../../src/routine";
import {NoteRangeType} from "../../src/routine/types";

test("defaults to full MIDI span in Notes mode", () => {
    expect(defaultUserRoutineNoteRange()).to.deep.equal({
        type: NoteRangeType.Notes,
        range: {start: 0, end: NOTE_RANGE_MAX_MIDI},
    });
});

import {expect, test} from "vitest";
import {defaultUserRoutineNoteRange, ROUTINE_TRAVERSAL_OFFSET_MAX_STEP_INDEX, traversalPreviewMaxStepIndex} from "../../src/routine";
import {PracticePoolMode, PracticeType} from "../../src/routine/types";
import {MAJOR_CHORDS_SET_NAME} from "../../src/notes/chords";
import {MAJOR_SCALE_SET_NAME} from "../../src/notes/scales";

test("traversal offset UI max is a fixed chromatic cap (generation wraps modulo each segment length)", () => {
    expect(ROUTINE_TRAVERSAL_OFFSET_MAX_STEP_INDEX).to.equal(12);
    expect(
        traversalPreviewMaxStepIndex(
            {
                type: PracticeType.Chords,
                chordTypes: [MAJOR_CHORDS_SET_NAME],
                mode: PracticePoolMode.Up,
                octaveRange: {start: 4, end: 4},
            },
            defaultUserRoutineNoteRange(),
            "up",
        ),
    ).to.equal(12);
    expect(
        traversalPreviewMaxStepIndex(
            {
                type: PracticeType.Scales,
                scaleTypes: [MAJOR_SCALE_SET_NAME],
                mode: PracticePoolMode.Up,
                octaveRange: {start: 4, end: 4},
            },
            defaultUserRoutineNoteRange(),
            "down",
        ),
    ).to.equal(12);
});

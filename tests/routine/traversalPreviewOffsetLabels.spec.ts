import {expect, test} from "vitest";
import {defaultUserRoutineNoteRange, traversalPreviewOffsetLabels} from "../../src/routine";
import {PracticePoolMode, PracticeType} from "../../src/routine/types";
import {MAJOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME} from "../../src/notes/chords";
import {DORIAN_SCALE_SET_NAME, MAJOR_SCALE_SET_NAME} from "../../src/notes/scales";

test("chord pool lists each selected quality at the starting step", () => {
    expect(
        traversalPreviewOffsetLabels(
            {
                type: PracticeType.Chords,
                chordTypes: [MAJOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME],
                mode: PracticePoolMode.Up,
                baseNote: "C",
                octaveRange: {start: 4, end: 4},
            },
            defaultUserRoutineNoteRange(),
            "up",
            0,
        ),
    ).to.deep.equal(["Major: C", "Minor: C"]);
});

test("scale pool lists each selected type at the starting step", () => {
    expect(
        traversalPreviewOffsetLabels(
            {
                type: PracticeType.Scales,
                scaleTypes: [MAJOR_SCALE_SET_NAME, DORIAN_SCALE_SET_NAME],
                mode: PracticePoolMode.Up,
                baseNote: "C",
                octaveRange: {start: 4, end: 4},
            },
            defaultUserRoutineNoteRange(),
            "up",
            0,
        ),
    ).to.deep.equal(["Major (Ionian): C", "Dorian: C"]);
});

test("Major scale tooltip at step 8 wraps like step 1 (D on C Ionian octave 4)", () => {
    expect(
        traversalPreviewOffsetLabels(
            {
                type: PracticeType.Scales,
                scaleTypes: [MAJOR_SCALE_SET_NAME],
                mode: PracticePoolMode.Up,
                baseNote: "C",
                octaveRange: {start: 4, end: 4},
            },
            defaultUserRoutineNoteRange(),
            "up",
            8,
        ),
    ).to.deep.equal(["Major (Ionian): D"]);
});

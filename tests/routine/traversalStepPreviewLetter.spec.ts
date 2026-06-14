import {expect, test} from "vitest";
import {defaultUserRoutineNoteRange, traversalStepPreviewLetter} from "../../src/routine";
import {PracticePoolMode, PracticeType} from "../../src/routine/types";
import {MAJOR_CHORDS_SET_NAME} from "../../src/notes/chords";
import {MAJOR_SCALE_SET_NAME} from "../../src/notes/scales";

test("chord ascending step on C major triad octave 4 uses pitch-class letters", () => {
    expect(
        traversalStepPreviewLetter(
            {
                type: PracticeType.Chords,
                chordTypes: [MAJOR_CHORDS_SET_NAME],
                mode: PracticePoolMode.Up,
                octaveRange: {start: 4, end: 4},
            },
            defaultUserRoutineNoteRange(),
            "up",
            0,
        ),
    ).to.equal("C");
    expect(
        traversalStepPreviewLetter(
            {
                type: PracticeType.Chords,
                chordTypes: [MAJOR_CHORDS_SET_NAME],
                mode: PracticePoolMode.Up,
                octaveRange: {start: 4, end: 4},
            },
            defaultUserRoutineNoteRange(),
            "up",
            2,
        ),
    ).to.equal("G");
});

test("chord descending step 2 on C major triad octave 4 is C", () => {
    expect(
        traversalStepPreviewLetter(
            {
                type: PracticeType.Chords,
                chordTypes: [MAJOR_CHORDS_SET_NAME],
                mode: PracticePoolMode.Down,
                octaveRange: {start: 4, end: 4},
            },
            defaultUserRoutineNoteRange(),
            "down",
            2,
        ),
    ).to.equal("C");
});

test("scale ascending step 2 on C Ionian octave 4 is E", () => {
    expect(
        traversalStepPreviewLetter(
            {
                type: PracticeType.Scales,
                scaleTypes: [MAJOR_SCALE_SET_NAME],
                mode: PracticePoolMode.Up,
                octaveRange: {start: 4, end: 4},
            },
            defaultUserRoutineNoteRange(),
            "up",
            2,
        ),
    ).to.equal("E");
});

test("scale ascending step 8 on C Ionian octave 4 wraps to D (matches step 1)", () => {
    expect(
        traversalStepPreviewLetter(
            {
                type: PracticeType.Scales,
                scaleTypes: [MAJOR_SCALE_SET_NAME],
                mode: PracticePoolMode.Up,
                octaveRange: {start: 4, end: 4},
            },
            defaultUserRoutineNoteRange(),
            "up",
            8,
        ),
    ).to.equal("D");
    expect(
        traversalStepPreviewLetter(
            {
                type: PracticeType.Scales,
                scaleTypes: [MAJOR_SCALE_SET_NAME],
                mode: PracticePoolMode.Up,
                octaveRange: {start: 4, end: 4},
            },
            defaultUserRoutineNoteRange(),
            "up",
            1,
        ),
    ).to.equal("D");
});

test("chord ascending step wraps modulo triad length (e.g. 5 ≡ 2 on C major)", () => {
    expect(
        traversalStepPreviewLetter(
            {
                type: PracticeType.Chords,
                chordTypes: [MAJOR_CHORDS_SET_NAME],
                mode: PracticePoolMode.Up,
                octaveRange: {start: 4, end: 4},
            },
            defaultUserRoutineNoteRange(),
            "up",
            5,
        ),
    ).to.equal("G");
});

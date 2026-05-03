import {expect, test} from "vitest";
import {noteScaleFromPractice} from "../../src/routine";
import {MAJOR_SCALE_SET_NAME} from "../../src/notes/scales";
import {PracticePoolMode, PracticeType} from "../../src/routine/types";

test("Notes practice uses chromatic pitch-class set", () => {
    const scale = noteScaleFromPractice({type: PracticeType.Notes});
    expect([...scale.notes]).to.deep.equal([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
});

test("Chords practice uses chromatic pitch-class set", () => {
    const scale = noteScaleFromPractice({
        type: PracticeType.Chords,
        chordTypes: [],
        mode: PracticePoolMode.Random,
    });
    expect([...scale.notes]).to.deep.equal([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
});

test("Scales practice with major type uses diatonic pitch classes", () => {
    const scale = noteScaleFromPractice({
        type: PracticeType.Scales,
        baseNote: "C",
        scaleTypes: [MAJOR_SCALE_SET_NAME],
        mode: PracticePoolMode.Up,
    });
    expect([...scale.notes]).to.deep.equal([0, 2, 4, 5, 7, 9, 11]);
});

test("Scales practice with empty scaleTypes defaults to diatonic major pitch classes", () => {
    const scale = noteScaleFromPractice({
        type: PracticeType.Scales,
        baseNote: "C",
        scaleTypes: [],
        mode: PracticePoolMode.Random,
    });
    expect([...scale.notes]).to.deep.equal([0, 2, 4, 5, 7, 9, 11]);
});

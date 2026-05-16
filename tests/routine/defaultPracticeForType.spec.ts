import {expect, test} from "vitest";
import {defaultPracticeForType} from "../../src/routine";
import {DEFAULT_PRACTICE_OCTAVE_RANGE, PracticePoolMode, PracticeType} from "../../src/routine/types";

test("Notes default has no embedded settings beyond type", () => {
    expect(defaultPracticeForType(PracticeType.Notes)).to.deep.equal({
        type: PracticeType.Notes,
    });
});

test("Chords default uses empty type pool and Random mode", () => {
    expect(defaultPracticeForType(PracticeType.Chords)).to.deep.equal({
        type: PracticeType.Chords,
        chordTypes: [],
        mode: PracticePoolMode.Random,
        octaveRange: {...DEFAULT_PRACTICE_OCTAVE_RANGE},
        upDownOffsetUp: 0,
        upDownOffsetDown: 0,
    });
});

test("Scales default uses empty type pool and Random mode", () => {
    expect(defaultPracticeForType(PracticeType.Scales)).to.deep.equal({
        type: PracticeType.Scales,
        scaleTypes: [],
        mode: PracticePoolMode.Random,
        octaveRange: {...DEFAULT_PRACTICE_OCTAVE_RANGE},
        upDownOffsetUp: 0,
        upDownOffsetDown: 0,
    });
});

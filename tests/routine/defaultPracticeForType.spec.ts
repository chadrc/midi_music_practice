import {expect, test} from "vitest";
import {defaultPracticeForType, defaultUserRoutineNoteRange} from "../../src/routine";
import {DEFAULT_PRACTICE_OCTAVE_RANGE, PracticePoolMode, PracticeType} from "../../src/routine/types";

test("Notes default includes full default note range", () => {
    expect(defaultPracticeForType(PracticeType.Notes)).to.deep.equal({
        type: PracticeType.Notes,
        noteRange: defaultUserRoutineNoteRange(),
    });
});

test("Chords default uses empty type pool and Random mode", () => {
    expect(defaultPracticeForType(PracticeType.Chords)).to.deep.equal({
        type: PracticeType.Chords,
        chordTypes: [],
        mode: PracticePoolMode.Random,
        octaveRange: {...DEFAULT_PRACTICE_OCTAVE_RANGE},
    });
});

test("Scales default uses empty type pool and Random mode", () => {
    expect(defaultPracticeForType(PracticeType.Scales)).to.deep.equal({
        type: PracticeType.Scales,
        scaleTypes: [],
        mode: PracticePoolMode.Random,
        octaveRange: {...DEFAULT_PRACTICE_OCTAVE_RANGE},
    });
});

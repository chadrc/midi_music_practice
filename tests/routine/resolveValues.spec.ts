import {expect, test} from "vitest";
import {resolveValues, defaultPracticeForType, defaultUserRoutineNoteRange} from "../../src/routine";
import {ParentType, PracticeType} from "../../src/routine/types";

test("fills nulls from defaults (full baked object)", () => {
    expect(
        resolveValues(
            {
                name: null,
                seed: null,
                parentSettings: ParentType.First,
                repeatCount: 2,
                cloneRepeat: true,
                targetBPM: null,
                noteRange: null,
                practice: null,
                requireOctave: null,
                minSuccessVelocity: null,
                promptCount: 7,
            },
            {
                name: "defaults",
                seed: null,
                targetBPM: 100,
                noteRange: defaultUserRoutineNoteRange(),
                practice: defaultPracticeForType(PracticeType.Notes),
                requireOctave: false,
                minSuccessVelocity: 10,
                promptCount: 5,
            },
        ),
    ).to.deep.equal({
        name: "defaults",
        repeatCount: 2,
        cloneRepeat: true,
        parentSettings: ParentType.First,
        seed: null,
        targetBPM: 100,
        noteRange: defaultUserRoutineNoteRange(),
        practice: defaultPracticeForType(PracticeType.Notes),
        requireOctave: false,
        minSuccessVelocity: 10,
        promptCount: 7,
    });
});

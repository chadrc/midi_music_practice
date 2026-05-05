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
                freePlayInSet: false,
                maxConsecutiveSamePitchSuccess: null,
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
        freePlayInSet: false,
        maxConsecutiveSamePitchSuccess: null,
    });
});

test("repeatCount and cloneRepeat are not overwritten when defaults are baked parent", () => {
    const userDefaults = {
        name: "defaults",
        seed: null,
        targetBPM: 100,
        noteRange: defaultUserRoutineNoteRange(),
        practice: defaultPracticeForType(PracticeType.Notes),
        requireOctave: false,
        minSuccessVelocity: 10,
        promptCount: 5,
        freePlayInSet: false,
        maxConsecutiveSamePitchSuccess: null,
    };
    const first = resolveValues(
        {
            name: "A",
            seed: null,
            parentSettings: ParentType.Settings,
            repeatCount: 1,
            cloneRepeat: false,
            targetBPM: null,
            noteRange: null,
            practice: null,
            requireOctave: null,
            minSuccessVelocity: null,
            promptCount: null,
        },
        userDefaults,
    );
    const second = resolveValues(
        {
            name: "B",
            seed: null,
            parentSettings: ParentType.Previous,
            repeatCount: 5,
            cloneRepeat: true,
            targetBPM: null,
            noteRange: null,
            practice: null,
            requireOctave: null,
            minSuccessVelocity: null,
            promptCount: null,
        },
        first,
    );
    expect(second.repeatCount).toBe(5);
    expect(second.cloneRepeat).toBe(true);
    expect(second.parentSettings).toBe(ParentType.Previous);
});

test("repeatCount null or undefined inherits from baked parent", () => {
    const userDefaults = {
        name: "defaults",
        seed: null,
        targetBPM: 100,
        noteRange: defaultUserRoutineNoteRange(),
        practice: defaultPracticeForType(PracticeType.Notes),
        requireOctave: false,
        minSuccessVelocity: 10,
        promptCount: 5,
        freePlayInSet: false,
        maxConsecutiveSamePitchSuccess: null,
    };
    const first = resolveValues(
        {
            name: "A",
            seed: null,
            parentSettings: ParentType.Settings,
            repeatCount: 4,
            cloneRepeat: false,
            targetBPM: null,
            noteRange: null,
            practice: null,
            requireOctave: null,
            minSuccessVelocity: null,
            promptCount: null,
        },
        userDefaults,
    );
    const second = resolveValues(
        {
            name: "B",
            seed: null,
            parentSettings: ParentType.Previous,
            repeatCount: null as unknown as number,
            cloneRepeat: false,
            targetBPM: null,
            noteRange: null,
            practice: null,
            requireOctave: null,
            minSuccessVelocity: null,
            promptCount: null,
        },
        first,
    );
    expect(second.repeatCount).toBe(4);
});

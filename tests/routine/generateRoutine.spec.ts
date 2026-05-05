import {expect, test} from "vitest";
import {generateRoutine, defaultPracticeForType, defaultUserRoutineNoteRange} from "../../src/routine";
import {ParentType, PracticeType} from "../../src/routine/types";

test("empty parts yields empty routine object", () => {
    expect(
        generateRoutine(
            {id: "x", appVersion: "1", schemaVersion: "0", name: "n", parts: []},
            {
                name: "u",
                seed: 1,
                targetBPM: 120,
                noteRange: defaultUserRoutineNoteRange(),
                practice: defaultPracticeForType(PracticeType.Notes),
                requireOctave: true,
                minSuccessVelocity: 1,
                promptCount: 1,
                freePlayInSet: false,
                maxConsecutiveSamePitchSuccess: null,
            },
        ),
    ).to.deep.equal({parts: []});
});

test("bakes one part into full repetition + bakedSettings", () => {
    const r = generateRoutine(
        {
            id: "x",
            appVersion: "1",
            schemaVersion: "0",
            name: "n",
            parts: [
                {
                    name: "p",
                    seed: 99,
                    parentSettings: ParentType.Settings,
                    repeatCount: 0,
                    cloneRepeat: false,
                    targetBPM: 120,
                    noteRange: defaultUserRoutineNoteRange(),
                    practice: defaultPracticeForType(PracticeType.Notes),
                    requireOctave: true,
                    minSuccessVelocity: 1,
                    promptCount: 3,
                    freePlayInSet: false,
                    maxConsecutiveSamePitchSuccess: null,
                },
            ],
        },
        {
            name: "u",
            seed: 99,
            targetBPM: 120,
            noteRange: defaultUserRoutineNoteRange(),
            practice: defaultPracticeForType(PracticeType.Notes),
            requireOctave: true,
            minSuccessVelocity: 1,
            promptCount: 1,
            freePlayInSet: false,
            maxConsecutiveSamePitchSuccess: null,
        },
    );
    const stripped = {
        parts: r.parts.map((p) => ({
            name: p.name,
            repetitions: p.repetitions,
            bakedSettings: p.bakedSettings,
        })),
    };
    expect(stripped).to.deep.equal({
        parts: [
            {
                name: "p",
                repetitions: [
                    {
                        prompts: [
                            {
                                index: 0,
                                notes: [126],
                                color: "rose",
                                displays: [{kind: "note", note: "F#9"}],
                            },
                            {
                                index: 2,
                                notes: [44],
                                color: "purple",
                                displays: [{kind: "note", note: "G#2"}],
                            },
                            {
                                index: 1,
                                notes: [24],
                                color: "amber",
                                displays: [{kind: "note", note: "C1"}],
                            },
                        ],
                    },
                ],
                bakedSettings: {
                    name: "p",
                    repeatCount: 0,
                    cloneRepeat: false,
                    parentSettings: ParentType.Settings,
                    seed: 99,
                    targetBPM: 120,
                    noteRange: defaultUserRoutineNoteRange(),
                    practice: defaultPracticeForType(PracticeType.Notes),
                    requireOctave: true,
                    minSuccessVelocity: 1,
                    promptCount: 3,
                    freePlayInSet: false,
                    maxConsecutiveSamePitchSuccess: null,
                },
            },
        ],
    });
});

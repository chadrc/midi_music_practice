import {expect, test} from "vitest";
import {generateRoutineSet} from "../../src/routine";
import {minimalBakedPart} from "./fixtures";

test("creates repetitions from repeatCount + 1 (full shape)", () => {
    const settings = minimalBakedPart({repeatCount: 2, promptCount: 1, seed: 333});
    const part = generateRoutineSet(settings);
    expect({
        name: part.name,
        bakedSettings: part.bakedSettings,
        repetitions: part.repetitions,
    }).to.deep.equal({
        name: "part",
        bakedSettings: settings,
        repetitions: [
            {
                prompts: [
                    {
                        index: 0,
                        notes: [41],
                        color: "emerald",
                        displays: [{kind: "note", note: "F2"}],
                    },
                ],
            },
            {
                prompts: [
                    {
                        index: 0,
                        notes: [18],
                        color: "emerald",
                        displays: [{kind: "note", note: "F#0"}],
                    },
                ],
            },
            {
                prompts: [
                    {
                        index: 0,
                        notes: [35],
                        color: "lime",
                        displays: [{kind: "note", note: "B1"}],
                    },
                ],
            },
        ],
    });
});

test("cloneRepeat reuses identical prompt arrays", () => {
    const part = generateRoutineSet(
        minimalBakedPart({
            cloneRepeat: true,
            repeatCount: 1,
            promptCount: 2,
            seed: 0.25,
        }),
    );
    const expectedPrompts = [
        {
            index: 0,
            notes: [0],
            color: "emerald",
            displays: [{kind: "note", note: "C-1"}],
        },
        {
            index: 1,
            notes: [0],
            color: "emerald",
            displays: [{kind: "note", note: "C-1"}],
        },
    ];
    expect(part.repetitions[0].prompts).to.deep.equal(expectedPrompts);
    expect(part.repetitions[1].prompts).to.deep.equal(expectedPrompts);
});

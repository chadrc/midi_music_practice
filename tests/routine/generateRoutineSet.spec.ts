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
                        notes: [86],
                        color: "slate",
                        displays: [{kind: "note", note: "D6"}],
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
                        notes: [92],
                        color: "lime",
                        displays: [{kind: "note", note: "G#6"}],
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
            index: 1,
            notes: [0],
            color: "emerald",
            displays: [{kind: "note", note: "C-1"}],
        },
        {
            index: 0,
            notes: [0],
            color: "emerald",
            displays: [{kind: "note", note: "C-1"}],
        },
    ];
    expect(part.repetitions[0].prompts).to.deep.equal(expectedPrompts);
    expect(part.repetitions[1].prompts).to.deep.equal(expectedPrompts);
});

test("coerces string repeatCount (e.g. from InputNumber) into repetition count", () => {
    const part = generateRoutineSet(
        minimalBakedPart({
            repeatCount: "4" as unknown as number,
            promptCount: 1,
            seed: 0.5,
        }),
    );
    expect(part.repetitions.length).toBe(5);
});

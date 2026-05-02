import {expect, test} from "vitest";
import {generateScalePrompts} from "../../src/routine";
import {PracticePoolMode, PracticeType} from "../../src/routine/types";
import {MAJOR_SCALE_SET_NAME} from "../../src/notes/scales";
import {NumberGenerator} from "../../src/common/NumberGenerator";
import {minimalBakedPart} from "./fixtures";

test("emits scale prompts with one note each for fixed seed", () => {
    const prompts = generateScalePrompts(
        minimalBakedPart({
            promptCount: 2,
            practice: {
                type: PracticeType.Scales,
                baseNote: "C",
                scaleTypes: [MAJOR_SCALE_SET_NAME],
                mode: PracticePoolMode.Up,
            },
        }),
        new NumberGenerator(12347),
    );
    const byIndex = [...prompts].sort((a, b) => a.index - b.index);
    expect(byIndex).to.deep.equal([
        {
            index: 0,
            notes: [36],
            color: "red",
            displays: [{kind: "note", note: "C2"}],
        },
        {
            index: 1,
            notes: [38],
            color: "amber",
            displays: [{kind: "note", note: "D2"}],
        },
    ]);
});

test("Up mode walks scale degrees in order from lowest part octave upward", () => {
    const prompts = generateScalePrompts(
        minimalBakedPart({
            promptCount: 3,
            practice: {
                type: PracticeType.Scales,
                baseNote: "C",
                scaleTypes: [MAJOR_SCALE_SET_NAME],
                mode: PracticePoolMode.Up,
                octaveRange: {start: 2, end: 4},
            },
        }),
        new NumberGenerator(1),
    );
    const byIndex = [...prompts].sort((a, b) => a.index - b.index);
    expect(byIndex).to.deep.equal([
        {
            index: 0,
            notes: [36],
            color: "sky",
            displays: [{kind: "note", note: "C2"}],
        },
        {
            index: 1,
            notes: [38],
            color: "orange",
            displays: [{kind: "note", note: "D2"}],
        },
        {
            index: 2,
            notes: [40],
            color: "orange",
            displays: [{kind: "note", note: "E2"}],
        },
    ]);
});

test("Down mode walks from highest part octave through scale degrees downward", () => {
    const prompts = generateScalePrompts(
        minimalBakedPart({
            promptCount: 3,
            practice: {
                type: PracticeType.Scales,
                baseNote: "C",
                scaleTypes: [MAJOR_SCALE_SET_NAME],
                mode: PracticePoolMode.Down,
                octaveRange: {start: 2, end: 4},
            },
        }),
        new NumberGenerator(1),
    );
    const byIndex = [...prompts].sort((a, b) => a.index - b.index);
    expect(byIndex).to.deep.equal([
        {
            index: 0,
            notes: [60],
            color: "sky",
            displays: [{kind: "note", note: "C4"}],
        },
        {
            index: 1,
            notes: [62],
            color: "orange",
            displays: [{kind: "note", note: "D4"}],
        },
        {
            index: 2,
            notes: [64],
            color: "orange",
            displays: [{kind: "note", note: "E4"}],
        },
    ]);
});

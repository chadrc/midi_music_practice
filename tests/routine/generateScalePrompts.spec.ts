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
            color: "fuchsia",
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
            color: "purple",
            displays: [{kind: "note", note: "D2"}],
        },
        {
            index: 2,
            notes: [40],
            color: "purple",
            displays: [{kind: "note", note: "E2"}],
        },
    ]);
});

test("Random mode visits each scale degree once per cycle before repeating", () => {
    const prompts = generateScalePrompts(
        minimalBakedPart({
            promptCount: 7,
            practice: {
                type: PracticeType.Scales,
                baseNote: "C",
                scaleTypes: [MAJOR_SCALE_SET_NAME],
                mode: PracticePoolMode.Random,
                octaveRange: {start: 4, end: 4},
            },
        }),
        new NumberGenerator(1),
    );
    expect(prompts).to.deep.equal([
        {
            index: 0,
            notes: [60],
            color: "cyan",
            displays: [{kind: "note", note: "C4"}],
        },
        {
            index: 1,
            notes: [64],
            color: "orange",
            displays: [{kind: "note", note: "E4"}],
        },
        {
            index: 2,
            notes: [62],
            color: "purple",
            displays: [{kind: "note", note: "D4"}],
        },
        {
            index: 3,
            notes: [67],
            color: "red",
            displays: [{kind: "note", note: "G4"}],
        },
        {
            index: 4,
            notes: [71],
            color: "indigo",
            displays: [{kind: "note", note: "B4"}],
        },
        {
            index: 5,
            notes: [65],
            color: "blue",
            displays: [{kind: "note", note: "F4"}],
        },
        {
            index: 6,
            notes: [69],
            color: "yellow",
            displays: [{kind: "note", note: "A4"}],
        },
    ]);
});

test("Random mode starts a fresh cycle after exhausting degrees (partial second cycle)", () => {
    const prompts = generateScalePrompts(
        minimalBakedPart({
            promptCount: 9,
            practice: {
                type: PracticeType.Scales,
                baseNote: "C",
                scaleTypes: [MAJOR_SCALE_SET_NAME],
                mode: PracticePoolMode.Random,
                octaveRange: {start: 4, end: 4},
            },
        }),
        new NumberGenerator(2),
    );
    expect(prompts).to.deep.equal([
        {
            index: 0,
            notes: [69],
            color: "slate",
            displays: [{kind: "note", note: "A4"}],
        },
        {
            index: 1,
            notes: [71],
            color: "sky",
            displays: [{kind: "note", note: "B4"}],
        },
        {
            index: 2,
            notes: [62],
            color: "purple",
            displays: [{kind: "note", note: "D4"}],
        },
        {
            index: 3,
            notes: [67],
            color: "purple",
            displays: [{kind: "note", note: "G4"}],
        },
        {
            index: 4,
            notes: [64],
            color: "indigo",
            displays: [{kind: "note", note: "E4"}],
        },
        {
            index: 5,
            notes: [60],
            color: "purple",
            displays: [{kind: "note", note: "C4"}],
        },
        {
            index: 6,
            notes: [65],
            color: "orange",
            displays: [{kind: "note", note: "F4"}],
        },
        {
            index: 7,
            notes: [67],
            color: "red",
            displays: [{kind: "note", note: "G4"}],
        },
        {
            index: 8,
            notes: [64],
            color: "amber",
            displays: [{kind: "note", note: "E4"}],
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
            color: "purple",
            displays: [{kind: "note", note: "D4"}],
        },
        {
            index: 2,
            notes: [64],
            color: "purple",
            displays: [{kind: "note", note: "E4"}],
        },
    ]);
});

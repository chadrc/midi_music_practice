import {expect, test} from "vitest";
import {generateScalePrompts} from "../../src/routine";
import {PracticePoolMode, PracticeType} from "../../src/routine/types";
import {MAJOR_SCALE_SET_NAME} from "../../src/notes/scales";
import {NumberGenerator} from "../../src/common/NumberGenerator";
import {minimalBakedPart} from "./fixtures";

const cIonian2 = [36, 38, 40, 41, 43, 45, 47];
const cIonian4 = [60, 62, 64, 65, 67, 69, 71];
const cIonianDegreePC = [0, 2, 4, 5, 7, 9, 11];

test("emits scale prompts with one note each for fixed seed", () => {
    const generated = generateScalePrompts(
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
    expect(generated).to.deep.equal({
        prompts: [
            {
                index: 0,
                notes: [36],
                color: "fuchsia",
                displays: [{kind: "note", note: "C2"}],
                ensembleMidi: cIonian2,
                ensemblePitchClasses: cIonianDegreePC,
            },
            {
                index: 1,
                notes: [38],
                color: "amber",
                displays: [{kind: "note", note: "D2"}],
                ensembleMidi: cIonian2,
                ensemblePitchClasses: cIonianDegreePC,
            },
        ],
        repeatFocusLabel: "C Major (Ionian)",
    });
});

test("Up mode walks scale degrees in order from lowest part octave upward", () => {
    const generated = generateScalePrompts(
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
    expect(generated).to.deep.equal({
        prompts: [
            {
                index: 0,
                notes: [36],
                color: "sky",
                displays: [{kind: "note", note: "C2"}],
                ensembleMidi: cIonian2,
                ensemblePitchClasses: cIonianDegreePC,
            },
            {
                index: 1,
                notes: [38],
                color: "purple",
                displays: [{kind: "note", note: "D2"}],
                ensembleMidi: cIonian2,
                ensemblePitchClasses: cIonianDegreePC,
            },
            {
                index: 2,
                notes: [40],
                color: "purple",
                displays: [{kind: "note", note: "E2"}],
                ensembleMidi: cIonian2,
                ensemblePitchClasses: cIonianDegreePC,
            },
        ],
        repeatFocusLabel: "C Major (Ionian)",
    });
});

test("Random mode visits each scale degree once per cycle before repeating", () => {
    const generated = generateScalePrompts(
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
    expect(generated).to.deep.equal({
        prompts: [
            {
                index: 0,
                notes: [60],
                color: "cyan",
                displays: [{kind: "note", note: "C4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
            },
            {
                index: 1,
                notes: [64],
                color: "orange",
                displays: [{kind: "note", note: "E4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
            },
            {
                index: 2,
                notes: [62],
                color: "purple",
                displays: [{kind: "note", note: "D4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
            },
            {
                index: 3,
                notes: [67],
                color: "red",
                displays: [{kind: "note", note: "G4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
            },
            {
                index: 4,
                notes: [71],
                color: "indigo",
                displays: [{kind: "note", note: "B4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
            },
            {
                index: 5,
                notes: [65],
                color: "blue",
                displays: [{kind: "note", note: "F4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
            },
            {
                index: 6,
                notes: [69],
                color: "yellow",
                displays: [{kind: "note", note: "A4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
            },
        ],
        repeatFocusLabel: "C Major (Ionian)",
    });
});

test("Random mode starts a fresh cycle after exhausting degrees (partial second cycle)", () => {
    const generated = generateScalePrompts(
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
    expect(generated).to.deep.equal({
        prompts: [
            {
                index: 0,
                notes: [69],
                color: "slate",
                displays: [{kind: "note", note: "A4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
            },
            {
                index: 1,
                notes: [71],
                color: "sky",
                displays: [{kind: "note", note: "B4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
            },
            {
                index: 2,
                notes: [62],
                color: "purple",
                displays: [{kind: "note", note: "D4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
            },
            {
                index: 3,
                notes: [67],
                color: "purple",
                displays: [{kind: "note", note: "G4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
            },
            {
                index: 4,
                notes: [64],
                color: "indigo",
                displays: [{kind: "note", note: "E4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
            },
            {
                index: 5,
                notes: [60],
                color: "purple",
                displays: [{kind: "note", note: "C4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
            },
            {
                index: 6,
                notes: [65],
                color: "orange",
                displays: [{kind: "note", note: "F4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
            },
            {
                index: 7,
                notes: [65],
                color: "purple",
                displays: [{kind: "note", note: "F4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
            },
            {
                index: 8,
                notes: [71],
                color: "red",
                displays: [{kind: "note", note: "B4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
            },
        ],
        repeatFocusLabel: "C Major (Ionian)",
    });
});

test("Down mode walks from highest part octave through scale degrees downward", () => {
    const generated = generateScalePrompts(
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
    expect(generated).to.deep.equal({
        prompts: [
            {
                index: 0,
                notes: [60],
                color: "sky",
                displays: [{kind: "note", note: "C4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
            },
            {
                index: 1,
                notes: [62],
                color: "purple",
                displays: [{kind: "note", note: "D4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
            },
            {
                index: 2,
                notes: [64],
                color: "purple",
                displays: [{kind: "note", note: "E4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
            },
        ],
        repeatFocusLabel: "C Major (Ionian)",
    });
});

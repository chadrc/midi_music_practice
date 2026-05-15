import {expect, test} from "vitest";
import {generateScalePrompts} from "../../src/routine";
import {PracticePoolMode, PracticeType, NoteRangeType} from "../../src/routine/types";
import {MAJOR_SCALE_SET_NAME} from "../../src/notes/scales";
import {NumberGenerator} from "../../src/common/NumberGenerator";
import {minimalBakedPart} from "./fixtures";

const cIonian2 = [36, 38, 40, 41, 43, 45, 47];
const cIonian4 = [60, 62, 64, 65, 67, 69, 71];
/** Descending pitch in nominal octave (Down mode). */
const cIonian4Desc = [71, 69, 67, 65, 64, 62, 60];
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
                staffFundamentalMapKey: "C",
            },
            {
                index: 1,
                notes: [38],
                color: "amber",
                displays: [{kind: "note", note: "D2"}],
                ensembleMidi: cIonian2,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
        ],
        repeatFocusLabel: "C Major (Ionian)",
    });
});

test("Up/Down modes start each part octave on the tonic, not the lowest MIDI in C–B octave order", () => {
    const bSortedAsc4 = [61, 63, 64, 66, 68, 70, 71];
    const bRotatedRootFirst = [...bSortedAsc4.slice(6), ...bSortedAsc4.slice(0, 6)];
    const up = generateScalePrompts(
        minimalBakedPart({
            promptCount: 1,
            practice: {
                type: PracticeType.Scales,
                baseNote: "B",
                scaleTypes: [MAJOR_SCALE_SET_NAME],
                mode: PracticePoolMode.Up,
                octaveRange: {start: 4, end: 4},
            },
        }),
        new NumberGenerator(0),
    );
    expect(up.prompts[0]!.notes).toEqual([71]);
    expect(up.prompts[0]!.ensembleMidi).toEqual(bRotatedRootFirst);

    const down = generateScalePrompts(
        minimalBakedPart({
            promptCount: 1,
            practice: {
                type: PracticeType.Scales,
                baseNote: "B",
                scaleTypes: [MAJOR_SCALE_SET_NAME],
                mode: PracticePoolMode.Down,
                octaveRange: {start: 4, end: 4},
            },
        }),
        new NumberGenerator(0),
    );
    expect(down.prompts[0]!.notes).toEqual([70]);
    expect(down.prompts[0]!.ensembleMidi).toEqual([...bRotatedRootFirst].reverse());
});

test("Up mode shifts a full octave-root-first segment into the playable MIDI range (e.g. guitar without C2)", () => {
    const shiftedCmaj = [48, 50, 52, 53, 55, 57, 59];
    const generated = generateScalePrompts(
        minimalBakedPart({
            promptCount: 3,
            noteRange: {type: NoteRangeType.Notes, range: {start: 45, end: 65}},
            practice: {
                type: PracticeType.Scales,
                baseNote: "C",
                scaleTypes: [MAJOR_SCALE_SET_NAME],
                mode: PracticePoolMode.Up,
                octaveRange: {start: 2, end: 2},
            },
        }),
        new NumberGenerator(1),
    );
    expect(generated.prompts[0]!.notes).toEqual([48]);
    expect(generated.prompts[0]!.ensembleMidi).toEqual(shiftedCmaj);
    expect(generated.prompts[1]!.notes).toEqual([50]);
    expect(generated.prompts[2]!.notes).toEqual([52]);
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
                staffFundamentalMapKey: "C",
            },
            {
                index: 1,
                notes: [38],
                color: "purple",
                displays: [{kind: "note", note: "D2"}],
                ensembleMidi: cIonian2,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 2,
                notes: [40],
                color: "purple",
                displays: [{kind: "note", note: "E2"}],
                ensembleMidi: cIonian2,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
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
                staffFundamentalMapKey: "C",
            },
            {
                index: 1,
                notes: [64],
                color: "orange",
                displays: [{kind: "note", note: "E4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 2,
                notes: [62],
                color: "purple",
                displays: [{kind: "note", note: "D4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 3,
                notes: [67],
                color: "red",
                displays: [{kind: "note", note: "G4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 4,
                notes: [71],
                color: "indigo",
                displays: [{kind: "note", note: "B4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 5,
                notes: [65],
                color: "blue",
                displays: [{kind: "note", note: "F4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 6,
                notes: [69],
                color: "yellow",
                displays: [{kind: "note", note: "A4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
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
                staffFundamentalMapKey: "C",
            },
            {
                index: 1,
                notes: [71],
                color: "sky",
                displays: [{kind: "note", note: "B4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 2,
                notes: [62],
                color: "purple",
                displays: [{kind: "note", note: "D4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 3,
                notes: [67],
                color: "purple",
                displays: [{kind: "note", note: "G4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 4,
                notes: [64],
                color: "indigo",
                displays: [{kind: "note", note: "E4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 5,
                notes: [60],
                color: "purple",
                displays: [{kind: "note", note: "C4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 6,
                notes: [65],
                color: "orange",
                displays: [{kind: "note", note: "F4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 7,
                notes: [65],
                color: "purple",
                displays: [{kind: "note", note: "F4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 8,
                notes: [71],
                color: "red",
                displays: [{kind: "note", note: "B4"}],
                ensembleMidi: cIonian4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
        ],
        repeatFocusLabel: "C Major (Ionian)",
    });
});

test("Down mode walks from highest part octave, degrees descending in pitch", () => {
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
                notes: [71],
                color: "sky",
                displays: [{kind: "note", note: "B4"}],
                ensembleMidi: cIonian4Desc,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 1,
                notes: [69],
                color: "purple",
                displays: [{kind: "note", note: "A4"}],
                ensembleMidi: cIonian4Desc,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 2,
                notes: [67],
                color: "purple",
                displays: [{kind: "note", note: "G4"}],
                ensembleMidi: cIonian4Desc,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
        ],
        repeatFocusLabel: "C Major (Ionian)",
    });
});

const cMajorUpDownRotAsc4 = [64, 65, 67, 69, 71, 60, 62];
const cMajorUpDownRotDesc4 = [67, 65, 64, 62, 60, 71, 69];

test("Up-Down mode alternates up then down traversal per repetition with separate offsets", () => {
    const baked = minimalBakedPart({
        promptCount: 7,
        practice: {
            type: PracticeType.Scales,
            baseNote: "C",
            scaleTypes: [MAJOR_SCALE_SET_NAME],
            mode: PracticePoolMode.UpDown,
            upDownOffsetUp: 2,
            upDownOffsetDown: 2,
            octaveRange: {start: 4, end: 4},
        },
    });
    const gen = new NumberGenerator(12347);
    expect(generateScalePrompts(baked, gen, 0)).to.deep.equal({
        prompts: [
            {
                index: 0,
                notes: [64],
                color: "fuchsia",
                displays: [{kind: "note", note: "E4"}],
                ensembleMidi: cMajorUpDownRotAsc4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 1,
                notes: [65],
                color: "amber",
                displays: [{kind: "note", note: "F4"}],
                ensembleMidi: cMajorUpDownRotAsc4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 2,
                notes: [67],
                color: "cyan",
                displays: [{kind: "note", note: "G4"}],
                ensembleMidi: cMajorUpDownRotAsc4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 3,
                notes: [69],
                color: "pink",
                displays: [{kind: "note", note: "A4"}],
                ensembleMidi: cMajorUpDownRotAsc4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 4,
                notes: [71],
                color: "slate",
                displays: [{kind: "note", note: "B4"}],
                ensembleMidi: cMajorUpDownRotAsc4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 5,
                notes: [60],
                color: "teal",
                displays: [{kind: "note", note: "C4"}],
                ensembleMidi: cMajorUpDownRotAsc4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 6,
                notes: [62],
                color: "amber",
                displays: [{kind: "note", note: "D4"}],
                ensembleMidi: cMajorUpDownRotAsc4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
        ],
        repeatFocusLabel: "C Major (Ionian) (up)",
    });
    gen.reset();
    expect(generateScalePrompts(baked, gen, 1)).to.deep.equal({
        prompts: [
            {
                index: 0,
                notes: [67],
                color: "fuchsia",
                displays: [{kind: "note", note: "G4"}],
                ensembleMidi: cMajorUpDownRotDesc4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 1,
                notes: [65],
                color: "amber",
                displays: [{kind: "note", note: "F4"}],
                ensembleMidi: cMajorUpDownRotDesc4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 2,
                notes: [64],
                color: "cyan",
                displays: [{kind: "note", note: "E4"}],
                ensembleMidi: cMajorUpDownRotDesc4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 3,
                notes: [62],
                color: "pink",
                displays: [{kind: "note", note: "D4"}],
                ensembleMidi: cMajorUpDownRotDesc4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 4,
                notes: [60],
                color: "slate",
                displays: [{kind: "note", note: "C4"}],
                ensembleMidi: cMajorUpDownRotDesc4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 5,
                notes: [71],
                color: "teal",
                displays: [{kind: "note", note: "B4"}],
                ensembleMidi: cMajorUpDownRotDesc4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 6,
                notes: [69],
                color: "amber",
                displays: [{kind: "note", note: "A4"}],
                ensembleMidi: cMajorUpDownRotDesc4,
                ensemblePitchClasses: cIonianDegreePC,
                staffFundamentalMapKey: "C",
            },
        ],
        repeatFocusLabel: "C Major (Ionian) (down)",
    });
});

test("freePlayInSet uses freePlaySet prompt type for scales", () => {
    const generated = generateScalePrompts(
        minimalBakedPart({
            freePlayInSet: true,
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
    expect(generated.prompts.length).toBeGreaterThan(0);
    for (const pr of generated.prompts) {
        expect(pr.type).toBe("freePlaySet");
        expect("displays" in pr).toBe(false);
        expect(pr.ensembleMidi.length).toBeGreaterThan(0);
    }
});

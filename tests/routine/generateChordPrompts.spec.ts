import {expect, test} from "vitest";
import {generateChordPrompts} from "../../src/routine";
import {PracticePoolMode, PracticeType} from "../../src/routine/types";
import {MAJOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME} from "../../src/notes/chords";
import {NumberGenerator} from "../../src/common/NumberGenerator";
import {minimalBakedPart} from "./fixtures";

const cMaj2 = [36, 40, 43];
const cMaj3 = [48, 52, 55];
const cMaj4 = [60, 64, 67];
const cMaj4Desc = [67, 64, 60];
const cMajorChordUpDownRotAsc4 = [67, 60, 64];
const cMajorChordUpDownRotDesc4 = [60, 67, 64];
const cMajDegreePC = [0, 4, 7];

test("emits chord prompts with one note each for fixed seed and practice", () => {
    const generated = generateChordPrompts(
        minimalBakedPart({
            promptCount: 3,
            practice: {
                type: PracticeType.Chords,
                baseNote: "C",
                chordTypes: [MAJOR_CHORDS_SET_NAME],
                mode: PracticePoolMode.Up,
            },
        }),
        new NumberGenerator(12345),
    );

    expect(generated).to.deep.equal({
        prompts: [
            {
                index: 0,
                notes: [36],
                color: "blue",
                displays: [{kind: "note", note: "C2"}],
                ensembleMidi: cMaj2,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 1,
                notes: [40],
                color: "slate",
                displays: [{kind: "note", note: "E2"}],
                ensembleMidi: cMaj2,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 2,
                notes: [43],
                color: "teal",
                displays: [{kind: "note", note: "G2"}],
                ensembleMidi: cMaj2,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
        ],
        repeatFocusLabel: "C Major",
    });
});

test("Up mode walks C E G per octave then next octave", () => {
    const generated = generateChordPrompts(
        minimalBakedPart({
            promptCount: 3,
            practice: {
                type: PracticeType.Chords,
                baseNote: "C",
                chordTypes: [MAJOR_CHORDS_SET_NAME],
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
                ensembleMidi: cMaj2,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 1,
                notes: [40],
                color: "purple",
                displays: [{kind: "note", note: "E2"}],
                ensembleMidi: cMaj2,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 2,
                notes: [43],
                color: "purple",
                displays: [{kind: "note", note: "G2"}],
                ensembleMidi: cMaj2,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
        ],
        repeatFocusLabel: "C Major",
    });
});

test("Down mode walks from highest octave, chord tones descending in pitch", () => {
    const generated = generateChordPrompts(
        minimalBakedPart({
            promptCount: 3,
            practice: {
                type: PracticeType.Chords,
                baseNote: "C",
                chordTypes: [MAJOR_CHORDS_SET_NAME],
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
                notes: [67],
                color: "sky",
                displays: [{kind: "note", note: "G4"}],
                ensembleMidi: cMaj4Desc,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 1,
                notes: [64],
                color: "purple",
                displays: [{kind: "note", note: "E4"}],
                ensembleMidi: cMaj4Desc,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 2,
                notes: [60],
                color: "purple",
                displays: [{kind: "note", note: "C4"}],
                ensembleMidi: cMaj4Desc,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
        ],
        repeatFocusLabel: "C Major",
    });
});

test("Up mode applies upDownOffsetUp to ascending voicing order", () => {
    expect(
        generateChordPrompts(
            minimalBakedPart({
                promptCount: 3,
                practice: {
                    type: PracticeType.Chords,
                    baseNote: "C",
                    chordTypes: [MAJOR_CHORDS_SET_NAME],
                    mode: PracticePoolMode.Up,
                    upDownOffsetUp: 2,
                    octaveRange: {start: 4, end: 4},
                },
            }),
            new NumberGenerator(12347),
        ),
    ).to.deep.equal({
        prompts: [
            {
                index: 0,
                notes: [67],
                color: "fuchsia",
                displays: [{kind: "note", note: "G4"}],
                ensembleMidi: cMajorChordUpDownRotAsc4,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 1,
                notes: [60],
                color: "amber",
                displays: [{kind: "note", note: "C4"}],
                ensembleMidi: cMajorChordUpDownRotAsc4,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 2,
                notes: [64],
                color: "cyan",
                displays: [{kind: "note", note: "E4"}],
                ensembleMidi: cMajorChordUpDownRotAsc4,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
        ],
        repeatFocusLabel: "C Major",
    });
});

test("Down mode applies upDownOffsetDown to descending voicing order", () => {
    expect(
        generateChordPrompts(
            minimalBakedPart({
                promptCount: 3,
                practice: {
                    type: PracticeType.Chords,
                    baseNote: "C",
                    chordTypes: [MAJOR_CHORDS_SET_NAME],
                    mode: PracticePoolMode.Down,
                    upDownOffsetDown: 2,
                    octaveRange: {start: 4, end: 4},
                },
            }),
            new NumberGenerator(12347),
        ),
    ).to.deep.equal({
        prompts: [
            {
                index: 0,
                notes: [60],
                color: "fuchsia",
                displays: [{kind: "note", note: "C4"}],
                ensembleMidi: cMajorChordUpDownRotDesc4,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 1,
                notes: [67],
                color: "amber",
                displays: [{kind: "note", note: "G4"}],
                ensembleMidi: cMajorChordUpDownRotDesc4,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 2,
                notes: [64],
                color: "cyan",
                displays: [{kind: "note", note: "E4"}],
                ensembleMidi: cMajorChordUpDownRotDesc4,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
        ],
        repeatFocusLabel: "C Major",
    });
});

test("Up mode covers full C major arpeggio across three part octaves for nine prompts", () => {
    const generated = generateChordPrompts(
        minimalBakedPart({
            promptCount: 9,
            practice: {
                type: PracticeType.Chords,
                baseNote: "C",
                chordTypes: [MAJOR_CHORDS_SET_NAME],
                mode: PracticePoolMode.Up,
                octaveRange: {start: 2, end: 4},
            },
        }),
        new NumberGenerator(0),
    );
    expect(generated).to.deep.equal({
        prompts: [
            {
                index: 0,
                notes: [36],
                color: "sky",
                displays: [{kind: "note", note: "C2"}],
                ensembleMidi: cMaj2,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 1,
                notes: [40],
                color: "purple",
                displays: [{kind: "note", note: "E2"}],
                ensembleMidi: cMaj2,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 2,
                notes: [43],
                color: "purple",
                displays: [{kind: "note", note: "G2"}],
                ensembleMidi: cMaj2,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 3,
                notes: [48],
                color: "sky",
                displays: [{kind: "note", note: "C3"}],
                ensembleMidi: cMaj3,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 4,
                notes: [52],
                color: "purple",
                displays: [{kind: "note", note: "E3"}],
                ensembleMidi: cMaj3,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 5,
                notes: [55],
                color: "purple",
                displays: [{kind: "note", note: "G3"}],
                ensembleMidi: cMaj3,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 6,
                notes: [60],
                color: "indigo",
                displays: [{kind: "note", note: "C4"}],
                ensembleMidi: cMaj4,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 7,
                notes: [64],
                color: "pink",
                displays: [{kind: "note", note: "E4"}],
                ensembleMidi: cMaj4,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 8,
                notes: [67],
                color: "cyan",
                displays: [{kind: "note", note: "G4"}],
                ensembleMidi: cMaj4,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
        ],
        repeatFocusLabel: "C Major",
    });
});

test("Up-Down mode alternates up then down traversal per repetition with separate offsets", () => {
    const baked = minimalBakedPart({
        promptCount: 7,
        practice: {
            type: PracticeType.Chords,
            baseNote: "C",
            chordTypes: [MAJOR_CHORDS_SET_NAME],
            mode: PracticePoolMode.UpDown,
            upDownOffsetUp: 2,
            upDownOffsetDown: 2,
            octaveRange: {start: 4, end: 4},
        },
    });
    const gen = new NumberGenerator(12347);
    expect(generateChordPrompts(baked, gen, 0)).to.deep.equal({
        prompts: [
            {
                index: 0,
                notes: [67],
                color: "fuchsia",
                displays: [{kind: "note", note: "G4"}],
                ensembleMidi: cMajorChordUpDownRotAsc4,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 1,
                notes: [60],
                color: "amber",
                displays: [{kind: "note", note: "C4"}],
                ensembleMidi: cMajorChordUpDownRotAsc4,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 2,
                notes: [64],
                color: "cyan",
                displays: [{kind: "note", note: "E4"}],
                ensembleMidi: cMajorChordUpDownRotAsc4,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 3,
                notes: [67],
                color: "pink",
                displays: [{kind: "note", note: "G4"}],
                ensembleMidi: cMajorChordUpDownRotAsc4,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 4,
                notes: [60],
                color: "slate",
                displays: [{kind: "note", note: "C4"}],
                ensembleMidi: cMajorChordUpDownRotAsc4,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 5,
                notes: [64],
                color: "teal",
                displays: [{kind: "note", note: "E4"}],
                ensembleMidi: cMajorChordUpDownRotAsc4,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 6,
                notes: [67],
                color: "amber",
                displays: [{kind: "note", note: "G4"}],
                ensembleMidi: cMajorChordUpDownRotAsc4,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
        ],
        repeatFocusLabel: "C Major (up)",
    });
    gen.reset();
    expect(generateChordPrompts(baked, gen, 1)).to.deep.equal({
        prompts: [
            {
                index: 0,
                notes: [60],
                color: "fuchsia",
                displays: [{kind: "note", note: "C4"}],
                ensembleMidi: cMajorChordUpDownRotDesc4,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 1,
                notes: [67],
                color: "amber",
                displays: [{kind: "note", note: "G4"}],
                ensembleMidi: cMajorChordUpDownRotDesc4,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 2,
                notes: [64],
                color: "cyan",
                displays: [{kind: "note", note: "E4"}],
                ensembleMidi: cMajorChordUpDownRotDesc4,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 3,
                notes: [60],
                color: "pink",
                displays: [{kind: "note", note: "C4"}],
                ensembleMidi: cMajorChordUpDownRotDesc4,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 4,
                notes: [67],
                color: "slate",
                displays: [{kind: "note", note: "G4"}],
                ensembleMidi: cMajorChordUpDownRotDesc4,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 5,
                notes: [64],
                color: "teal",
                displays: [{kind: "note", note: "E4"}],
                ensembleMidi: cMajorChordUpDownRotDesc4,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 6,
                notes: [60],
                color: "amber",
                displays: [{kind: "note", note: "C4"}],
                ensembleMidi: cMajorChordUpDownRotDesc4,
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
        ],
        repeatFocusLabel: "C Major (down)",
    });
});

test("Random mode arpeggiates each chord tone once before repeating", () => {
    const generated = generateChordPrompts(
        minimalBakedPart({
            promptCount: 6,
            practice: {
                type: PracticeType.Chords,
                baseNote: "C",
                chordTypes: [MAJOR_CHORDS_SET_NAME],
                mode: PracticePoolMode.Random,
                octaveRange: {start: 2, end: 4},
            },
        }),
        new NumberGenerator(999),
    );
    expect(generated).to.deep.equal({
        prompts: [
            {
                index: 0,
                notes: [67],
                color: "yellow",
                displays: [{kind: "note", note: "G4"}],
                ensembleMidi: [67, 60, 64],
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 1,
                notes: [60],
                color: "indigo",
                displays: [{kind: "note", note: "C4"}],
                ensembleMidi: [67, 60, 64],
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 2,
                notes: [64],
                color: "purple",
                displays: [{kind: "note", note: "E4"}],
                ensembleMidi: [67, 60, 64],
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 3,
                notes: [64],
                color: "yellow",
                displays: [{kind: "note", note: "E4"}],
                ensembleMidi: [64, 60, 67],
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 4,
                notes: [60],
                color: "indigo",
                displays: [{kind: "note", note: "C4"}],
                ensembleMidi: [64, 60, 67],
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
            {
                index: 5,
                notes: [67],
                color: "violet",
                displays: [{kind: "note", note: "G4"}],
                ensembleMidi: [64, 60, 67],
                ensemblePitchClasses: cMajDegreePC,
                staffFundamentalMapKey: "C",
            },
        ],
        repeatFocusLabel: "C Major",
    });
});

test("freePlayInSet uses freePlaySet prompt type", () => {
    const generated = generateChordPrompts(
        minimalBakedPart({
            freePlayInSet: true,
            promptCount: 3,
            practice: {
                type: PracticeType.Chords,
                baseNote: "C",
                chordTypes: [MAJOR_CHORDS_SET_NAME],
                mode: PracticePoolMode.Up,
            },
        }),
        new NumberGenerator(12345),
    );
    expect(generated.prompts).toHaveLength(3);
    for (const pr of generated.prompts) {
        expect(pr.type).toBe("freePlaySet");
        expect("displays" in pr).toBe(false);
        expect(pr.ensembleMidi.length).toBeGreaterThan(0);
    }
});

test("Random mode with multiple chord qualities includes a single-type repeatFocusLabel on each prompt", () => {
    const generated = generateChordPrompts(
        minimalBakedPart({
            promptCount: 6,
            practice: {
                type: PracticeType.Chords,
                baseNote: "C",
                chordTypes: [MAJOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME],
                mode: PracticePoolMode.Random,
                octaveRange: {start: 4, end: 4},
            },
        }),
        new NumberGenerator(42),
    );
    expect(generated.prompts.length).toBe(6);
    for (const p of generated.prompts) {
        expect(p.repeatFocusLabel === "C Major" || p.repeatFocusLabel === "C Minor").toBe(true);
    }
});

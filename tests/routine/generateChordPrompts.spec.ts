import {expect, test} from "vitest";
import {generateChordPrompts} from "../../src/routine";
import {PracticePoolMode, PracticeType} from "../../src/routine/types";
import {MAJOR_CHORDS_SET_NAME} from "../../src/notes/chords";
import {NumberGenerator} from "../../src/common/NumberGenerator";
import {minimalBakedPart} from "./fixtures";

test("emits chord prompts with one note each for fixed seed and practice", () => {
    const prompts = generateChordPrompts(
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

    const byIndex = [...prompts].sort((a, b) => a.index - b.index);
    expect(byIndex).to.deep.equal([
        {
            index: 0,
            notes: [36],
            color: "blue",
            displays: [{kind: "note", note: "C2"}],
        },
        {
            index: 1,
            notes: [40],
            color: "slate",
            displays: [{kind: "note", note: "E2"}],
        },
        {
            index: 2,
            notes: [43],
            color: "teal",
            displays: [{kind: "note", note: "G2"}],
        },
    ]);
});

test("Up mode walks C E G per octave then next octave", () => {
    const prompts = generateChordPrompts(
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
            notes: [40],
            color: "purple",
            displays: [{kind: "note", note: "E2"}],
        },
        {
            index: 2,
            notes: [43],
            color: "purple",
            displays: [{kind: "note", note: "G2"}],
        },
    ]);
});

test("Down mode walks from highest octave C E G downward", () => {
    const prompts = generateChordPrompts(
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
            notes: [64],
            color: "purple",
            displays: [{kind: "note", note: "E4"}],
        },
        {
            index: 2,
            notes: [67],
            color: "purple",
            displays: [{kind: "note", note: "G4"}],
        },
    ]);
});

test("Up mode covers full C major arpeggio across three part octaves for nine prompts", () => {
    const prompts = generateChordPrompts(
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
    expect(prompts).to.deep.equal([
        {
            index: 0,
            notes: [36],
            color: "sky",
            displays: [{kind: "note", note: "C2"}],
        },
        {
            index: 1,
            notes: [40],
            color: "purple",
            displays: [{kind: "note", note: "E2"}],
        },
        {
            index: 2,
            notes: [43],
            color: "purple",
            displays: [{kind: "note", note: "G2"}],
        },
        {
            index: 3,
            notes: [48],
            color: "sky",
            displays: [{kind: "note", note: "C3"}],
        },
        {
            index: 4,
            notes: [52],
            color: "purple",
            displays: [{kind: "note", note: "E3"}],
        },
        {
            index: 5,
            notes: [55],
            color: "purple",
            displays: [{kind: "note", note: "G3"}],
        },
        {
            index: 6,
            notes: [60],
            color: "indigo",
            displays: [{kind: "note", note: "C4"}],
        },
        {
            index: 7,
            notes: [64],
            color: "pink",
            displays: [{kind: "note", note: "E4"}],
        },
        {
            index: 8,
            notes: [67],
            color: "cyan",
            displays: [{kind: "note", note: "G4"}],
        },
    ]);
});

test("Random mode arpeggiates each chord tone once before repeating", () => {
    const prompts = generateChordPrompts(
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
    expect(prompts).to.deep.equal([
        {
            index: 0,
            notes: [60],
            color: "yellow",
            displays: [{kind: "note", note: "C4"}],
        },
        {
            index: 1,
            notes: [64],
            color: "red",
            displays: [{kind: "note", note: "E4"}],
        },
        {
            index: 2,
            notes: [67],
            color: "yellow",
            displays: [{kind: "note", note: "G4"}],
        },
        {
            index: 3,
            notes: [60],
            color: "indigo",
            displays: [{kind: "note", note: "C4"}],
        },
        {
            index: 4,
            notes: [64],
            color: "purple",
            displays: [{kind: "note", note: "E4"}],
        },
        {
            index: 5,
            notes: [67],
            color: "amber",
            displays: [{kind: "note", note: "G4"}],
        },
    ]);
});

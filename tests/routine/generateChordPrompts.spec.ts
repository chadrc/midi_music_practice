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
            },
            {
                index: 1,
                notes: [40],
                color: "slate",
                displays: [{kind: "note", note: "E2"}],
                ensembleMidi: cMaj2,
                ensemblePitchClasses: cMajDegreePC,
            },
            {
                index: 2,
                notes: [43],
                color: "teal",
                displays: [{kind: "note", note: "G2"}],
                ensembleMidi: cMaj2,
                ensemblePitchClasses: cMajDegreePC,
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
            },
            {
                index: 1,
                notes: [40],
                color: "purple",
                displays: [{kind: "note", note: "E2"}],
                ensembleMidi: cMaj2,
                ensemblePitchClasses: cMajDegreePC,
            },
            {
                index: 2,
                notes: [43],
                color: "purple",
                displays: [{kind: "note", note: "G2"}],
                ensembleMidi: cMaj2,
                ensemblePitchClasses: cMajDegreePC,
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
            },
            {
                index: 1,
                notes: [64],
                color: "purple",
                displays: [{kind: "note", note: "E4"}],
                ensembleMidi: cMaj4Desc,
                ensemblePitchClasses: cMajDegreePC,
            },
            {
                index: 2,
                notes: [60],
                color: "purple",
                displays: [{kind: "note", note: "C4"}],
                ensembleMidi: cMaj4Desc,
                ensemblePitchClasses: cMajDegreePC,
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
            },
            {
                index: 1,
                notes: [40],
                color: "purple",
                displays: [{kind: "note", note: "E2"}],
                ensembleMidi: cMaj2,
                ensemblePitchClasses: cMajDegreePC,
            },
            {
                index: 2,
                notes: [43],
                color: "purple",
                displays: [{kind: "note", note: "G2"}],
                ensembleMidi: cMaj2,
                ensemblePitchClasses: cMajDegreePC,
            },
            {
                index: 3,
                notes: [48],
                color: "sky",
                displays: [{kind: "note", note: "C3"}],
                ensembleMidi: cMaj3,
                ensemblePitchClasses: cMajDegreePC,
            },
            {
                index: 4,
                notes: [52],
                color: "purple",
                displays: [{kind: "note", note: "E3"}],
                ensembleMidi: cMaj3,
                ensemblePitchClasses: cMajDegreePC,
            },
            {
                index: 5,
                notes: [55],
                color: "purple",
                displays: [{kind: "note", note: "G3"}],
                ensembleMidi: cMaj3,
                ensemblePitchClasses: cMajDegreePC,
            },
            {
                index: 6,
                notes: [60],
                color: "indigo",
                displays: [{kind: "note", note: "C4"}],
                ensembleMidi: cMaj4,
                ensemblePitchClasses: cMajDegreePC,
            },
            {
                index: 7,
                notes: [64],
                color: "pink",
                displays: [{kind: "note", note: "E4"}],
                ensembleMidi: cMaj4,
                ensemblePitchClasses: cMajDegreePC,
            },
            {
                index: 8,
                notes: [67],
                color: "cyan",
                displays: [{kind: "note", note: "G4"}],
                ensembleMidi: cMaj4,
                ensemblePitchClasses: cMajDegreePC,
            },
        ],
        repeatFocusLabel: "C Major",
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
            },
            {
                index: 1,
                notes: [60],
                color: "indigo",
                displays: [{kind: "note", note: "C4"}],
                ensembleMidi: [67, 60, 64],
                ensemblePitchClasses: cMajDegreePC,
            },
            {
                index: 2,
                notes: [64],
                color: "purple",
                displays: [{kind: "note", note: "E4"}],
                ensembleMidi: [67, 60, 64],
                ensemblePitchClasses: cMajDegreePC,
            },
            {
                index: 3,
                notes: [64],
                color: "yellow",
                displays: [{kind: "note", note: "E4"}],
                ensembleMidi: [64, 60, 67],
                ensemblePitchClasses: cMajDegreePC,
            },
            {
                index: 4,
                notes: [60],
                color: "indigo",
                displays: [{kind: "note", note: "C4"}],
                ensembleMidi: [64, 60, 67],
                ensemblePitchClasses: cMajDegreePC,
            },
            {
                index: 5,
                notes: [67],
                color: "violet",
                displays: [{kind: "note", note: "G4"}],
                ensembleMidi: [64, 60, 67],
                ensemblePitchClasses: cMajDegreePC,
            },
        ],
        repeatFocusLabel: "C Major",
    });
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

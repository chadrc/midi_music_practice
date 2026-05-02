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
            notes: [48],
            color: "teal",
            displays: [{kind: "note", note: "C3"}],
        },
        {
            index: 1,
            notes: [52],
            color: "green",
            displays: [{kind: "note", note: "E3"}],
        },
        {
            index: 2,
            notes: [48],
            color: "amber",
            displays: [{kind: "note", note: "C3"}],
        },
    ]);
});

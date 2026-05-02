import {expect, test} from "vitest";
import {generateNotePrompts} from "../../src/routine";
import {PracticePoolMode, PracticeType} from "../../src/routine/types";
import {NumberGenerator} from "../../src/common/NumberGenerator";
import {minimalBakedPart} from "./fixtures";

test("returns single-note prompts for fixed seed (full objects)", () => {
    const settings = minimalBakedPart({promptCount: 5, seed: 100});
    const generated = generateNotePrompts(settings, new NumberGenerator(12346));
    expect(generated).to.deep.equal({
        prompts: [
            {
                index: 1,
                notes: [65],
                color: "pink",
                displays: [{kind: "note", note: "F4"}],
            },
            {
                index: 0,
                notes: [61],
                color: "blue",
                displays: [{kind: "note", note: "C#4"}],
            },
            {
                index: 4,
                notes: [105],
                color: "blue",
                displays: [{kind: "note", note: "A7"}],
            },
            {
                index: 3,
                notes: [125],
                color: "yellow",
                displays: [{kind: "note", note: "F9"}],
            },
            {
                index: 2,
                notes: [5],
                color: "blue",
                displays: [{kind: "note", note: "F-1"}],
            },
        ],
    });
});

test("non-notes practice yields empty array", () => {
    const generated = generateNotePrompts(
        minimalBakedPart({
            practice: {
                type: PracticeType.Chords,
                chordTypes: [],
                mode: PracticePoolMode.Random,
            },
        }),
        new NumberGenerator(0.1),
    );
    expect(generated).to.deep.equal({prompts: []});
});

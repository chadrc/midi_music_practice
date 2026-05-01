import {expect, test} from "vitest";
import {generateNotePrompts} from "../../src/routine";
import {PracticePoolMode, PracticeType} from "../../src/routine/types";
import {NumberGenerator} from "../../src/common/NumberGenerator";
import {minimalBakedPart} from "./fixtures";

test("returns single-note prompts for fixed seed (full objects)", () => {
    const settings = minimalBakedPart({promptCount: 5, seed: 100});
    const prompts = generateNotePrompts(settings, new NumberGenerator(12346));
    expect(prompts).to.deep.equal([
        {
            index: 1,
            notes: [62],
            color: "lime",
            displays: [{kind: "note", note: "D4"}],
        },
        {
            index: 2,
            notes: [5],
            color: "teal",
            displays: [{kind: "note", note: "F-1"}],
        },
        {
            index: 4,
            notes: [22],
            color: "teal",
            displays: [{kind: "note", note: "A#0"}],
        },
        {
            index: 0,
            notes: [61],
            color: "teal",
            displays: [{kind: "note", note: "C#4"}],
        },
        {
            index: 3,
            notes: [2],
            color: "yellow",
            displays: [{kind: "note", note: "D-1"}],
        },
    ]);
});

test("non-notes practice yields empty array", () => {
    const prompts = generateNotePrompts(
        minimalBakedPart({
            practice: {
                type: PracticeType.Chords,
                chordTypes: [],
                mode: PracticePoolMode.Random,
            },
        }),
        new NumberGenerator(0.1),
    );
    expect(prompts).to.deep.equal([]);
});

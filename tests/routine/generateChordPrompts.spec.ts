import {expect, test} from "vitest";
import {generateChordPrompts} from "../../src/routine";
import {PracticePoolMode, PracticeType} from "../../src/routine/types";
import {MAJOR_CHORDS_SET_NAME} from "../../src/notes/chords";
import {NumberGenerator} from "../../src/common/NumberGenerator";
import {minimalBakedPart} from "./fixtures";

test("emits chord prompts matching full structure for fixed seed and practice", () => {
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

    expect(prompts).to.deep.equal([
        {
            index: 0,
            notes: [48, 52, 55],
            color: "emerald",
            displays: [
                {
                    kind: "chord",
                    title: "C Major",
                    cells: ["C3", "E3", "G3"],
                },
            ],
        },
        {
            index: 1,
            notes: [48, 52, 55],
            color: "yellow",
            displays: [
                {
                    kind: "chord",
                    title: "C Major",
                    cells: ["C3", "E3", "G3"],
                },
            ],
        },
        {
            index: 2,
            notes: [0, 4, 7],
            color: "red",
            displays: [
                {
                    kind: "chord",
                    title: "C Major",
                    cells: ["C-1", "E-1", "G-1"],
                },
            ],
        },
    ]);
});

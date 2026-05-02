import {expect, test} from "vitest";
import {generatePrompts} from "../../src/routine";
import {PracticePoolMode, PracticeType} from "../../src/routine/types";
import {MAJOR_CHORDS_SET_NAME} from "../../src/notes/chords";
import {MAJOR_SCALE_SET_NAME} from "../../src/notes/scales";
import {NumberGenerator} from "../../src/common/NumberGenerator";
import {minimalBakedPart} from "./fixtures";

test("dispatches by practice type with full prompt payloads", () => {
    expect(generatePrompts(minimalBakedPart({promptCount: 2, seed: 200}), new NumberGenerator(22334))).to.deep.equal([
        {
            index: 0,
            notes: [63],
            color: "green",
            displays: [{kind: "note", note: "D#4"}],
        },
        {
            index: 1,
            notes: [20],
            color: "emerald",
            displays: [{kind: "note", note: "G#0"}],
        },
    ]);

    expect(
        generatePrompts(
            minimalBakedPart({
                promptCount: 1,
                seed: 201,
                practice: {
                    type: PracticeType.Chords,
                    baseNote: "C",
                    chordTypes: [MAJOR_CHORDS_SET_NAME],
                    mode: PracticePoolMode.Up,
                },
            }),
            new NumberGenerator(22335),
        ),
    ).to.deep.equal([
        {
            index: 0,
            notes: [36],
            color: "orange",
            displays: [{kind: "note", note: "C2"}],
        },
    ]);

    expect(
        generatePrompts(
            minimalBakedPart({
                promptCount: 1,
                seed: 202,
                practice: {
                    type: PracticeType.Scales,
                    baseNote: "C",
                    scaleTypes: [MAJOR_SCALE_SET_NAME],
                    mode: PracticePoolMode.Up,
                },
            }),
            new NumberGenerator(22336),
        ),
    ).to.deep.equal([
        {
            index: 0,
            notes: [36],
            color: "emerald",
            displays: [{kind: "note", note: "C2"}],
        },
    ]);
});

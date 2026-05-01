import {expect, test} from "vitest";
import {generateScalePrompts} from "../../src/routine";
import {PracticePoolMode, PracticeType} from "../../src/routine/types";
import {MAJOR_SCALE_SET_NAME} from "../../src/notes/scales";
import {NumberGenerator} from "../../src/common/NumberGenerator";
import {minimalBakedPart} from "./fixtures";
import {
    C_MAJOR_SCALE_CELLS_OCTAVE,
    C_MAJOR_SCALE_NOTES,
} from "./local/cMajorScaleFullRangeSnapshot";

function cMajorScaleDisplayBlock() {
    return {
        kind: "scale" as const,
        title: "C Major (Ionian)",
        cells: [...C_MAJOR_SCALE_CELLS_OCTAVE],
    };
}

test("emits full scale prompts for fixed seed", () => {
    const prompts = generateScalePrompts(
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
    expect(prompts).to.deep.equal([
        {
            index: 0,
            notes: [...C_MAJOR_SCALE_NOTES],
            color: "red",
            displays: [cMajorScaleDisplayBlock()],
        },
        {
            index: 1,
            notes: [...C_MAJOR_SCALE_NOTES],
            color: "amber",
            displays: [cMajorScaleDisplayBlock()],
        },
    ]);
});

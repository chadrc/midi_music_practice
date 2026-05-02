import {expect, test} from "vitest";
import {generateScalePrompts} from "../../src/routine";
import {PracticePoolMode, PracticeType} from "../../src/routine/types";
import {MAJOR_SCALE_SET_NAME} from "../../src/notes/scales";
import {NumberGenerator} from "../../src/common/NumberGenerator";
import {minimalBakedPart} from "./fixtures";

test("emits scale prompts with one note each for fixed seed", () => {
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
    const byIndex = [...prompts].sort((a, b) => a.index - b.index);
    expect(byIndex).to.deep.equal([
        {
            index: 0,
            notes: [40],
            color: "cyan",
            displays: [{kind: "note", note: "E2"}],
        },
        {
            index: 1,
            notes: [36],
            color: "emerald",
            displays: [{kind: "note", note: "C2"}],
        },
    ]);
});

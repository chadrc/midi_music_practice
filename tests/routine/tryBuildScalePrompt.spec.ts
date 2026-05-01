import {expect, test} from "vitest";
import {tryBuildScalePrompt} from "../../src/routine";
import {MAJOR_SCALE_SET_NAME} from "../../src/notes/scales";
import {NumberGenerator} from "../../src/common/NumberGenerator";
import {minimalBakedPart} from "./fixtures";
import {
    C_MAJOR_SCALE_CELLS_OCTAVE,
    C_MAJOR_SCALE_NOTES,
} from "./local/cMajorScaleFullRangeSnapshot";

test("builds full scale prompt for fixed seed", () => {
    const p = tryBuildScalePrompt(
        MAJOR_SCALE_SET_NAME,
        "C",
        minimalBakedPart({seed: 1}),
        new NumberGenerator(12349),
        0,
    );
    expect(p).to.deep.equal({
        index: 0,
        notes: [...C_MAJOR_SCALE_NOTES],
        color: "yellow",
        displays: [
            {
                kind: "scale",
                title: "C Major (Ionian)",
                cells: [...C_MAJOR_SCALE_CELLS_OCTAVE],
            },
        ],
    });
});

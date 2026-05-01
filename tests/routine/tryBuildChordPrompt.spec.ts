import {expect, test} from "vitest";
import {tryBuildChordPrompt} from "../../src/routine";
import {MAJOR_CHORDS_SET_NAME} from "../../src/notes/chords";
import {NumberGenerator} from "../../src/common/NumberGenerator";
import {minimalBakedPart} from "./fixtures";

test("builds full chord prompt for fixed seed", () => {
    const p = tryBuildChordPrompt(
        MAJOR_CHORDS_SET_NAME,
        "C",
        minimalBakedPart({seed: 1}),
        new NumberGenerator(12348),
        0,
    );
    expect(p).to.deep.equal({
        index: 0,
        notes: [12, 16, 19],
        color: "cyan",
        displays: [
            {
                kind: "chord",
                title: "C Major",
                cells: ["C0", "E0", "G0"],
            },
        ],
    });
});

test("returns null for invalid map key", () => {
    expect(
        tryBuildChordPrompt(
            MAJOR_CHORDS_SET_NAME,
            "NotAKey",
            minimalBakedPart(),
            new NumberGenerator(0.6),
            0,
        ),
    ).to.deep.equal(null);
});

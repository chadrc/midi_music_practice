import {expect, test} from "vitest";
import {resolveFundamentalMapKey} from "../../src/routine";
import {CHORDS, MAJOR_CHORDS_SET_NAME} from "../../src/notes/chords";
import {PracticePoolMode, PracticeType} from "../../src/routine/types";
import {NumberGenerator} from "../../src/common/NumberGenerator";

test("uses practice baseNote when set", () => {
    expect(
        resolveFundamentalMapKey(
            {
                type: PracticeType.Chords,
                baseNote: "G",
                chordTypes: [],
                mode: PracticePoolMode.Random,
            },
            new NumberGenerator(0.1),
        ),
    ).to.equal("G");
});

test("rolls a registry key when baseNote is missing", () => {
    expect(
        resolveFundamentalMapKey(
            {
                type: PracticeType.Scales,
                scaleTypes: [],
                mode: PracticePoolMode.Random,
            },
            new NumberGenerator(0.3),
        ),
    ).to.equal("DSharp");
});

test("rolled key exists in major chord registry", () => {
    const key = resolveFundamentalMapKey(
        {
            type: PracticeType.Scales,
            scaleTypes: [],
            mode: PracticePoolMode.Random,
        },
        new NumberGenerator(0.3),
    );
    expect(key in CHORDS[MAJOR_CHORDS_SET_NAME]).to.equal(true);
});

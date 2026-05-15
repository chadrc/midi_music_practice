import {expect, test} from "vitest";
import {totalExpectedMidiNotesForPart} from "../../src/store/practice";
import type {RoutinePart} from "../../src/routine/types";

test("sums prompt.note lengths across all repetitions in a part", () => {
    const part = {
        repetitions: [
            {
                prompts: [
                    {notes: [60, 64]},
                    {notes: [72]},
                ],
                repeatFocusLabel: undefined as string | undefined,
            },
            {
                prompts: [{notes: [48]}],
                repeatFocusLabel: undefined as string | undefined,
            },
        ],
    };
    expect(totalExpectedMidiNotesForPart(part as unknown as RoutinePart)).to.deep.equal(4);
});

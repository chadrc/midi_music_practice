import {expect, test} from "vitest";
import {formatDisplayNote} from "../../src/routine";

test("includes octave when requireOctave is true", () => {
    expect(formatDisplayNote(true, 60)).to.equal("C4");
});

test("omits octave when requireOctave is false", () => {
    expect(formatDisplayNote(false, 60)).to.equal("C");
});

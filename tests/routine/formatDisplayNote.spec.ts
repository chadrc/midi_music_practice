import {expect, test} from "vitest";
import {formatDisplayNote} from "../../src/routine";
import {MAJOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME} from "../../src/notes/chords";

test("includes octave when requireOctave is true", () => {
    expect(formatDisplayNote(true, 60)).to.equal("C4");
});

test("omits octave when requireOctave is false", () => {
    expect(formatDisplayNote(false, 60)).to.equal("C");
});

test("uses flat spelling for minor-family chord prompts", () => {
    expect(formatDisplayNote(true, 63, MINOR_CHORDS_SET_NAME)).to.equal("Eb4");
});

test("uses sharp spelling for major chord prompts", () => {
    expect(formatDisplayNote(true, 63, MAJOR_CHORDS_SET_NAME)).to.equal("D#4");
});

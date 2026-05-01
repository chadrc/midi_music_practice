import {expect, test} from "vitest";
import {maxForNoteRangeType, NOTE_RANGE_MAX_FRETS, NOTE_RANGE_MAX_MIDI, NOTE_RANGE_MAX_OCTAVES} from "../../src/routine";
import {NoteRangeType} from "../../src/routine/types";

test("Notes ceiling is max MIDI index", () => {
    expect(maxForNoteRangeType(NoteRangeType.Notes)).to.equal(NOTE_RANGE_MAX_MIDI);
});

test("Frets ceiling is max fret index", () => {
    expect(maxForNoteRangeType(NoteRangeType.Frets)).to.equal(NOTE_RANGE_MAX_FRETS);
});

test("Octaves ceiling is max octave index", () => {
    expect(maxForNoteRangeType(NoteRangeType.Octaves)).to.equal(NOTE_RANGE_MAX_OCTAVES);
});

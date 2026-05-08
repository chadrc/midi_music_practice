import {expect, test} from "vitest";
import {
    defaultReferenceGridSlot,
    hintMidisForReferenceSlot,
} from "../../src/routine/referenceGrid";
import {BaseNotes, MAJOR_SCALE_SET_NAME} from "../../src/notes/scales";
import {MAJOR_CHORDS_SET_NAME} from "../../src/notes/chords";

test("scale hints C major in one scientific octave", () => {
    const range = [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71];
    const slot = {
        ...defaultReferenceGridSlot(),
        kind: "scale" as const,
        scaleType: MAJOR_SCALE_SET_NAME,
        baseNoteMapKey: BaseNotes.C.mapKey,
    };
    expect(hintMidisForReferenceSlot(range, slot)).to.deep.equal([60, 62, 64, 65, 67, 69, 71]);
});

test("chord hints C major triad in range", () => {
    const range = [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71];
    const slot = {
        ...defaultReferenceGridSlot(),
        kind: "chord" as const,
        chordType: MAJOR_CHORDS_SET_NAME,
        baseNoteMapKey: BaseNotes.C.mapKey,
    };
    expect(hintMidisForReferenceSlot(range, slot)).to.deep.equal([60, 64, 67]);
});

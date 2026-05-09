import {expect, test} from "vitest";
import {MAJOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME} from "../../src/notes/chords";
import {BaseNotes, MAJOR_SCALE_SET_NAME, MINOR_SCALE_SET_NAME} from "../../src/notes/scales";
import {referenceSlotDisplayTitle} from "../../src/routine/referenceGrid";

test("referenceSlotDisplayTitle formats scale and chord titles", () => {
    expect(
        referenceSlotDisplayTitle({
            kind: "scale",
            scaleType: MINOR_SCALE_SET_NAME,
            chordType: MAJOR_CHORDS_SET_NAME,
            baseNoteMapKey: BaseNotes.A.mapKey,
        }),
    ).to.equal("A Minor Scale");
    expect(
        referenceSlotDisplayTitle({
            kind: "chord",
            scaleType: MAJOR_SCALE_SET_NAME,
            chordType: MAJOR_CHORDS_SET_NAME,
            baseNoteMapKey: BaseNotes.D.mapKey,
        }),
    ).to.equal("D Major Chord");
    expect(
        referenceSlotDisplayTitle({
            kind: "chord",
            scaleType: MAJOR_SCALE_SET_NAME,
            chordType: MINOR_CHORDS_SET_NAME,
            baseNoteMapKey: BaseNotes.E.mapKey,
        }),
    ).to.equal("E Minor Chord");
});

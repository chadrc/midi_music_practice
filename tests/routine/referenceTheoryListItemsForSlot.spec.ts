import {expect, test} from "vitest";
import {referenceTheoryListItemsForSlot} from "../../src/routine/referenceGrid";
import {MAJOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME} from "../../src/notes/chords";
import {
    CHROMATIC_SCALE_SET_NAME,
    MAJOR_SCALE_SET_NAME,
    BaseNotes,
} from "../../src/notes/scales";

test("when tile is C major chord, Ionian/Major scale is listed", () => {
    const items = referenceTheoryListItemsForSlot({
        kind: "chord",
        chordType: MAJOR_CHORDS_SET_NAME,
        scaleType: MAJOR_SCALE_SET_NAME,
        baseNoteMapKey: BaseNotes.C.mapKey,
    });
    expect(
        items.some(
            (r) => r.highlightSlot.kind === "scale" && r.highlightSlot.scaleType === MAJOR_SCALE_SET_NAME,
        ),
    ).toBe(true);
});

test("when tile is C major chord, chromatic scale is not listed", () => {
    const items = referenceTheoryListItemsForSlot({
        kind: "chord",
        chordType: MAJOR_CHORDS_SET_NAME,
        scaleType: MAJOR_SCALE_SET_NAME,
        baseNoteMapKey: BaseNotes.C.mapKey,
    });
    expect(items.some((r) => r.highlightSlot.scaleType === CHROMATIC_SCALE_SET_NAME)).toBe(false);
});

test("when tile is C major scale, D minor triad on D is listed (not only same root as tile)", () => {
    const items = referenceTheoryListItemsForSlot({
        kind: "scale",
        scaleType: MAJOR_SCALE_SET_NAME,
        chordType: MAJOR_CHORDS_SET_NAME,
        baseNoteMapKey: BaseNotes.C.mapKey,
    });
    expect(
        items.some(
            (r) =>
                r.highlightSlot.kind === "chord" &&
                r.highlightSlot.chordType === MINOR_CHORDS_SET_NAME &&
                r.highlightSlot.baseNoteMapKey === BaseNotes.D.mapKey,
        ),
    ).toBe(true);
});

test("when tile is C major scale, C minor triad on C is not listed", () => {
    const items = referenceTheoryListItemsForSlot({
        kind: "scale",
        scaleType: MAJOR_SCALE_SET_NAME,
        chordType: MAJOR_CHORDS_SET_NAME,
        baseNoteMapKey: BaseNotes.C.mapKey,
    });
    expect(
        items.some(
            (r) =>
                r.highlightSlot.kind === "chord" &&
                r.highlightSlot.chordType === MINOR_CHORDS_SET_NAME &&
                r.highlightSlot.baseNoteMapKey === BaseNotes.C.mapKey,
        ),
    ).toBe(false);
});

test("when tile is C major scale, C major triad on C is listed", () => {
    const items = referenceTheoryListItemsForSlot({
        kind: "scale",
        scaleType: MAJOR_SCALE_SET_NAME,
        chordType: MAJOR_CHORDS_SET_NAME,
        baseNoteMapKey: BaseNotes.C.mapKey,
    });
    expect(
        items.some(
            (r) =>
                r.highlightSlot.kind === "chord" &&
                r.highlightSlot.chordType === MAJOR_CHORDS_SET_NAME &&
                r.highlightSlot.baseNoteMapKey === BaseNotes.C.mapKey,
        ),
    ).toBe(true);
});

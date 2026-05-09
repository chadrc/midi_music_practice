import {expect, test} from "vitest";
import {
    defaultReferenceViewSettings,
    mergeStoredReferenceView,
} from "../../src/routine/referenceViewSettings";
import {BaseNotes, MAJOR_SCALE_SET_NAME} from "../../src/notes/scales";
import {MAJOR_CHORDS_SET_NAME} from "../../src/notes/chords";
import {NoteRangeType} from "../../src/routine/types";

test("mergeStoredReferenceView returns defaults for non-object", () => {
    expect(mergeStoredReferenceView(null)).to.deep.equal(defaultReferenceViewSettings());
    expect(mergeStoredReferenceView(undefined)).to.deep.equal(defaultReferenceViewSettings());
});

test("mergeStoredReferenceView restores full snapshot", () => {
    const stored = {
        patternRows: 2,
        patternCols: 1,
        noteRange: {
            type: NoteRangeType.Notes,
            range: {start: 21, end: 33},
        },
        gridSelections: [
            {
                kind: "chord",
                scaleType: MAJOR_SCALE_SET_NAME,
                chordType: MAJOR_CHORDS_SET_NAME,
                baseNoteMapKey: BaseNotes.C.mapKey,
            },
            {
                kind: "scale",
                scaleType: MAJOR_SCALE_SET_NAME,
                chordType: MAJOR_CHORDS_SET_NAME,
                baseNoteMapKey: BaseNotes.G.mapKey,
            },
        ],
    };
    expect(mergeStoredReferenceView(stored)).to.deep.equal({
        patternRows: 2,
        patternCols: 1,
        showTileControls: false,
        noteRange: {
            type: NoteRangeType.Notes,
            range: {start: 21, end: 33},
        },
        gridSelections: [
            {
                kind: "chord",
                scaleType: MAJOR_SCALE_SET_NAME,
                chordType: MAJOR_CHORDS_SET_NAME,
                baseNoteMapKey: BaseNotes.C.mapKey,
            },
            {
                kind: "scale",
                scaleType: MAJOR_SCALE_SET_NAME,
                chordType: MAJOR_CHORDS_SET_NAME,
                baseNoteMapKey: BaseNotes.G.mapKey,
            },
        ],
    });
});

test("mergeStoredReferenceView restores showTileControls when true", () => {
    expect(
        mergeStoredReferenceView({
            patternRows: 1,
            patternCols: 1,
            noteRange: {type: NoteRangeType.Notes, range: {start: 60, end: 72}},
            gridSelections: [
                {
                    kind: "scale",
                    scaleType: MAJOR_SCALE_SET_NAME,
                    chordType: MAJOR_CHORDS_SET_NAME,
                    baseNoteMapKey: BaseNotes.C.mapKey,
                },
            ],
            showTileControls: true,
        }),
    ).to.deep.equal({
        patternRows: 1,
        patternCols: 1,
        showTileControls: true,
        noteRange: {type: NoteRangeType.Notes, range: {start: 60, end: 72}},
        gridSelections: [
            {
                kind: "scale",
                scaleType: MAJOR_SCALE_SET_NAME,
                chordType: MAJOR_CHORDS_SET_NAME,
                baseNoteMapKey: BaseNotes.C.mapKey,
            },
        ],
    });
});

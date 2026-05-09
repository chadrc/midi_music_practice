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
        patternColsPerRow: [1, 1],
        showTileControls: false,
        noteRangesPerRow: [
            {
                type: NoteRangeType.Notes,
                range: {start: 21, end: 33},
            },
            {
                type: NoteRangeType.Notes,
                range: {start: 21, end: 33},
            },
        ],
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
        patternColsPerRow: [1],
        showTileControls: true,
        noteRangesPerRow: [{type: NoteRangeType.Notes, range: {start: 60, end: 72}}],
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

test("mergeStoredReferenceView uses patternColsPerRow when present", () => {
    const oneSlot = defaultReferenceViewSettings().gridSelections[0]!;
    expect(
        mergeStoredReferenceView({
            patternRows: 2,
            patternColsPerRow: [3, 2],
            noteRange: {type: NoteRangeType.Notes, range: {start: 60, end: 72}},
            gridSelections: [],
        }),
    ).to.deep.equal({
        patternRows: 2,
        patternColsPerRow: [3, 2],
        showTileControls: false,
        noteRangesPerRow: [
            {type: NoteRangeType.Notes, range: {start: 60, end: 72}},
            {type: NoteRangeType.Notes, range: {start: 60, end: 72}},
        ],
        gridSelections: Array.from({length: 5}, () => ({...oneSlot})),
    });
});

test("mergeStoredReferenceView keeps distinct noteRangesPerRow when present", () => {
    const oneSlot = defaultReferenceViewSettings().gridSelections[0]!;
    expect(
        mergeStoredReferenceView({
            patternRows: 2,
            patternColsPerRow: [1, 1],
            noteRangesPerRow: [
                {type: NoteRangeType.Notes, range: {start: 10, end: 20}},
                {type: NoteRangeType.Frets, range: {start: 0, end: 5}},
            ],
            gridSelections: [],
        }),
    ).to.deep.equal({
        patternRows: 2,
        patternColsPerRow: [1, 1],
        showTileControls: false,
        noteRangesPerRow: [
            {type: NoteRangeType.Notes, range: {start: 10, end: 20}},
            {type: NoteRangeType.Frets, range: {start: 0, end: 5}},
        ],
        gridSelections: Array.from({length: 2}, () => ({...oneSlot})),
    });
});

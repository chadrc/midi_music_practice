import {expect, test} from "vitest";
import {
    mergeStoredReferencePresets,
    snapshotReferenceViewSettings,
    defaultReferenceViewSettings,
} from "../../src/routine/referenceViewSettings";
import {BaseNotes, MAJOR_SCALE_SET_NAME} from "../../src/notes/scales";
import {MAJOR_CHORDS_SET_NAME} from "../../src/notes/chords";
import {NoteRangeType} from "../../src/routine/types";
import {NOTE_RANGE_MAX_MIDI} from "../../src/routine";

test("mergeStoredReferencePresets skips invalid entries and restores full presets", () => {
    const raw = [
        {name: "   ", id: "bad"},
        {
            id: "preset-1",
            name: "  Triads  ",
            noteRange: {type: NoteRangeType.Notes, range: {start: 60, end: 72}},
            patternRows: 1,
            patternCols: 2,
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
        },
    ];
    expect(mergeStoredReferencePresets(raw)).to.deep.equal([
        {
            id: "preset-1",
            name: "Triads",
            showTileControls: false,
            noteRanges: [
                {type: NoteRangeType.Notes, range: {start: 60, end: 72}},
                {type: NoteRangeType.Notes, range: {start: 60, end: 72}},
            ],
            patternRows: 1,
            patternColsPerRow: [2],
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
        },
    ]);
});

test("snapshotReferenceViewSettings returns merge-normalized copy", () => {
    const live = defaultReferenceViewSettings();
    live.noteRanges[0]!.range.start = 55;
    live.noteRanges[0]!.range.end = 77;
    const snap = snapshotReferenceViewSettings(live);
    expect(snap).to.deep.equal({
        noteRanges: [
            {
                type: NoteRangeType.Notes,
                range: {start: 55, end: 77},
            },
            {
                type: NoteRangeType.Notes,
                range: {start: 0, end: NOTE_RANGE_MAX_MIDI},
            },
        ],
        patternRows: 1,
        patternColsPerRow: [2],
        showTileControls: false,
        gridSelections: [
            {
                kind: "scale",
                scaleType: MAJOR_SCALE_SET_NAME,
                chordType: MAJOR_CHORDS_SET_NAME,
                baseNoteMapKey: BaseNotes.C.mapKey,
            },
            {
                kind: "scale",
                scaleType: MAJOR_SCALE_SET_NAME,
                chordType: MAJOR_CHORDS_SET_NAME,
                baseNoteMapKey: BaseNotes.C.mapKey,
            },
        ],
    });
});

import {expect, test} from "vitest";
import {generateNotesForRange, NOTE_RANGE_MAX_MIDI, STANDARD_TUNING_OPEN_FRET_NOTES} from "../../src/routine";
import {NoteRangeType, PracticePoolMode, PracticeType} from "../../src/routine/types";

test("Notes practice uses configured MIDI window", () => {
    expect(
        generateNotesForRange({
            practice: {
                type: PracticeType.Notes,
                noteRange: {type: NoteRangeType.Notes, range: {start: 5, end: 7}},
            },
        }),
    ).to.deep.equal([5, 6, 7]);
});

test("Chords practice spans full MIDI range length", () => {
    const fullFromChords = generateNotesForRange({
        practice: {type: PracticeType.Chords, chordTypes: [], mode: PracticePoolMode.Random},
    });
    expect(fullFromChords).to.have.length(NOTE_RANGE_MAX_MIDI + 1);
});

test("Chords practice starts at MIDI 0", () => {
    const fullFromChords = generateNotesForRange({
        practice: {type: PracticeType.Chords, chordTypes: [], mode: PracticePoolMode.Random},
    });
    expect(fullFromChords.slice(0, 3)).to.deep.equal([0, 1, 2]);
});

test("Chords practice ends at max MIDI", () => {
    const fullFromChords = generateNotesForRange({
        practice: {type: PracticeType.Chords, chordTypes: [], mode: PracticePoolMode.Random},
    });
    expect(fullFromChords.slice(-2)).to.deep.equal([126, 127]);
});

test("Frets mode uses open-string tuning offsets", () => {
    const open = generateNotesForRange({
        practice: {
            type: PracticeType.Notes,
            noteRange: {type: NoteRangeType.Frets, range: {start: 0, end: 0}},
        },
    });
    expect(open).to.deep.equal([...STANDARD_TUNING_OPEN_FRET_NOTES]);
});

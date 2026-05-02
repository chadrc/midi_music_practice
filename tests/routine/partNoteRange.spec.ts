import {expect, test} from "vitest";
import {generateChordPrompts, generateNotesForRange, NOTE_RANGE_MAX_MIDI} from "../../src/routine";
import {NoteRangeType, PracticePoolMode, PracticeType} from "../../src/routine/types";
import {MAJOR_CHORDS_SET_NAME} from "../../src/notes/chords";
import {NumberGenerator} from "../../src/common/NumberGenerator";
import {minimalBakedPart} from "./fixtures";

test("generateNotesForRange uses part-level noteRange", () => {
    expect(
        generateNotesForRange({
            noteRange: {type: NoteRangeType.Notes, range: {start: 5, end: 7}},
        }),
    ).to.deep.equal([5, 6, 7]);
});

test("full MIDI span matches NOTE_RANGE_MAX_MIDI", () => {
    const full = generateNotesForRange({
        noteRange: {type: NoteRangeType.Notes, range: {start: 0, end: NOTE_RANGE_MAX_MIDI}},
    });
    expect(full).to.have.length(NOTE_RANGE_MAX_MIDI + 1);
    expect(full.slice(0, 3)).to.deep.equal([0, 1, 2]);
    expect(full.slice(-2)).to.deep.equal([126, 127]);
});

test("Chord Up sequence drops chord tones outside part noteRange", () => {
    const generated = generateChordPrompts(
        minimalBakedPart({
            noteRange: {type: NoteRangeType.Notes, range: {start: 40, end: 127}},
            promptCount: 4,
            practice: {
                type: PracticeType.Chords,
                baseNote: "C",
                chordTypes: [MAJOR_CHORDS_SET_NAME],
                mode: PracticePoolMode.Up,
                octaveRange: {start: 2, end: 2},
            },
        }),
        new NumberGenerator(1),
    );
    expect(generated.prompts).to.have.length(4);
    for (const p of generated.prompts) {
        expect(p.notes[0]).toBeGreaterThanOrEqual(40);
    }
});

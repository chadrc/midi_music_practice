import {expect, test} from "vitest";
import {
    defaultUserRoutineNoteRange,
    noteRangeForPractice,
    NOTE_RANGE_MAX_MIDI,
} from "../../src/routine";
import {NoteRangeType, PracticePoolMode, PracticeType} from "../../src/routine/types";

test("embeds noteRange for Notes practice", () => {
    const nr = {type: NoteRangeType.Frets as const, range: {start: 1, end: 4}};
    expect(noteRangeForPractice({type: PracticeType.Notes, noteRange: nr})).to.deep.equal(nr);
});

test("Chords practice without noteRange uses default full MIDI span", () => {
    const resolved = noteRangeForPractice({
        type: PracticeType.Chords,
        chordTypes: [],
        mode: PracticePoolMode.Random,
    });
    expect(resolved).to.deep.equal(defaultUserRoutineNoteRange());
    expect(resolved.range.end).to.equal(NOTE_RANGE_MAX_MIDI);
});

import {expect, test} from "vitest";
import {chordFromSpec, MAX_MIDI_NOTES, midiVoicingForChordAtFundamental} from "../../src/routine";
import type {Chord} from "../../src/notes/chords";
import {MAJOR_CHORDS_SET_NAME} from "../../src/notes/chords";

function playableRoots(chord: Chord): number[] {
    const rootPc = chord.baseNote.pitchClass;
    const out: number[] = [];
    for (let fund = rootPc; fund <= MAX_MIDI_NOTES; fund += 12) {
        const notes = midiVoicingForChordAtFundamental(chord, fund);
        if (notes.every((n) => n >= 0 && n <= MAX_MIDI_NOTES)) {
            out.push(fund);
        }
    }
    return out;
}

test("C major playable roots across octaves", () => {
    const chord = chordFromSpec({chordType: MAJOR_CHORDS_SET_NAME, baseNote: "C"});
    expect(playableRoots(chord)).to.deep.equal([
        0, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120,
    ]);
});

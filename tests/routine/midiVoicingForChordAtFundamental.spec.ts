import {expect, test} from "vitest";
import {chordFromSpec, midiVoicingForChordAtFundamental} from "../../src/routine";
import {MAJOR_CHORDS_SET_NAME} from "../../src/notes/chords";

test("major triad voicing from fundamental MIDI", () => {
    const chord = chordFromSpec({chordType: MAJOR_CHORDS_SET_NAME, baseNote: "C"});
    expect(midiVoicingForChordAtFundamental(chord, 60)).to.deep.equal([60, 64, 67]);
});

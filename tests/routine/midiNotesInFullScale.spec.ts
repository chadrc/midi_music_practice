import {expect, test} from "vitest";
import {getRegisteredScale, CHROMATIC_SCALE_SET_NAME} from "../../src/notes/scales";
import {MAX_MIDI_NOTES} from "../../src/routine";

test("chromatic scale includes every MIDI note", () => {
    const s = getRegisteredScale(CHROMATIC_SCALE_SET_NAME, "C");
    const notes: number[] = [];
    for (let n = 0; n <= MAX_MIDI_NOTES; n++) {
        if (s.contains(n)) {
            notes.push(n);
        }
    }
    expect(notes).to.deep.equal(Array.from({length: 128}, (_, i) => i));
});

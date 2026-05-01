import {expect, test} from "vitest";
import {chordFromSpec} from "../../src/routine";
import {MAJOR_CHORDS_SET_NAME} from "../../src/notes/chords";

test("explicit type and baseNote resolve to C major triad pattern", () => {
    const chord = chordFromSpec({chordType: MAJOR_CHORDS_SET_NAME, baseNote: "C"});
    expect({mapKey: chord.baseNote.mapKey, pattern: [...chord.pattern]}).to.deep.equal({
        mapKey: "C",
        pattern: [1, 5, 8],
    });
});

test("defaults resolve to same C major triad as explicit spec", () => {
    const chord = chordFromSpec({});
    expect({mapKey: chord.baseNote.mapKey, pattern: [...chord.pattern]}).to.deep.equal({
        mapKey: "C",
        pattern: [1, 5, 8],
    });
});

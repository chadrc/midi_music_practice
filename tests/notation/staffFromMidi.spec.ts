import {expect, test} from "vitest";
import {
    buildChordEasyScoreLine,
    effectiveMidiForStaff,
    GRAND_STAFF_SPLIT_MIDI,
    mapPromptNotesToStaffMidis,
    midiToEasyScorePitch,
    splitGrandStaffMidis,
} from "../../src/notation/staffFromMidi";

test("effectiveMidiForStaff keeps MIDI when requireOctave", () => {
    expect(effectiveMidiForStaff(72, true)).toBe(72);
    expect(effectiveMidiForStaff(48, true)).toBe(48);
});

test("effectiveMidiForStaff maps to middle-C octave when octave off", () => {
    expect(effectiveMidiForStaff(60, false)).toBe(60);
    expect(effectiveMidiForStaff(72, false)).toBe(60);
    expect(effectiveMidiForStaff(48, false)).toBe(60);
    expect(effectiveMidiForStaff(49, false)).toBe(61);
    expect(effectiveMidiForStaff(73, false)).toBe(61);
});

test("midiToEasyScorePitch uses sharp spelling", () => {
    expect(midiToEasyScorePitch(60)).toBe("C4");
    expect(midiToEasyScorePitch(61)).toBe("C#4");
    expect(midiToEasyScorePitch(70)).toBe("A#4");
});

test("buildChordEasyScoreLine single and chord", () => {
    expect(buildChordEasyScoreLine([60])).toBe("C4/q");
    expect(buildChordEasyScoreLine([60, 64, 67])).toBe("G4/q, E4, C4");
});

test("mapPromptNotesToStaffMidis dedupes", () => {
    expect(mapPromptNotesToStaffMidis([60, 60, 72], true)).toEqual([60, 72]);
});

test("splitGrandStaffMidis uses middle C boundary", () => {
    expect(GRAND_STAFF_SPLIT_MIDI).toBe(60);
    expect(splitGrandStaffMidis([59, 60])).toEqual({treble: [60], bass: [59]});
    expect(splitGrandStaffMidis([72])).toEqual({treble: [72], bass: []});
});

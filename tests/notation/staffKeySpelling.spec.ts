import {expect, test} from "vitest";
import {
  inferVexKeySignature,
  midiToEasyScorePitchForKey,
  normalizeVexKey,
  routineMapKeyToVexTonic,
  scaleTypeToVexKey,
} from "../../src/notation/staffKeySpelling";
import {MAJOR_CHORDS_SET_NAME} from "../../src/notes/chords";
import {
  CHROMATIC_SCALE_SET_NAME,
  MAJOR_SCALE_SET_NAME,
  MINOR_SCALE_SET_NAME,
} from "../../src/notes/scales";
import {PracticePoolMode, PracticeType} from "../../src/routine/types";

test("routineMapKeyToVexTonic maps persisted keys", () => {
  expect(routineMapKeyToVexTonic("CSharp")).toBe("C#");
  expect(routineMapKeyToVexTonic("BFlat")).toBe("Bb");
  expect(routineMapKeyToVexTonic(undefined)).toBe("C");
});

test("scaleTypeToVexKey major vs minor", () => {
  expect(scaleTypeToVexKey("G", MAJOR_SCALE_SET_NAME)).toBe("G");
  expect(scaleTypeToVexKey("A", MINOR_SCALE_SET_NAME)).toBe("Am");
});

test("scaleTypeToVexKey chromatic keeps tonic", () => {
  expect(scaleTypeToVexKey("G", CHROMATIC_SCALE_SET_NAME)).toBe("G");
});

test("normalizeVexKey maps major tonics VexFlow does not list to enharmonic keys", () => {
  expect(normalizeVexKey("G#")).toBe("Ab");
  expect(normalizeVexKey("D#")).toBe("Eb");
  expect(normalizeVexKey("A#")).toBe("Bb");
  expect(scaleTypeToVexKey("G#", MAJOR_SCALE_SET_NAME)).toBe("Ab");
});

test("inferVexKeySignature GSharp major uses Ab (VexFlow has no G# major symbol)", () => {
  const scalesPractice = {
    type: PracticeType.Scales as const,
    baseNote: "GSharp",
    scaleTypes: [MAJOR_SCALE_SET_NAME],
    mode: PracticePoolMode.Random,
  };
  expect(inferVexKeySignature(scalesPractice, [])).toBe("Ab");
});

test("inferVexKeySignature prefers staffFundamentalMapKey over baseNote", () => {
  const scalesPractice = {
    type: PracticeType.Scales as const,
    baseNote: "C",
    scaleTypes: [MAJOR_SCALE_SET_NAME],
    mode: PracticePoolMode.Random,
  };
  expect(inferVexKeySignature(scalesPractice, [60], "GSharp")).toBe("Ab");
});

test("inferVexKeySignature chords from voicing third", () => {
  const chordPractice = {
    type: PracticeType.Chords as const,
    chordTypes: [MAJOR_CHORDS_SET_NAME],
    mode: PracticePoolMode.Random,
  };
  expect(inferVexKeySignature(chordPractice, [67, 71, 74])).toBe("G");
  expect(inferVexKeySignature(chordPractice, [57, 60, 64])).toBe("Am");
});

test("inferVexKeySignature scales uses base + type", () => {
  const scalesPractice = {
    type: PracticeType.Scales as const,
    baseNote: "D",
    scaleTypes: [MAJOR_SCALE_SET_NAME],
    mode: PracticePoolMode.Random,
  };
  expect(inferVexKeySignature(scalesPractice, [])).toBe("D");
  const minorPractice = {
    ...scalesPractice,
    scaleTypes: [MINOR_SCALE_SET_NAME],
  };
  expect(inferVexKeySignature(minorPractice, [])).toBe("Dm");
});

test("inferVexKeySignature scales falls back to prompt when baseNote missing", () => {
  const scalesPractice = {
    type: PracticeType.Scales as const,
    baseNote: "",
    scaleTypes: [MAJOR_SCALE_SET_NAME],
    mode: PracticePoolMode.Random,
  };
  expect(inferVexKeySignature(scalesPractice, [67])).toBe("G");
});

test("midiToEasyScorePitchForKey omits accidentals supplied by key signature", () => {
  expect(midiToEasyScorePitchForKey(67, "G")).toBe("G4");
  expect(midiToEasyScorePitchForKey(66, "G")).toBe("F4");
  expect(midiToEasyScorePitchForKey(65, "G")).toBe("Fn4");
});

test("inferVexKeySignature scales uses resolved fundamental when baseNote cleared", () => {
  const scalesPractice = {
    type: PracticeType.Scales as const,
    baseNote: "",
    scaleTypes: [MAJOR_SCALE_SET_NAME],
    mode: PracticePoolMode.Random,
  };
  expect(inferVexKeySignature(scalesPractice, [66], "FSharp")).toBe("F#");
});

test("inferVexKeySignature single-note practice uses parallel major of lowest midi", () => {
  expect(inferVexKeySignature({type: PracticeType.Notes}, [64])).toBe("E");
  expect(inferVexKeySignature({type: PracticeType.Notes}, [67])).toBe("G");
});

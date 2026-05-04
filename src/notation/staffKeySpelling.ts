import {Flow} from "vexflow";
import {
  CHROMATIC_SCALE_SET_NAME,
  DORIAN_SCALE_SET_NAME,
  LOCRIAN_SCALE_SET_NAME,
  LYDIAN_SCALE_SET_NAME,
  MAJOR_PENTATONIC_SCALE_SET_NAME,
  MAJOR_SCALE_SET_NAME,
  MIXOLYDIAN_SCALE_SET_NAME,
  MINOR_PENTATONIC_SCALE_SET_NAME,
  MINOR_SCALE_SET_NAME,
  PHRYGIAN_SCALE_SET_NAME,
} from "../notes/scales";
import {scientificOctaveFromMidi} from "../notes";
import type {ScaleTypeId, UserRoutinePractice} from "../routine/types";
import {PracticeType} from "../routine/types";

const DIATONIC_LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;
const LETTER_NATURAL_PC: Record<string, number> = {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11};

const MAP_KEY_TO_VEX: Record<string, string> = {
  C: "C",
  CSharp: "C#",
  DFlat: "Db",
  D: "D",
  DSharp: "D#",
  EFlat: "Eb",
  E: "E",
  F: "F",
  FSharp: "F#",
  GFlat: "Gb",
  G: "G",
  GSharp: "G#",
  AFlat: "Ab",
  A: "A",
  ASharp: "A#",
  BFlat: "Bb",
  B: "B",
};

const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const NATURAL_MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

const SHARP_MAJOR_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_MAJOR_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

export function routineMapKeyToVexTonic(mapKey: string | undefined): string {
  if (!mapKey) {
    return "C";
  }
  return MAP_KEY_TO_VEX[mapKey] ?? "C";
}

export function vexTonicToPitchClass(vexTonic: string): number {
  const m = /^([A-G])(#|b)?$/.exec(vexTonic);
  if (!m) {
    return 0;
  }
  const letter = m[1]!;
  const acc = m[2] ?? "";
  const base = LETTER_NATURAL_PC[letter] ?? 0;
  if (acc === "#") {
    return (base + 1 + 12) % 12;
  }
  if (acc === "b") {
    return (base - 1 + 12) % 12;
  }
  return base % 12;
}

export function majorPcToVexKey(pc: number): string {
  const s = ((pc % 12) + 12) % 12;
  const sharpName = SHARP_MAJOR_NAMES[s]!;
  if (Flow.hasKeySignature(sharpName)) {
    return sharpName;
  }
  const flatName = FLAT_MAJOR_NAMES[s]!;
  if (Flow.hasKeySignature(flatName)) {
    return flatName;
  }
  return "C";
}

function parseVexKeySpec(spec: string): {tonicName: string; minor: boolean} {
  const m = /^([A-G])(#|b)?(m)$/.exec(spec);
  if (m) {
    return {tonicName: `${m[1]!}${m[2] ?? ""}`, minor: true};
  }
  const mj = /^([A-G])(#|b)?$/.exec(spec);
  if (mj) {
    return {tonicName: `${mj[1]!}${mj[2] ?? ""}`, minor: false};
  }
  return {tonicName: "C", minor: false};
}

function spellDiatonicScale(tonicPc: number, firstLetter: string, intervals: number[]): Map<number, string> {
  const letterStart = DIATONIC_LETTERS.indexOf(firstLetter as (typeof DIATONIC_LETTERS)[number]);
  if (letterStart < 0) {
    throw new RangeError(`Bad letter ${firstLetter}`);
  }
  const map = new Map<number, string>();
  for (let i = 0; i < intervals.length; i++) {
    const targetPc = (tonicPc + intervals[i]!) % 12;
    const letter = DIATONIC_LETTERS[(letterStart + i) % 7]!;
    const naturalPc = LETTER_NATURAL_PC[letter]!;
    const diff = (targetPc - naturalPc + 12) % 12;
    let acc = "";
    if (diff <= 6) {
      if (diff === 1) {
        acc = "#";
      } else if (diff === 2) {
        acc = "##";
      } else if (diff === 11) {
        acc = "b";
      } else if (diff === 10) {
        acc = "bb";
      }
    }
    map.set(targetPc, `${letter}${acc}`);
  }
  return map;
}

function buildDiatonicPcToNameMap(vexKey: string): Map<number, string> {
  const {tonicName, minor} = parseVexKeySpec(vexKey);
  const tonicPc = vexTonicToPitchClass(tonicName);
  const firstLetter = tonicName[0]!;
  if (minor) {
    return spellDiatonicScale(tonicPc, firstLetter, NATURAL_MINOR_INTERVALS);
  }
  return spellDiatonicScale(tonicPc, firstLetter, MAJOR_INTERVALS);
}

function parseDiatonicNoteName(name: string): {letter: string; acc: string} {
  const m = /^([A-G])(bb|b|##|#)?$/.exec(name);
  if (!m) {
    return {letter: "C", acc: ""};
  }
  return {letter: m[1]!, acc: m[2] ?? ""};
}

/** For each staff letter, accidentals implied by the key (from the diatonic collection). */
function keyImpliedAccByLetter(vexKey: string): Map<string, string> {
  const diatonicNames = buildDiatonicPcToNameMap(vexKey);
  const byLetter = new Map<string, string>();
  for (const name of diatonicNames.values()) {
    const p = parseDiatonicNoteName(name);
    byLetter.set(p.letter, p.acc);
  }
  return byLetter;
}

/** EasyScore accidental token: omit when the key signature already supplies it. */
function easyScoreAccidentalSuffix(writtenAcc: string, keyImpl: string): string {
  if (writtenAcc === keyImpl) {
    return "";
  }
  if (writtenAcc === "" && keyImpl === "") {
    return "";
  }
  if (writtenAcc === "" && keyImpl !== "") {
    return "n";
  }
  if (writtenAcc === "#" && keyImpl === "") {
    return "#";
  }
  if (writtenAcc === "b" && keyImpl === "") {
    return "b";
  }
  if (writtenAcc === "##" && keyImpl === "") {
    return "##";
  }
  if (writtenAcc === "bb" && keyImpl === "") {
    return "bb";
  }
  if (writtenAcc === "#" && keyImpl === "b") {
    return "#";
  }
  if (writtenAcc === "b" && keyImpl === "#") {
    return "b";
  }
  return writtenAcc;
}

/** Spelling for EasyScore: letter + optional accidental + octave; omits accidentals the key signature supplies. */
export function midiToEasyScorePitchForKey(midi: number, vexKey: string): string {
  const oct = scientificOctaveFromMidi(midi);
  const pc = ((midi % 12) + 12) % 12;
  const map = buildDiatonicPcToNameMap(vexKey);
  const name = map.get(pc);
  if (name !== undefined) {
    const {letter} = parseDiatonicNoteName(name);
    return `${letter}${oct}`;
  }
  const label = formatMidiNoteSharpSide(midi);
  const ma = /^([A-G])([#b]?)(-?\d+)$/.exec(label);
  if (!ma) {
    throw new Error(`Unexpected MIDI label for ${midi}: ${label}`);
  }
  const letter = ma[1]!;
  const accFromLabel = ma[2] ?? "";
  const keyImpl = keyImpliedAccByLetter(vexKey).get(letter) ?? "";
  const suffix = easyScoreAccidentalSuffix(accFromLabel, keyImpl);
  return `${letter}${suffix}${oct}`;
}

function formatMidiNoteSharpSide(midiNote: number): string {
  const letterNo = ((midiNote % 12) + 12) % 12;
  const octave = scientificOctaveFromMidi(midiNote);
  const letters = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return `${letters[letterNo]!}${octave}`;
}

export function normalizeVexKey(spec: string): string {
  if (Flow.hasKeySignature(spec)) {
    return spec;
  }
  const {tonicName, minor} = parseVexKeySpec(spec);
  const pc = vexTonicToPitchClass(tonicName);
  if (minor) {
    const candidate = `${majorPcToVexKey(pc)}m`;
    if (Flow.hasKeySignature(candidate)) {
      return candidate;
    }
    return "Am";
  }
  return majorPcToVexKey(pc);
}

export function scaleTypeToVexKey(tonicVex: string, scaleType: ScaleTypeId): string {
  const rootPc = vexTonicToPitchClass(tonicVex);
  switch (scaleType) {
    case CHROMATIC_SCALE_SET_NAME:
      return normalizeVexKey(tonicVex);
    case MAJOR_SCALE_SET_NAME:
    case MAJOR_PENTATONIC_SCALE_SET_NAME:
      return normalizeVexKey(tonicVex);
    case MINOR_SCALE_SET_NAME:
    case MINOR_PENTATONIC_SCALE_SET_NAME:
      return normalizeVexKey(`${tonicVex}m`);
    case DORIAN_SCALE_SET_NAME:
      return normalizeVexKey(majorPcToVexKey((rootPc + 10) % 12));
    case PHRYGIAN_SCALE_SET_NAME:
      return normalizeVexKey(majorPcToVexKey((rootPc + 8) % 12));
    case LYDIAN_SCALE_SET_NAME:
      return normalizeVexKey(majorPcToVexKey((rootPc + 7) % 12));
    case MIXOLYDIAN_SCALE_SET_NAME:
      return normalizeVexKey(majorPcToVexKey((rootPc + 5) % 12));
    case LOCRIAN_SCALE_SET_NAME:
      return normalizeVexKey(majorPcToVexKey((rootPc + 1) % 12));
    default:
      return "C";
  }
}

/** Treat lowest written pitch as a major key for staff display (parallel major). */
export function parallelMajorVexKeyFromPromptMidis(midis: number[]): string {
  if (midis.length === 0) {
    return "C";
  }
  const rootPc = ((Math.min(...midis) % 12) + 12) % 12;
  return normalizeVexKey(majorPcToVexKey(rootPc));
}

/**
 * VexFlow key signature string for the active practice + prompt (combined staff).
 */
export function inferVexKeySignature(
  practice: UserRoutinePractice,
  promptNotes: number[],
  /** Matches {@link Prompt.staffFundamentalMapKey} when scale/chord base note is unset. */
  resolvedFundamentalMapKey?: string,
): string {
  const fundKey =
    resolvedFundamentalMapKey != null && resolvedFundamentalMapKey !== ""
      ? resolvedFundamentalMapKey
      : undefined;

  switch (practice.type) {
    case PracticeType.Scales: {
      const mapKey =
        fundKey ??
        (practice.baseNote != null && practice.baseNote !== "" ? practice.baseNote : undefined);
      const fromRoutine =
        mapKey != null
          ? routineMapKeyToVexTonic(mapKey)
          : parallelMajorVexKeyFromPromptMidis(promptNotes);
      const st = practice.scaleTypes[0] ?? MAJOR_SCALE_SET_NAME;
      return scaleTypeToVexKey(fromRoutine, st);
    }
    case PracticeType.Chords: {
      if (promptNotes.length === 0) {
        return "C";
      }
      const mapKey =
        fundKey ??
        (practice.baseNote != null && practice.baseNote !== "" ? practice.baseNote : undefined);
      const rootPc =
        mapKey != null
          ? vexTonicToPitchClass(routineMapKeyToVexTonic(mapKey))
          : ((Math.min(...promptNotes) % 12) + 12) % 12;
      const pcs = new Set(promptNotes.map((n) => ((n % 12) + 12) % 12));
      const hasMajorThird = pcs.has((rootPc + 4) % 12);
      const hasMinorThird = pcs.has((rootPc + 3) % 12);
      const minor = hasMinorThird && !hasMajorThird;
      const tonicVex = majorPcToVexKey(rootPc);
      if (minor) {
        return normalizeVexKey(`${tonicVex}m`);
      }
      return normalizeVexKey(tonicVex);
    }
    case PracticeType.Notes:
      if (fundKey != null) {
        return normalizeVexKey(routineMapKeyToVexTonic(fundKey));
      }
      return parallelMajorVexKeyFromPromptMidis(promptNotes);
    default:
      return "C";
  }
}

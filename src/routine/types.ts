import type {NumberRangeLike} from "../common/NumberRange";
import {
    DIMINISHED_CHORDS_SET_NAME,
    MAJOR_CHORDS_SET_NAME,
    MINOR_CHORDS_SET_NAME,
} from "../notes/chords";
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

export const CHORD_TYPE_OPTIONS = [
    MAJOR_CHORDS_SET_NAME,
    MINOR_CHORDS_SET_NAME,
    DIMINISHED_CHORDS_SET_NAME,
] as const;

export type ChordTypeId = (typeof CHORD_TYPE_OPTIONS)[number];

export const SCALE_TYPE_OPTIONS = [
    CHROMATIC_SCALE_SET_NAME,
    MAJOR_SCALE_SET_NAME,
    DORIAN_SCALE_SET_NAME,
    PHRYGIAN_SCALE_SET_NAME,
    LYDIAN_SCALE_SET_NAME,
    MIXOLYDIAN_SCALE_SET_NAME,
    MINOR_SCALE_SET_NAME,
    LOCRIAN_SCALE_SET_NAME,
    MAJOR_PENTATONIC_SCALE_SET_NAME,
    MINOR_PENTATONIC_SCALE_SET_NAME,
] as const;

export type ScaleTypeId = (typeof SCALE_TYPE_OPTIONS)[number];

/** One chord target; missing fields use routine defaults when resolving. */
export interface PracticeChordSpec {
    baseNote?: string;
    chordType?: ChordTypeId;
}

/** One scale target; missing fields use routine defaults when resolving. */
export interface PracticeScaleSpec {
    baseNote?: string;
    scaleType?: ScaleTypeId;
}

export enum NoteRangeType {
    Notes,
    Frets,
    Octaves,
}

export interface UserRoutineNoteRange {
    type: NoteRangeType;
    range: NumberRangeLike;
}

export enum PracticeType {
    Notes,
    Chords,
    Scales,
}

/** How ordered chord/scale targets advance (e.g. along the multi-select list). */
export enum PracticePoolMode {
    Up = "Up",
    Down = "Down",
    Random = "Random",
}

/** Default scientific octave span for chord/scale roots (see {@link formatMidiNote} octaves). */
export const DEFAULT_PRACTICE_OCTAVE_RANGE: NumberRangeLike = {start: 2, end: 4};

/** Single-note prompts; pitch range applies only to this practice mode. */
export interface RoutineNotesPractice {
    type: PracticeType.Notes;
    noteRange: UserRoutineNoteRange;
}

/** Chord practice: one optional root and any number of chord qualities from the chord registry. */
export interface RoutineChordsPractice {
    type: PracticeType.Chords;
    baseNote?: string;
    /** Empty means one implicit default target (major), matching legacy `[{}]`. */
    chordTypes: ChordTypeId[];
    /** Order / traversal of the chord-type pool; default Random. */
    mode: PracticePoolMode;
    /**
     * Scientific octave bounds for chord roots (same numbering as note labels, e.g. “C4” → 4).
     * Defaults to {@link DEFAULT_PRACTICE_OCTAVE_RANGE} when missing.
     */
    octaveRange?: NumberRangeLike;
}

/** Scale practice: one optional root and any number of scale types from the scale registry. */
export interface RoutineScalesPractice {
    type: PracticeType.Scales;
    baseNote?: string;
    /** Empty means chromatic in the chosen (or default) root, matching legacy `[{}]`. */
    scaleTypes: ScaleTypeId[];
    /** Order / traversal of the scale-type pool; default Random. */
    mode: PracticePoolMode;
    /**
     * Scientific octaves allowed for scale prompts; one octave is chosen at random per prompt
     * (uniform over inclusive start…end).
     */
    octaveRange?: NumberRangeLike;
}

export type UserRoutinePractice =
    | RoutineNotesPractice
    | RoutineChordsPractice
    | RoutineScalesPractice;

export enum ParentType {
    Settings,
    Previous,
    First,
}

export interface UserRoutinePartSettings {
    name: string;
    seed: number | null;
    targetBPM: number;
    practice: UserRoutinePractice;
    requireOctave: boolean;
    minSuccessVelocity: number;
    promptCount: number;
}

export type UserRoutineSettingsKeys = (keyof UserRoutinePartSettings)[];

export type NullableUserRoutinePartSettings = {
    [K in keyof UserRoutinePartSettings]: UserRoutinePartSettings[K] | null;
}

interface BaseRoutinePartSettings {
    repeatCount: number;
    cloneRepeat: boolean;
    parentSettings: ParentType;
}

export interface RoutinePartSettings extends BaseRoutinePartSettings, NullableUserRoutinePartSettings {}

export interface BakedRoutinePartSettings extends BaseRoutinePartSettings, UserRoutinePartSettings {}

export interface RoutineSettings {
    id: string;
    appVersion: string;
    schemaVersion: string;
    name: string;
    parts: RoutinePartSettings[];
}

export type PromptDisplay =
    | {kind: "note"; note: string}
    | {kind: "chord"; title: string; cells: string[]}
    | {kind: "scale"; title: string; cells: string[]};

export interface Prompt {
    index: number;
    notes: number[];
    color: string;
    displays: PromptDisplay[];
}

/** One batch of prompts from {@link generatePrompts} plus optional chord/scale context for the repeat. */
export interface GeneratedRepetitionPrompts {
    prompts: Prompt[];
    /** e.g. "C Major" or "D Major (Ionian), Dorian" — root plus type name(s), space-separated. */
    repeatFocusLabel?: string;
}

export interface RoutinePartRepetition {
    prompts: Prompt[];
    repeatFocusLabel?: string;
}

export interface RoutinePart {
    name: string;
    generator: NumberGenerator;
    repetitions: RoutinePartRepetition[];
    bakedSettings: BakedRoutinePartSettings;
}

export interface Routine {
    parts: RoutinePart[];
}

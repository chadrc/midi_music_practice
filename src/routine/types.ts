import type {NumberRangeLike} from "../common/NumberRange";
import type {NumberGenerator} from "../common/NumberGenerator";
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

/** Single-note prompts; filtering uses chromatic (all pitch classes in range). */
export interface RoutineNotesPractice {
    type: PracticeType.Notes;
}

/** Chord practice: pool of chord targets (optional root + quality). */
export interface RoutineChordsPractice {
    type: PracticeType.Chords;
    items: PracticeChordSpec[];
}

/** Scale practice: pool of scale/key targets. */
export interface RoutineScalesPractice {
    type: PracticeType.Scales;
    items: PracticeScaleSpec[];
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
    noteRange: UserRoutineNoteRange;
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

export interface PromptDisplay {
    note: string;
    chordType: string;
}

export interface Prompt {
    index: number;
    notes: number[];
    color: string;
    displays: PromptDisplay[];
}

export interface RoutinePartRepetition {
    prompts: Prompt[];
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

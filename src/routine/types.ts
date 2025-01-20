import {NumberRangeLike} from "../common/NumberRange";

export enum NoteRangeType {
    Notes,
    Frets,
    Octaves,
}

export interface FretRangeOptions {
    range: NumberRangeLike;
}

export interface OctaveRangeOptions {
    range: NumberRangeLike;
}

export interface NoteRangeOptions {
    range: NumberRangeLike;
}

export enum PracticeType {
    Generated,
    Composed,
}

export class Beat {
    readonly notes: number[];
}

export interface PracticeSettings {
    name: string;
    practiceType: PracticeType;
    targetBPM: number;
    scale: {
        setName: string,
        baseNote: string
    },
    chordRatio: number,
    requireOctave: boolean,
    minSuccessVelocity: number,
    noteRangeType: NoteRangeType,
    fretRange: NumberRangeLike,
    octaveRange: NumberRangeLike,
    noteRange: NumberRangeLike,
    promptCount: number,
}

export type PracticeSettingsKeys = (keyof PracticeSettings)[];

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

export interface RoutinePart {
    name: string;
    prompts: Prompt[];
}

export enum ParentType {
    Settings,
    Previous,
    First,
}

export type NullablePracticeSettings = {
    [K in keyof PracticeSettings]: PracticeSettings[K] | null;
}

interface BaseRoutineSettings {
    repeatCount: number;
    cloneRepeat: boolean;
    parentSettings: ParentType;
}

export interface RoutinePartSettings extends BaseRoutineSettings, NullablePracticeSettings {}

export interface BakeRoutineSettings extends BaseRoutineSettings, PracticeSettings {}

export interface RoutineSettings {
    id: string;
    appVersion: string;
    schemaVersion: string;
    name: string;
    parts: RoutinePartSettings[];
}

export interface Routine {
    parts: RoutinePart[];
}
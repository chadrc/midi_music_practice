import {NumberRangeLike} from "../common/NumberRange";

export enum NoteRangeType {
    Notes,
    Frets,
    Octaves,
}

export enum PracticeType {
    Generated,
    Composed,
}

export interface UserRoutinePartSettings {
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

export type UserRoutineSettingsKeys = (keyof UserRoutinePartSettings)[];

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

export enum ParentType {
    Settings,
    Previous,
    First,
}

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

export interface RoutinePart {
    name: string;
    prompts: Prompt[];
}

export interface Routine {
    parts: RoutinePart[];
}
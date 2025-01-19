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

export class FixedPractice {
    readonly beats: Beat[];
}

export class Beat {
    readonly notes: number[];
}

export interface PracticeSettings {
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
    noteCount: number,
    fixed: FixedPractice | null,
    promptCount: number,
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

export interface RoutinePart {
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

export interface RoutinePartSettings extends NullablePracticeSettings {
    repeatCount: number;
    cloneRepeat: boolean;
    parentSettings: ParentType;
}

export interface RoutineSettings {
    parts: RoutinePartSettings[];
}
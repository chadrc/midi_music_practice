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
    Chords,
    Scales,
    Fixed,
}

export class FixedPractice {
    readonly beats: Beat[];
}

export class Beat {
    readonly notes: number[];
}

export interface PracticeSettings {
    practiceType: PracticeType;
    scale: {
        setName: string,
        baseNote: string
    },
    chordRatio: number,
    requireOctave: boolean,
    minSuccessVelocity: number,
    noteRangeType: NoteRangeType,
    fretRangeOptions: FretRangeOptions,
    octaveRangeOptions: OctaveRangeOptions,
    noteRangeOptions: NoteRangeOptions,
    noteCount: number,
    fixed: FixedPractice | null,
    promptCount: number,
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
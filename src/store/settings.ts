import {defineStore} from "pinia";
import {BaseNotes, CHROMATIC_SCALE_SET_NAME, SCALES} from "../notes/scales";
import {NumberRangeLike} from "../common/NumberRange";
import {RNBOParameter} from "./types";
import {MAX_MIDI_NOTES} from "../routine";

interface NoteGridSettings {
    formatted: boolean;
}

interface AudioSettings {
    instrumentAudioEnabled: boolean,
    autoReceiveInstruments: string[]
}

interface InstrumentData {
    name: string,
    parameterData: { [key: string]: RNBOParameter }
}

interface InstrumentSettings {
    volume: number,
    instrumentData: InstrumentData[]
}

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

class FixedPractice {
    readonly beats: Beat[];
}

class Beat {
    readonly notes: number[];
}

interface PracticeSettings {
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

type NullablePracticeSettings = {
    [K in keyof PracticeSettings]: PracticeSettings[K] | null;
}

export interface RoutinePartSettings extends NullablePracticeSettings {
    repeatCount: number;
    parentSettings: ParentType;
}

interface SettingsStore {
    noteGrid: NoteGridSettings;
    audio: AudioSettings;
    instruments: InstrumentSettings;
    practice: PracticeSettings;
}

export const useSettingsStore = defineStore('settings', {
    state: (): SettingsStore => {
        const defaultNoteGrid: NoteGridSettings = {
            formatted: false
        }

        const defaultAudio: AudioSettings = {
            instrumentAudioEnabled: false,
            autoReceiveInstruments: []
        }

        const defaultInstrument: InstrumentSettings = {
            volume: .5,
            instrumentData: []
        }

        const defaultPractice: PracticeSettings = {
            practiceType: PracticeType.Scales,
            scale: {
                setName: CHROMATIC_SCALE_SET_NAME,
                baseNote: BaseNotes[BaseNotes.C],
            },
            chordRatio: 0,
            requireOctave: true,
            minSuccessVelocity: 100,
            noteRangeType: NoteRangeType.Notes,
            fretRangeOptions: {
                range: {
                    start: 0,
                    end: 4,
                }
            },
            octaveRangeOptions: {
                range: {
                    start: 4,
                    end: 6,
                }
            },
            noteRangeOptions: {
                range: {
                    start: 0,
                    end: MAX_MIDI_NOTES,
                }
            },
            noteCount: 0,
            fixed: null,
            promptCount: 8,
        }

        if (localStorage.getItem('settings')) {
            const stored = JSON.parse(localStorage.getItem('settings'))

            return {
                noteGrid: Object.assign(defaultNoteGrid, stored.noteGrid),
                audio: Object.assign(defaultAudio, stored.audio),
                instruments: Object.assign(defaultInstrument, stored.instruments),
                practice: Object.assign(defaultPractice, stored.practice)
            }
        }

        return {
            noteGrid: defaultNoteGrid,
            audio: defaultAudio,
            instruments: defaultInstrument,
            practice: defaultPractice,
        }
    },
    getters: {
        noteScale: (state) => SCALES[state.practice.scale.setName][state.practice.scale.baseNote],
        currentRange: (state) => {
            switch (state.practice.noteRangeType) {
                case NoteRangeType.Notes:
                    return state.practice.noteRangeOptions.range;
                case NoteRangeType.Frets:
                    return state.practice.fretRangeOptions.range;
                case NoteRangeType.Octaves:
                    return state.practice.octaveRangeOptions.range;
            }
        },
        chordRatioMax: (state) => state.practice.promptCount
    },
    actions: {
        toggleAutoReceiveInstrument(deviceId: string) {
            const index = this.audio.autoReceiveInstruments
                .findIndex((id: string) => id === deviceId)

            if (index === -1) {
                this.audio.autoReceiveInstruments.push(deviceId)
            } else {
                this.audio.autoReceiveInstruments.splice(index, 1)
            }
        },
        saveInstrumentData(data: InstrumentData) {
            const existing = this.instruments.instrumentData
                .findIndex((instrument: InstrumentData) => instrument.name === data.name)

            if (existing > -1) {
                this.instruments.instrumentData[existing] = data
            } else {
                this.instruments.instrumentData.push(data)
            }
        }
    },
})
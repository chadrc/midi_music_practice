import {defineStore} from "pinia";
import {BaseNotes, CHROMATIC_SCALE_SET_NAME, SCALES} from "../notes/scales";

interface NoteGridSettings {
    formatted: boolean;
}

interface AudioSettings {
    instrumentAudioEnabled: boolean,
    autoReceiveInstruments: string[]
}

interface InstrumentData {
    name: string,
    parameterData: { [key: string]: any }
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
    startFret: number;
    endFret: number;
}

export interface OctaveRangeOptions {
    startOctave: number;
    endOctave: number;
}

export interface NoteRangeOptions {
    startNote: number;
    endNote: number;
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
    requireOctave: boolean,
    minSuccessVelocity: number,
    noteRangeType: NoteRangeType,
    fretRangeOptions: FretRangeOptions,
    octaveRangeOptions: OctaveRangeOptions,
    noteRangeOptions: NoteRangeOptions,
    noteCount: number,
    fixed: FixedPractice | null
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
    practiceSettings: PracticeSettings;
}

export const useSettingsStore = defineStore('settings', {
    state: (): SettingsStore => {
        let defaultNoteGrid: NoteGridSettings = {
            formatted: false
        }

        let defaultAudio: AudioSettings = {
            instrumentAudioEnabled: false,
            autoReceiveInstruments: []
        }

        let defaultInstrument: InstrumentSettings = {
            volume: .5,
            instrumentData: []
        }

        let defaultPractice: PracticeSettings = {
            practiceType: PracticeType.Scales,
            scale: {
                setName: CHROMATIC_SCALE_SET_NAME,
                baseNote: BaseNotes[BaseNotes.C],
            },
            requireOctave: true,
            minSuccessVelocity: 100,
            noteRangeType: NoteRangeType.Notes,
            fretRangeOptions: {
                startFret: 0,
                endFret: 4,
            },
            octaveRangeOptions: {
                startOctave: 4,
                endOctave: 6,
            },
            noteRangeOptions: {
                startNote: 0,
                endNote: 127,
            },
            noteCount: 0,
            fixed: null,
        }

        if (localStorage.getItem('settings')) {
            let stored = JSON.parse(localStorage.getItem('settings'))

            return {
                noteGrid: Object.assign(defaultNoteGrid, stored.noteGrid),
                audio: Object.assign(defaultAudio, stored.audio),
                instruments: Object.assign(defaultInstrument, stored.instruments),
                practiceSettings: Object.assign(defaultPractice, stored.practiceSettings)
            }
        }

        return {
            noteGrid: defaultNoteGrid,
            audio: defaultAudio,
            instruments: defaultInstrument,
            practiceSettings: defaultPractice,
        }
    },
    getters: {
        noteScale: (state) => SCALES[state.practiceSettings.scale.setName][state.practiceSettings.scale.baseNote],
    },
    actions: {
        toggleAutoReceiveInstrument(deviceId: string) {
            let index = this.audio.autoReceiveInstruments
                .findIndex((id: string) => id === deviceId)

            if (index === -1) {
                this.audio.autoReceiveInstruments.push(deviceId)
            } else {
                this.audio.autoReceiveInstruments.splice(index, 1)
            }
        },
        saveInstrumentData(data: InstrumentData) {
            let existing = this.instruments.instrumentData
                .findIndex((instrument: InstrumentData) => instrument.name === data.name)

            if (existing > -1) {
                this.instruments.instrumentData[existing] = data
            } else {
                this.instruments.instrumentData.push(data)
            }
        }
    },
})
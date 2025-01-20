import {defineStore} from "pinia";
import {BaseNotes, CHROMATIC_SCALE_SET_NAME, SCALES} from "../notes/scales";
import {RNBOParameter} from "./types";
import {MAX_MIDI_NOTES, STANDARD_TUNING_OPEN_FRET_NOTES} from "../routine";
import {UserRoutinePartSettings, PracticeType, NoteRangeType} from "../routine/types";
import {NumberRangeLike} from "../common/NumberRange";

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

interface PracticeSettings {
    selectedRoutine: string;
}

interface SettingsStore {
    noteGrid: NoteGridSettings;
    audio: AudioSettings;
    instruments: InstrumentSettings;
    userRoutine: UserRoutinePartSettings;
    practice: PracticeSettings;
}

export const NONE_VALUE = "none";

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

        const defaultUserRoutine: UserRoutinePartSettings = {
            name: "",
            seed: null,
            practiceType: PracticeType.Generated,
            targetBPM: 120,
            scale: {
                setName: CHROMATIC_SCALE_SET_NAME,
                baseNote: BaseNotes[BaseNotes.C],
            },
            chordRatio: 0,
            requireOctave: true,
            minSuccessVelocity: 100,
            noteRangeType: NoteRangeType.Notes,
            fretRange: {
                start: 0,
                end: 4,
            },
            octaveRange: {
                start: 4,
                end: 6,
            },
            noteRange: {
                start: 0,
                end: MAX_MIDI_NOTES,
            },
            promptCount: 8,
        }

        const defaultPractice: PracticeSettings = {
            selectedRoutine: NONE_VALUE,
        }

        if (localStorage.getItem('settings')) {
            const stored = JSON.parse(localStorage.getItem('settings'))

            return {
                noteGrid: Object.assign(defaultNoteGrid, stored.noteGrid),
                audio: Object.assign(defaultAudio, stored.audio),
                instruments: Object.assign(defaultInstrument, stored.instruments),
                userRoutine: Object.assign(defaultUserRoutine, stored.practice),
                practice: Object.assign(defaultPractice, stored.practice),
            }
        }

        return {
            noteGrid: defaultNoteGrid,
            audio: defaultAudio,
            instruments: defaultInstrument,
            userRoutine: defaultUserRoutine,
            practice: defaultPractice,
        }
    },
    getters: {
        noteScale(state) {
            return SCALES[state.userRoutine.scale.setName][state.userRoutine.scale.baseNote];
        },
        currentRange (state): NumberRangeLike {
            switch (state.userRoutine.noteRangeType) {
                case NoteRangeType.Notes:
                    return state.userRoutine.noteRange;
                case NoteRangeType.Frets:
                    return state.userRoutine.fretRange;
                case NoteRangeType.Octaves:
                    return state.userRoutine.octaveRange;
            }
        },
        chordRatioMax(state) {
            return state.userRoutine.promptCount;
        },
        selectedNotes(state): number[] {
            const notes = []
            const {start, end} = this.currentRange;

            switch (state.userRoutine.noteRangeType) {
                case NoteRangeType.Notes:
                    for (let i = start; i <= end; i++) {
                        notes.push(i)
                    }
                    break;
                case NoteRangeType.Frets:
                    for (const note in STANDARD_TUNING_OPEN_FRET_NOTES) {
                        for (let i = start; i <= end; i++) {
                            notes.push(STANDARD_TUNING_OPEN_FRET_NOTES[note] + i)
                        }
                    }
                    break;
                case NoteRangeType.Octaves: {
                    const startingC = start * 12
                    const noteCount = (end - start) * 12;
                    const lastNote = startingC + noteCount;

                    for (let i = startingC; i <= lastNote; i++) {
                        notes.push(i)
                    }
                    break;
                }
            }

            return notes
        },
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
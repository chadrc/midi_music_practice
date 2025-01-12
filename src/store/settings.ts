import {defineStore} from "pinia";

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

interface SettingsStore {
    noteGrid: NoteGridSettings;
    audio: AudioSettings;
    instruments: InstrumentSettings;
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

        if (localStorage.getItem('settings')) {
            let stored = JSON.parse(localStorage.getItem('settings'))

            return {
                noteGrid: Object.assign(defaultNoteGrid, stored.noteGrid),
                audio: Object.assign(defaultAudio, stored.audio),
                instruments: Object.assign(defaultInstrument, stored.instruments)
            }
        }

        return {
            noteGrid: defaultNoteGrid,
            audio: defaultAudio,
            instruments: defaultInstrument,
        }
    },
    getters: {},
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
import {defineStore} from "pinia";

interface NoteGridSettings {
    formatted: boolean;
}

interface AudioSettings {
    instrumentAudioEnabled: boolean,
    autoReceiveInstruments: string[]
}

interface SettingsStore {
    noteGrid: NoteGridSettings;
    audio: AudioSettings;
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

        if (localStorage.getItem('settings')) {
            let stored = JSON.parse(localStorage.getItem('settings'))

            return {
                noteGrid: Object.assign(defaultNoteGrid, stored.noteGrid),
                audio: Object.assign(defaultAudio, stored.audio)
            }
        }

        return {
            noteGrid: defaultNoteGrid,
            audio: defaultAudio
        }
    },
    getters: {}
})
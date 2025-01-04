import {defineStore} from "pinia";

interface NoteGridSettings {
    formatted: boolean;
}

interface AudioSettings {
    instrumentAudioEnabled: boolean,
}

interface SettingsStore {
    noteGrid: NoteGridSettings;
    audio: AudioSettings;
}

export const useSettingsStore = defineStore('settings', {
    state: (): SettingsStore => {
        if (localStorage.getItem('settings')) {
            return JSON.parse(localStorage.getItem('settings'))
        }

        return({
            noteGrid: {
                formatted: false
            },
            audio: {
                instrumentAudioEnabled: false
            }
        })
    },
    getters: {

    }
})
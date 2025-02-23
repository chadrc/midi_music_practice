import {defineStore} from "pinia";
import {useMidiStore} from "./midi";

export const useEarTrainingView = defineStore('midi', () => {
    const midiStore = useMidiStore();

    function playSound() {

    }

    return {
        playSound
    }
})
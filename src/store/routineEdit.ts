import {defineStore} from "pinia";
import {ref} from "vue";
import {ParentType, RoutinePartSettings, RoutineSettings} from "../routine/types";
import {useGlobalStore} from "./globals";

const ROUTINE_SCHEMA_VERSION = "0.0.1";

function makeDefaultRoutinePartSettings(): RoutinePartSettings {
    return {
        name: "",
        parentSettings: ParentType.Settings,
        repeatCount: 1,
        cloneRepeat: false,
        practiceType: null,
        targetBPM: null,
        scale: null,
        chordRatio: null,
        requireOctave: null,
        minSuccessVelocity: null,
        noteRangeType: null,
        fretRange: null,
        octaveRange: null,
        noteRange: null,
        promptCount: null,
    }
}

export const useRoutineEditStore = defineStore('routineEdit', () => {
    const globalStore = useGlobalStore();

    const currentEdit = ref<RoutineSettings>({
        appVersion: globalStore.appVersion,
        schemaVersion: ROUTINE_SCHEMA_VERSION,
        name: "",
        parts: [
            makeDefaultRoutinePartSettings()
        ],
    });

    function addNewPart() {
        currentEdit.value.parts.push(makeDefaultRoutinePartSettings());
    }

    return {
        currentEdit,
        addNewPart,
    }
})
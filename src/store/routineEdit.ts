import {defineStore} from "pinia";
import {ref} from "vue";
import {ParentType, RoutinePartSettings, RoutineSettings} from "../routine/types";
import {useGlobalStore} from "./globals";
import {exists} from "../utilities";

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

const ROUTINES_LOCAL_STORAGE_KEY = "routines";

export const useRoutineEditStore = defineStore('routineEdit', () => {
    const globalStore = useGlobalStore();

    const currentEdit = ref<RoutineSettings>({
        appVersion: "[unset]",
        schemaVersion: ROUTINE_SCHEMA_VERSION,
        name: "",
        parts: [
            makeDefaultRoutinePartSettings()
        ],
    });

    function addNewPart() {
        currentEdit.value.parts.push(makeDefaultRoutinePartSettings());
    }

    function saveRoutine() {
        const stored = localStorage.getItem(ROUTINES_LOCAL_STORAGE_KEY);
        let routines = null;
        if (exists(stored)) {
            routines = JSON.parse(stored);
        } else {
            routines = [];
        }

        currentEdit.value.appVersion = globalStore.appVersion;
        routines.push(currentEdit.value);

        localStorage.setItem(ROUTINES_LOCAL_STORAGE_KEY, JSON.stringify(routines));
    }

    return {
        currentEdit,
        addNewPart,
        saveRoutine,
    }
})
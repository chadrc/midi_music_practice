import {defineStore} from "pinia";
import {computed, ref} from "vue";
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

export const useRoutineStore = defineStore('routineEdit', () => {
    const globalStore = useGlobalStore();

    const routines = ref<RoutineSettings[]>(getSavedRoutines());
    const currentRoutine = ref<string | null>(null);
    if (routines.value.length > 0) {
        currentRoutine.value = routines.value[0].id
    }

    const currentEdit = computed<RoutineSettings | null>(() =>
        routines.value.find((routine) => routine.id == currentRoutine.value) || null
    )

    const savedRoutines = computed(() => {
        const saved = getSavedRoutines();
        return routines.value.filter((routine) => exists(saved.find((s) => routine.id === s.id)));
    });

    function createRoutine() {
        const routine = {
            id: window.crypto.randomUUID(),
            appVersion: "[unset]",
            schemaVersion: ROUTINE_SCHEMA_VERSION,
            name: "",
            parts: [
                makeDefaultRoutinePartSettings()
            ],
        };

        currentRoutine.value = routine.id;
        routines.value.push(routine);
    }

    function addNewPart() {
        currentEdit.value.parts.push(makeDefaultRoutinePartSettings());
    }

    function saveRoutine() {
        const routines = getSavedRoutines();
        const existing = routines.findIndex((routine) => routine.id == currentRoutine.value);

        currentEdit.value.appVersion = globalStore.appVersion;

        if (existing === -1) {
            routines.push(currentEdit.value);
        } else {
            routines.splice(existing, 1, currentEdit.value);
        }

        localStorage.setItem(ROUTINES_LOCAL_STORAGE_KEY, JSON.stringify(routines));
    }

    function deleteRoutine(id: string) {
        const inMem = routines.value.findIndex((routine) => routine.id == id);
        routines.value.splice(inMem, 1);

        const saved = getSavedRoutines();
        const inSaved = saved.findIndex((routine) => routine.id == id);
        saved.splice(inSaved, 1);

        localStorage.setItem(ROUTINES_LOCAL_STORAGE_KEY, JSON.stringify(saved));
    }

    function getSavedRoutines(): RoutineSettings[] {
        const stored = localStorage.getItem(ROUTINES_LOCAL_STORAGE_KEY);
        if (exists(stored)) {
            try {
                return JSON.parse(stored);
            } catch (error) {
                const uuid = window.crypto.randomUUID()
                const errorKey = `error-${uuid}`
                console.error(`Failed to parse routines from localStorage. Saving found data to '' and resetting routines.`);
                console.error(error);

                localStorage.setItem(errorKey, stored);
                localStorage.setItem(ROUTINES_LOCAL_STORAGE_KEY, "[]");
                return [];
            }
        } else {
            return [];
        }
    }

    return {
        routines,
        currentRoutine,
        currentEdit,
        savedRoutines,
        createRoutine,
        addNewPart,
        saveRoutine,
        deleteRoutine,
    }
})
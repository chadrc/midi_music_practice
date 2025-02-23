import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {ParentType, RoutinePartSettings, RoutineSettings} from "../routine/types";
import {useGlobalStore} from "./globals";
import {exists} from "../utilities";
import {NONE_VALUE, useSettingsStore} from "./settings";

const ROUTINE_SCHEMA_VERSION = "0.0.1";

function makeDefaultRoutinePartSettings(): RoutinePartSettings {
    return {
        name: "",
        seed: null,
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
    const settingsStore = useSettingsStore();

    const routines = ref<RoutineSettings[]>(getSavedRoutines());
    const selectedStep = ref(1);
    const currentRoutine = computed(() => settingsStore.practice.selectedRoutine);

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

        settingsStore.practice.selectedRoutine = routine.id;
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
        if (inMem !== -1) {
            routines.value.splice(inMem, 1);
            settingsStore.practice.selectedRoutine = NONE_VALUE;
        }

        const saved = getSavedRoutines();
        const inSaved = saved.findIndex((routine) => routine.id == id);
        if (inSaved !== -1) {
            saved.splice(inSaved, 1);
            localStorage.setItem(ROUTINES_LOCAL_STORAGE_KEY, JSON.stringify(saved));
        }
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

    function removeStep(index: number) {
        if (index >= 0 && index < currentEdit.value.parts.length) {
            currentEdit.value.parts.splice(index, 1);
            selectedStep.value = 1;
        }
    }

    function onStepUpdate(value: number) {
        if (value >= currentEdit.value.parts.length + 1) {
            addNewPart();
        }
        selectedStep.value = value;
    }

    return {
        selectedStep,
        routines,
        currentRoutine,
        currentEdit,
        savedRoutines,
        createRoutine,
        saveRoutine,
        deleteRoutine,
        removeStep,
        onStepUpdate
    }
})
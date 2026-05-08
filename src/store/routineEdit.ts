import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {defaultPracticeForType} from "../routine";
import {ParentType, PracticeType, type RoutinePartSettings, type RoutineSettings} from "../routine/types";
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
        targetBPM: null,
        noteRange: null,
        practice: defaultPracticeForType(PracticeType.Notes),
        requireOctave: null,
        minSuccessVelocity: null,
        promptCount: null,
        freePlayInSet: null,
        maxConsecutiveSamePitchSuccess: null,
    }
}

function normalizeRoutinesFromStorage(list: RoutineSettings[]): void {
    for (const routine of list) {
        if (!Array.isArray(routine.parts)) {
            continue;
        }
        for (const part of routine.parts) {
            if (part.practice == null) {
                part.practice = defaultPracticeForType(PracticeType.Notes);
            }
        }
    }
}

const ROUTINES_LOCAL_STORAGE_KEY = "routines";

export const useRoutineStore = defineStore('routineEdit', () => {
    const globalStore = useGlobalStore();
    const settingsStore = useSettingsStore();

    const routines = ref<RoutineSettings[]>(getSavedRoutines());
    const selectedPartIndex = ref(0);
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
        selectedPartIndex.value = 0;
    }

    function addNewPart() {
        currentEdit.value!.parts.push(makeDefaultRoutinePartSettings());
    }

    function addPartAndSelect() {
        addNewPart();
        selectedPartIndex.value = currentEdit.value!.parts.length - 1;
    }

    function selectPart(index: number) {
        const n = currentEdit.value?.parts.length ?? 0;
        if (index >= 0 && index < n) {
            selectedPartIndex.value = index;
        }
    }

    /**
     * Reorder parts. `toIndex` is the index the part should occupy after the move (0 … length, where `length` means after the last item).
     */
    function movePart(fromIndex: number, toIndex: number) {
        const parts = currentEdit.value!.parts;
        if (fromIndex === toIndex) {
            return;
        }
        if (fromIndex < 0 || fromIndex >= parts.length || toIndex < 0 || toIndex > parts.length) {
            return;
        }
        const selectedPart = parts[selectedPartIndex.value];
        const [item] = parts.splice(fromIndex, 1);
        parts.splice(toIndex, 0, item);
        selectedPartIndex.value = parts.indexOf(selectedPart);
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
                const parsed = JSON.parse(stored) as RoutineSettings[];
                normalizeRoutinesFromStorage(parsed);
                return parsed;
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
        const parts = currentEdit.value!.parts;
        if (parts.length <= 1) {
            return;
        }
        if (index < 0 || index >= parts.length) {
            return;
        }
        const sel = selectedPartIndex.value;
        parts.splice(index, 1);
        if (index === sel) {
            selectedPartIndex.value = Math.min(index, parts.length - 1);
        } else if (index < sel) {
            selectedPartIndex.value = sel - 1;
        }
    }

    return {
        selectedPartIndex,
        routines,
        currentRoutine,
        currentEdit,
        savedRoutines,
        createRoutine,
        saveRoutine,
        deleteRoutine,
        removeStep,
        addPartAndSelect,
        selectPart,
        movePart,
    }
})
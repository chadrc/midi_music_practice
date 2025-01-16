import {defineStore} from "pinia";
import {useMidiStore} from "./midi";
import {computed, ref} from "vue";
import {formatMidiLetter} from "../notes";
import {NoteRangeType, ParentType, useSettingsStore} from "./settings";
import {generateRoutineSet, Prompt, RoutinePart, STANDARD_TUNING_OPEN_FRET_NOTES} from "../routine";
import {exists} from "../utilities";
import {ac} from "vitest/dist/chunks/reporters.D7Jzd9GS";

// CCS color variables for PrimeVue theme
const colorOptions = [
    "emerald",
    "green",
    "lime",
    "red",
    "orange",
    "amber",
    "yellow",
    "teal",
    "cyan",
    "sky",
    "blue",
    "indigo",
    "violet",
    "purple",
    "fuchsia",
    "pink",
    "rose",
    "slate"
]

export interface PromptData {
    success: boolean;
    current: boolean;
    prompt: Prompt;
}

export const usePracticeStore = defineStore('practice', () => {
    const midiStore = useMidiStore();
    const settingsStore = useSettingsStore();

    const startTime = ref(0);
    const practiceSessionTimer = ref(null);
    const practiceSessionTime = ref(0);
    const successCount = ref(0);
    const practicing = ref(false);
    const midiListenerUnsubscribe = ref(null);

    const routine = ref<RoutinePart | null>(null);
    const activePrompts = ref<PromptData[]>([]);
    const currentPrompt = ref(0);

    const selectedNotes = computed(() => {
        let notes = []
        let {start, end} = settingsStore.currentRange;

        switch (settingsStore.practice.noteRangeType) {
            case NoteRangeType.Notes:
                for (let i = start; i <= end; i++) {
                    notes.push(i)
                }
                break;
            case NoteRangeType.Frets:
                for (let note in STANDARD_TUNING_OPEN_FRET_NOTES) {
                    for (let i = start; i <= end; i++) {
                        notes.push(STANDARD_TUNING_OPEN_FRET_NOTES[note] + i)
                    }
                }
                break;
            case NoteRangeType.Octaves:
                let startingC = start * 12
                let noteCount = (end - start) * 12;
                let lastNote = startingC + noteCount;

                for (let i = startingC; i <= lastNote; i++) {
                    notes.push(i)
                }
                break;
        }

        return notes
    })

    function generatePrompts() {
        routine.value = generateRoutineSet({
            repeatCount: 1,
            parentSettings: ParentType.Settings,
            ...settingsStore.practice
        })
    }

    function refreshActivePrompts() {
        activePrompts.value = [];
        currentPrompt.value = 0;

        for (let prompt of routine.value.prompts) {
            activePrompts.value.push({
                success: false,
                current: false,
                prompt: prompt,
            })
        }

        if (activePrompts.value.length > 0) {
            activePrompts.value[0].current = true;
        }
    }

    function start() {
        generatePrompts();

        practicing.value = true;
        successCount.value = 0;

        refreshActivePrompts();

        practiceSessionTimer.value = window.setInterval(() => {
            practiceSessionTime.value += 1
        }, 1000);

        midiListenerUnsubscribe.value = midiStore.$onAction(
            ({name, args}) => {
                if (name === 'midiNoteOn') {
                    let noteArgs = args as [number, number, number]
                    if (noteArgs[1] < settingsStore.practice.minSuccessVelocity) return;

                    let activePrompt = activePrompts.value[currentPrompt.value]

                    let success = exists(activePrompt.prompt.notes.find((n) => n === noteArgs[0]))

                    if (success) {
                        successCount.value += 1
                        activePrompt.success = true;
                        activePrompt.current = false;

                        currentPrompt.value += 1
                        if (currentPrompt.value >= activePrompts.value.length) {
                            currentPrompt.value = 0
                            refreshActivePrompts()
                        }

                        activePrompts.value[currentPrompt.value].current = true;
                    }
                } else if (name === 'midiNoteOff') {
                    // console.log('listen off')
                }
            }
        )
    }

    function stop() {
        window.clearInterval(practiceSessionTimer.value)
        midiListenerUnsubscribe.value()
        activePrompts.value = []
        routine.value = null;
        practicing.value = false;
    }

    return {
        routine,
        startTime,
        practiceSessionTimer,
        practiceSessionTime,
        selectedNotes,
        activePrompts,
        currentPrompt,
        successCount,
        practicing,
        start,
        stop,
    }
})

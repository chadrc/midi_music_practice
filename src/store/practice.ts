import {defineStore} from "pinia";
import {MIDIInstruction, PracticeMIDIData, useMidiStore} from "./midi";
import {computed, ref} from "vue";
import {NoteRangeType, ParentType, useSettingsStore} from "./settings";
import {generateRoutineSet, Prompt, RoutinePart, STANDARD_TUNING_OPEN_FRET_NOTES} from "../routine";
import {exists} from "../utilities";
import {filter, Subscription} from "rxjs";
import {ac} from "vitest/dist/chunks/reporters.D7Jzd9GS";
import {formatMidiNote} from "../notes";

const SECONDS_IN_MINUTE = 60;

export interface PromptData {
    success: boolean;
    current: boolean;
    prompt: Prompt;
}

export interface PracticeAttempt {
    time: number;
    data: PracticeMIDIData;
}

export const usePracticeStore = defineStore('practice', () => {
    const midiStore = useMidiStore();
    const settingsStore = useSettingsStore();

    const startTime = ref(0);
    const practiceSessionTimer = ref(null);
    const practiceSessionTime = ref(0);
    const successCount = ref(0);
    const practicing = ref(false);
    const midiSubscription = ref<Subscription>(null);

    const routine = ref<RoutinePart | null>(null);
    const activePrompts = ref<PromptData[]>([]);
    const currentPrompt = ref(0);
    const bpm = ref(120);

    const attempts = ref<PracticeAttempt[]>([]);

    const selectedNotes = computed(() => {
        const notes = []
        const {start, end} = settingsStore.currentRange;

        switch (settingsStore.practice.noteRangeType) {
            case NoteRangeType.Notes:
                for (let i = start; i <= end; i++) {
                    notes.push(i)
                }
                break;
            case NoteRangeType.Frets:
                for (const note in STANDARD_TUNING_OPEN_FRET_NOTES) {
                    for (let i = start; i <= end; i++) {
                        notes.push(STANDARD_TUNING_OPEN_FRET_NOTES[note] + i)
                    }
                }
                break;
            case NoteRangeType.Octaves: {
                const startingC = start * 12
                const noteCount = (end - start) * 12;
                const lastNote = startingC + noteCount;

                for (let i = startingC; i <= lastNote; i++) {
                    notes.push(i)
                }
                break;
            }
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

        for (const prompt of routine.value.prompts) {
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

        midiSubscription.value = midiStore.midiEventSubject
            .pipe(filter((v) => v.instruction === MIDIInstruction.NoteOn))
            .subscribe({
                next: (data) => {
                    const now = Date.now();
                    const frameTime = now - 50;

                    attempts.value.push({
                        time: now,
                        data
                    });

                    const activePrompt = activePrompts.value[currentPrompt.value];

                    let success = true;
                    for (const note of activePrompt.prompt.notes) {
                        const notesInFrame = attempts.value
                            .toReversed()
                            .filter((a) => a.time > frameTime);

                        if (!exists(notesInFrame.find(({data: {data1, data2}}) =>
                            data1 === note && data2 >= settingsStore.practice.minSuccessVelocity
                        ))) {
                            success = false;
                        }
                    }

                    // if (data2 < settingsStore.practice.minSuccessVelocity) return;
                    // const success = exists(activePrompt.prompt.notes.find((n) => n === data1))

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
                },
            });
    }

    function stop() {
        window.clearInterval(practiceSessionTimer.value)
        midiSubscription.value.unsubscribe()
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
        bpm,
        start,
        stop,
    }
})

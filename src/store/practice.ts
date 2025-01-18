import {defineStore} from "pinia";
import {MIDIInstruction, PracticeMIDIData, useMidiStore} from "./midi";
import {computed, ref} from "vue";
import {NoteRangeType, ParentType, useSettingsStore} from "./settings";
import {generateRoutineSet, Prompt, RoutinePart, STANDARD_TUNING_OPEN_FRET_NOTES} from "../routine";
import {clone, exists} from "../utilities";
import {filter, Subscription} from "rxjs";
import {ac} from "vitest/dist/chunks/reporters.D7Jzd9GS";
import {formatMidiNote} from "../notes";

const SECONDS_IN_MINUTE = 60;

export interface PromptData {
    success: boolean;
    current: boolean;
    prompt: Prompt;
    successTime: number | null;
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
    const bpm = ref(60);

    const successes = ref<PromptData[]>([]);
    const attempts = ref<PracticeAttempt[]>([]);

    const firstNoteTime = computed(() => {
        if (successes.value.length > 0) {
            return successes.value[0].successTime;
        }

        return Date.now();
    });

    const notesPerMinute = computed(() => {
        const dif = Date.now() - firstNoteTime.value;
        if (dif <= 0) {
            return 0;
        }

        const frame = Date.now() - 60000;
        const successesWithinFrame = successes.value
            .toReversed()
            .filter((d) => d.successTime > frame && d.success);

        if (dif < 60000) {
            const ratio = 60000 / dif;
            return successesWithinFrame.length * ratio;
        } else {
            return successesWithinFrame.length;
        }
    });

    const playRate = computed(() => notesPerMinute.value / bpm.value);

    const playRateDisplay = computed(() => {
        const p = playRate.value;

        if (p >= 48) {
            return "1/256"; // 64
        } else if (p >= 24) {
            return "1/128"; // 32
        } else if (p >= 12) {
            return "1/64"; // 16
        } else if (p >= 6) {
            return "1/32"; // 8
        } else if (p >= 3) {
            return "1/16"; // 4
        } else if (p >= 1.5) {
            return "1/8" // 2
        } else if (p >= .75) {
            return "1/4" // 1
        } else if (p >= .375) {
            return "1/2" // .5
        } else if (p >= .1875) {
            return "1" // .25
        } else if (p >= .09375) {
            return "2" // .125
        }
    })

    // const notesPerMinute = computed(() => notesPerSeconds.value * 15);

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
                successTime: null,
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
                        activePrompt.successTime = now;
                        activePrompt.current = false;

                        successes.value.push(clone(activePrompt));

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
        attempts.value = [];
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
        playRateDisplay,
        start,
        stop,
    }
})

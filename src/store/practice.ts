import {defineStore} from "pinia";
import {MIDIInstruction, PracticeMIDIData, useMidiStore} from "./midi";
import {computed, ref} from "vue";
import {useSettingsStore} from "./settings";
import {generateRoutine, generateRoutineSet} from "../routine";
import {clone, exists} from "../utilities";
import {filter, Subscription} from "rxjs";
import {ParentType, Prompt, Routine} from "../routine/types";
import {useRoutineStore} from "./routineEdit";

const MILISECONDS_IN_MINUTE = 60000;

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
    const routineStore = useRoutineStore();

    const startTime = ref(0);
    const practiceSessionTimer = ref(null);
    const practiceSessionTime = ref(0);
    const successCount = ref(0);
    const practicing = ref(false);
    const midiSubscription = ref<Subscription>(null);

    const routine = ref<Routine | null>(null);
    const activePrompts = ref<PromptData[]>([]);

    const currentRepetition = ref(0);
    const currentPart = ref(0);
    const currentPrompt = ref(0);
    const complete = ref(false);

    const successes = ref<PromptData[]>([]);
    const attempts = ref<PracticeAttempt[]>([]);

    const currentRoutinePart = computed(() => {
        if (!exists(routine.value)) {
            return null;
        }

        if (currentPart.value >= 0 && currentPart.value < routine.value.parts.length) {
            return routine.value.parts[currentPart.value];
        }

        return null;
    });

    const targetRepetitions = computed(() => {
        const part = currentRoutinePart.value;
        if (exists(part)) {
            return part.repetitions.length;
        }

        return 0;
    })

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

        const frame = Date.now() - MILISECONDS_IN_MINUTE;
        const successesWithinFrame = successes.value
            .toReversed()
            .filter((d) => d.successTime > frame && d.success);

        if (dif < MILISECONDS_IN_MINUTE) {
            const ratio = MILISECONDS_IN_MINUTE / dif;
            return successesWithinFrame.length * ratio;
        } else {
            return successesWithinFrame.length;
        }
    });

    const playRate = computed(() => notesPerMinute.value / settingsStore.userRoutine.targetBPM);

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

        return "-"
    });

    function generatePrompts() {
        const routineSettings = routineStore.routines.find(
            (r) => r.id === settingsStore.practice.selectedRoutine
        );

        if (exists(routineSettings)) {
            routine.value = generateRoutine(
                routineSettings,
                settingsStore.userRoutine,
            )
        } else {
            routine.value = generateRoutine(
                {
                    name: "",
                    id: "",
                    appVersion: "",
                    schemaVersion: "",
                    parts: [
                        {
                            name: "",
                            repeatCount: 0,
                            cloneRepeat: false,
                            parentSettings: ParentType.Settings,
                            ...settingsStore.userRoutine
                        }
                    ]
                },
                settingsStore.userRoutine,
            )
        }
    }

    function setupStep() {
        if (currentPart.value >= routine.value.parts.length) {
            complete.value = true;
            return;
        }

        let part = routine.value.parts[currentPart.value];
        if (currentRepetition.value >= part.repetitions.length) {
            currentPart.value += 1;

            if (currentPart.value >= routine.value.parts.length) {
                complete.value = true;
                return;
            }

            part = routine.value.parts[currentPart.value];
            currentRepetition.value = 0;
        }

        const rep = part.repetitions[currentRepetition.value];

        activePrompts.value = [];
        currentPrompt.value = 0;

        for (const prompt of rep.prompts) {
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
        complete.value = false;
        practicing.value = true;
        successCount.value = 0;
        currentPart.value = 0;
        currentRepetition.value = 0;

        generatePrompts();
        setupStep();

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
                            data1 === note && data2 >= settingsStore.userRoutine.minSuccessVelocity
                        ))) {
                            success = false;
                        }
                    }

                    if (success) {
                        successCount.value += 1;
                        activePrompt.success = true;
                        activePrompt.successTime = now;
                        activePrompt.current = false;

                        successes.value.push(clone(activePrompt));

                        currentPrompt.value += 1;
                        if (currentPrompt.value >= activePrompts.value.length) {
                            currentRepetition.value += 1;
                            setupStep();
                        } else {
                            activePrompts.value[currentPrompt.value].current = true;
                        }
                    }
                },
            });
    }

    function skipToNextStep() {
        currentPrompt.value = 0;

        currentRepetition.value = currentRoutinePart.value.repetitions.length;
        setupStep();

        if (complete.value) {
            stop();
        }
    }

    function stop() {
        window.clearInterval(practiceSessionTimer.value)
        midiSubscription.value.unsubscribe()
        activePrompts.value = []
        currentPrompt.value = routine.value.parts.length;
        practicing.value = false;
    }

    function finalize() {
        attempts.value = [];
        routine.value = null;
        complete.value = false;
    }

    return {
        currentPart,
        currentRoutinePart,
        currentRepetition,
        targetRepetitions,
        routine,
        startTime,
        practiceSessionTimer,
        practiceSessionTime,
        activePrompts,
        currentPrompt,
        successCount,
        practicing,
        complete,
        playRateDisplay,
        start,
        stop,
        advanceStep: skipToNextStep,
        finalize,
    }
})

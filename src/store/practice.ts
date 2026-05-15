import {defineStore} from "pinia";
import {MIDIInstruction, PracticeMIDIData, useMidiStore} from "./midi";
import {computed, ref} from "vue";
import {useSettingsStore} from "./settings";
import {generateRoutine, generateRoutineSet} from "../routine";
import {clone, exists} from "../utilities";
import {filter, Subscription} from "rxjs";
import {ParentType, Prompt, Routine, type RoutinePart, isFreePlaySetPrompt} from "../routine/types";
import {useRoutineStore} from "./routineEdit";
import {
    midiMatchesPromptSet,
    normPitchClass,
    samePitchRunBlocksSuccess,
} from "../practice/freePlaySetMatch";

const MILISECONDS_IN_MINUTE = 60000;

/** Sum of Midi targets per repetition (each prompt contributes its note count). Used for practice stats denominator. */
export function totalExpectedMidiNotesForPart(part: RoutinePart): number {
    let n = 0;
    for (const rep of part.repetitions) {
        for (const prompt of rep.prompts) {
            n += prompt.notes.length;
        }
    }
    return n;
}

function midiMatchesPromptTarget(
    playedMidi: number,
    targetMidi: number,
    requireOctave: boolean,
): boolean {
    if (requireOctave) {
        return playedMidi === targetMidi;
    }
    return playedMidi % 12 === targetMidi % 12;
}

export interface PromptData {
    success: boolean;
    current: boolean;
    prompt: Prompt;
    successTime: number | null;
    /** Set when a free-play step completes: note that was played (for staff/bubble reveal). */
    freePlayResolvedMidi: number | null;
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
    const practiceSessionTimer = ref<ReturnType<typeof setInterval> | null>(null);
    const practiceSessionTime = ref(0);
    const successCount = ref(0);
    const practicing = ref(false);
    const midiSubscription = ref<Subscription | null>(null);

    const routine = ref<Routine | null>(null);
    const activePrompts = ref<PromptData[]>([]);

    const currentRepetition = ref(0);
    const currentPart = ref(0);
    const currentPrompt = ref(0);
    const complete = ref(false);

    const successes = ref<PromptData[]>([]);
    const attempts = ref<PracticeAttempt[]>([]);
    /** Count of velocity-eligible note-ons that failed the current prompt before moving on (per routine part/step). */
    const incorrectAttemptsByPart = ref<number[]>([]);

    const freePlayLastAcceptedPc = ref<number | null>(null);
    const freePlayConsecutiveSamePitch = ref(0);

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
    });

    const currentRepetitionFocusLabel = computed(() => {
        const part = currentRoutinePart.value;
        if (!exists(part) || !exists(routine.value)) {
            return null;
        }
        if (currentRepetition.value < 0 || currentRepetition.value >= part.repetitions.length) {
            return null;
        }
        const repetition = part.repetitions[currentRepetition.value]!;
        const active = activePrompts.value[currentPrompt.value];
        const promptLabel = active?.prompt.repeatFocusLabel;
        if (promptLabel !== undefined) {
            return promptLabel;
        }
        return repetition.repeatFocusLabel ?? null;
    });

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

    const sessionNoteStats = computed(() => {
        const r = routine.value;
        if (!exists(r)) {
            return null;
        }
        const steps = r.parts.map((part, idx) => {
            const expected = totalExpectedMidiNotesForPart(part);
            const incorrect = incorrectAttemptsByPart.value[idx] ?? 0;
            return {
                partName: part.name,
                incorrect,
                expected,
            };
        });
        const totalExpected = steps.reduce((s, x) => s + x.expected, 0);
        const totalIncorrect = steps.reduce((s, x) => s + x.incorrect, 0);
        return {steps, totalExpected, totalIncorrect};
    });

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
                            cloneRepeat: false,
                            parentSettings: ParentType.Settings,
                            ...settingsStore.userRoutine,
                            repeatCount: 0,
                        }
                    ]
                },
                settingsStore.userRoutine,
            )
        }
    }

    function setupStep() {
        if (!exists(routine.value) || routine.value.parts.length === 0) {
            activePrompts.value = [];
            complete.value = true;
            return;
        }

        if (currentPart.value >= routine.value.parts.length) {
            activePrompts.value = [];
            complete.value = true;
            return;
        }

        let part = routine.value.parts[currentPart.value];
        if (currentRepetition.value >= part.repetitions.length) {
            currentPart.value += 1;

            if (currentPart.value >= routine.value.parts.length) {
                activePrompts.value = [];
                complete.value = true;
                return;
            }

            part = routine.value.parts[currentPart.value];
            currentRepetition.value = 0;
        }

        const rep = part.repetitions[currentRepetition.value];
        if (!exists(rep)) {
            activePrompts.value = [];
            complete.value = true;
            return;
        }

        activePrompts.value = [];
        currentPrompt.value = 0;

        freePlayLastAcceptedPc.value = null;
        freePlayConsecutiveSamePitch.value = 0;

        for (const prompt of rep.prompts) {
            activePrompts.value.push({
                success: false,
                current: false,
                prompt: prompt,
                successTime: null,
                freePlayResolvedMidi: null,
            })
        }

        if (activePrompts.value.length > 0) {
            activePrompts.value[0].current = true;
        }
    }

    function start() {
        midiSubscription.value?.unsubscribe();
        midiSubscription.value = null;
        window.clearInterval(practiceSessionTimer.value);
        practiceSessionTimer.value = null;

        complete.value = false;
        successCount.value = 0;
        currentPart.value = 0;
        currentRepetition.value = 0;
        currentPrompt.value = 0;
        activePrompts.value = [];
        practiceSessionTime.value = 0;

        freePlayLastAcceptedPc.value = null;
        freePlayConsecutiveSamePitch.value = 0;

        generatePrompts();

        if (!exists(routine.value) || routine.value.parts.length === 0) {
            incorrectAttemptsByPart.value = [];
            complete.value = true;
            return;
        }

        incorrectAttemptsByPart.value = routine.value.parts.map(() => 0);

        setupStep();

        if (complete.value) {
            return;
        }

        practicing.value = true;

        practiceSessionTimer.value = window.setInterval(() => {
            practiceSessionTime.value += 1
        }, 1000);

        midiSubscription.value = midiStore.midiEventSubject
            .pipe(filter((v) => v.instruction === MIDIInstruction.NoteOn))
            .subscribe({
                next: (data) => {
                    if (!practicing.value) {
                        return;
                    }

                    const activePrompt = activePrompts.value[currentPrompt.value];
                    if (!exists(activePrompt) || !exists(activePrompt.prompt)) {
                        return;
                    }

                    const now = Date.now();
                    const frameTime = now - 50;

                    attempts.value.push({
                        time: now,
                        data
                    });

                    const part = currentRoutinePart.value;
                    const baked = part?.bakedSettings;

                    const requireOctave = settingsStore.currentSettings.requireOctave;
                    const minVel = settingsStore.currentSettings.minSuccessVelocity;

                    function recordIncorrectAttempt(): void {
                        const i = currentPart.value;
                        const row = incorrectAttemptsByPart.value;
                        if (i >= 0 && i < row.length) {
                            row[i]++;
                        }
                    }

                    if (data.data2 < minVel) {
                        return;
                    }

                    let success: boolean;
                    if (isFreePlaySetPrompt(activePrompt.prompt)) {
                        const p = activePrompt.prompt;
                        if (!midiMatchesPromptSet(data.data1, p, requireOctave)) {
                            recordIncorrectAttempt();
                            return;
                        }
                        const playedPc = normPitchClass(data.data1);
                        if (
                            baked != null &&
                            samePitchRunBlocksSuccess(
                                playedPc,
                                freePlayLastAcceptedPc.value,
                                freePlayConsecutiveSamePitch.value,
                                baked.maxConsecutiveSamePitchSuccess,
                            )
                        ) {
                            recordIncorrectAttempt();
                            return;
                        }
                        if (
                            freePlayLastAcceptedPc.value === null ||
                            playedPc !== freePlayLastAcceptedPc.value
                        ) {
                            freePlayLastAcceptedPc.value = playedPc;
                            freePlayConsecutiveSamePitch.value = 1;
                        } else {
                            freePlayConsecutiveSamePitch.value += 1;
                        }
                        success = true;
                    } else {
                        success = true;
                        for (const note of activePrompt.prompt.notes) {
                            const notesInFrame = attempts.value
                                .toReversed()
                                .filter((a) => a.time > frameTime);

                            if (!exists(notesInFrame.find(({data: {data1, data2}}) =>
                                midiMatchesPromptTarget(
                                    data1,
                                    note,
                                    requireOctave,
                                ) && data2 >= minVel
                            ))) {
                                success = false;
                            }
                        }
                    }

                    if (!success && !isFreePlaySetPrompt(activePrompt.prompt)) {
                        recordIncorrectAttempt();
                    }

                    if (success) {
                        if (isFreePlaySetPrompt(activePrompt.prompt)) {
                            activePrompt.freePlayResolvedMidi = data.data1;
                        }
                        successCount.value += 1;
                        activePrompt.success = true;
                        activePrompt.successTime = now;
                        activePrompt.current = false;

                        successes.value.push(clone(activePrompt));

                        currentPrompt.value += 1;
                        if (currentPrompt.value >= activePrompts.value.length) {
                            currentRepetition.value += 1;
                            setupStep();

                            if (complete.value) {
                                stop();
                            }
                        } else {
                            activePrompts.value[currentPrompt.value].current = true;
                        }
                    }
                },
            });
    }

    function skipToNextStep() {
        const part = currentRoutinePart.value;
        if (!exists(part)) {
            return;
        }
        currentPrompt.value = 0;

        currentRepetition.value = part.repetitions.length;
        setupStep();

        if (complete.value) {
            stop();
        }
    }

    function stop() {
        window.clearInterval(practiceSessionTimer.value);
        practiceSessionTimer.value = null;
        midiSubscription.value?.unsubscribe();
        midiSubscription.value = null;
        activePrompts.value = [];
        currentPrompt.value = exists(routine.value)
            ? routine.value.parts.length
            : 0;
        practicing.value = false;
    }

    function finalize() {
        window.clearInterval(practiceSessionTimer.value);
        practiceSessionTimer.value = null;
        midiSubscription.value?.unsubscribe();
        midiSubscription.value = null;
        attempts.value = [];
        successes.value = [];
        incorrectAttemptsByPart.value = [];
        activePrompts.value = [];
        routine.value = null;
        complete.value = false;
        practicing.value = false;
        currentPart.value = 0;
        currentRepetition.value = 0;
        currentPrompt.value = 0;
        practiceSessionTime.value = 0;
        successCount.value = 0;
    }

    return {
        currentPart,
        currentRoutinePart,
        currentRepetition,
        currentRepetitionFocusLabel,
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
        sessionNoteStats,
        start,
        stop,
        advanceStep: skipToNextStep,
        finalize,
    }
})

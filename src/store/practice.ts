import {defineStore} from "pinia";
import {useMidiStore} from "./midi";
import {computed, ref} from "vue";
import {formatMidiLetter} from "../notes";

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

export interface Prompt {
    color: string;
    note: number;
}

export enum NoteRangeType {
    Notes,
    Frets,
    Octaves,
}

export interface FretRangeOptions {
    startFret: number;
    endFret: number;
}

const MAX_MIDI_NOTES = 127
const STANDARD_TUNING_OPEN_FRET_NOTES = [40, 45, 50, 55, 59, 64]

export const usePracticeStore = defineStore('practice', () => {
    const midiStore = useMidiStore();

    const prompts = ref<Prompt[]>([])
    const numberOfActivePrompts = ref(5);
    const activePrompts = ref<number[]>([]);
    const promptCursor = ref(0);
    const currentPrompt = ref(0);

    const minSuccessVelocity = ref(100);

    const minNote = ref(0);
    const maxNote = ref(MAX_MIDI_NOTES);
    const startTime = ref(0);
    const practiceSessionTimer = ref(null);
    const practiceSessionTime = ref(0);
    const midiListener = ref(null);
    const noteRangeType = ref(NoteRangeType.Frets);
    const fretRangeOptions = ref<FretRangeOptions>({
        startFret: 0,
        endFret: 4
    });

    const selectedNotes = computed(() => {
        let notes = []
        switch (noteRangeType.value) {
            case NoteRangeType.Notes:
                for (let i = minNote.value; i <= maxNote.value; i++) {
                    notes.push(i)
                }
                break;

            case NoteRangeType.Frets:
                for (let note in STANDARD_TUNING_OPEN_FRET_NOTES) {
                    for (let i = fretRangeOptions.value.startFret; i <= fretRangeOptions.value.endFret; i++) {
                        notes.push(STANDARD_TUNING_OPEN_FRET_NOTES[note] + i)
                    }
                }
                break;

            case NoteRangeType.Octaves:
                break
        }

        return notes
    })

    function generatePrompts() {
        let noteOptions = selectedNotes.value
        for (let note of noteOptions) {
            let colorRoll = Math.floor(Math.random() * colorOptions.length);
            prompts.value.push({
                color: colorOptions[colorRoll],
                note,
            })
        }

        // shuffle twice
        for (let j = 0; j < 2; j++) {
            for (let i = 0; i < prompts.value.length; i++) {
                const roll = Math.floor(Math.random() * prompts.value.length);
                const temp = prompts.value[i];
                prompts.value[i] = prompts.value[roll];
                prompts.value[roll] = temp;
            }
        }
    }

    function setNoteRange(min: number, max: number) {
        minNote.value = Math.max(0, Math.min(MAX_MIDI_NOTES, min));
        maxNote.value = Math.max(0, Math.min(MAX_MIDI_NOTES, max));
    }

    function refreshPrompt(index: number) {
        if (promptCursor.value < prompts.value.length) {
            activePrompts.value[index] = promptCursor.value;
            promptCursor.value += 1
        } else {
            console.log("finished prompts")
        }
    }

    function start() {
        setNoteRange(40, 69)
        generatePrompts();

        activePrompts.value = []
        for (let i = 0; i <= numberOfActivePrompts.value; i++) {
            activePrompts.value.push(i)
        }
        promptCursor.value = numberOfActivePrompts.value

        practiceSessionTimer.value = window.setInterval(() => {
            practiceSessionTime.value += 1
        }, 1000)

        midiListener.value = midiStore.$onAction(
            ({name, args}) => {
                if (name === 'midiNoteOn') {
                    let noteArgs = args as [number, number]
                    if (noteArgs[1] < minSuccessVelocity.value) return;

                    let promptIndex = activePrompts.value[currentPrompt.value]
                    let prompt = prompts.value[promptIndex]

                    if (formatMidiLetter(prompt.note) === formatMidiLetter(noteArgs[0])) {
                        refreshPrompt(currentPrompt.value)

                        currentPrompt.value += 1
                        if (currentPrompt.value >= activePrompts.value.length) {
                            currentPrompt.value = 0
                        }
                    }
                } else if (name === 'midiNoteOff') {
                    // console.log('listen off')
                }
            }
        )
    }

    return {
        prompts,
        minNote,
        maxNote,
        startTime,
        practiceSessionTimer,
        practiceSessionTime,
        midiListener,
        start,
        selectedNotes,
        activePrompts,
        currentPrompt,
        setNoteRange
    }
})

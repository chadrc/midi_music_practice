import {defineStore} from "pinia";
import {useMidiStore} from "./midi";
import {ref} from "vue";
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

const MAX_MIDI_NOTES = 127

export const usePracticeStore = defineStore('practice', () => {
    const midiStore = useMidiStore();

    const prompts = ref<Prompt[]>([])
    const minNote = ref(0);
    const maxNote = ref(MAX_MIDI_NOTES);
    const startTime = ref(0);
    const timer = ref(null);
    const midiListener = ref(null);

    function rollPrompt() {
        let colorRoll = Math.floor(Math.random() * colorOptions.length);
        let noteRoll = Math.floor(Math.random() * (maxNote.value - minNote.value + 1)) + minNote.value;
        prompts.value.push({
            color: colorOptions[colorRoll],
            note: noteRoll,
        })
    }

    function setNoteRange(min: number, max: number) {
        minNote.value = Math.max(0, Math.min(MAX_MIDI_NOTES, min));
        maxNote.value = Math.max(0, Math.min(MAX_MIDI_NOTES, max));
    }

    function removePrompt(index: number) {
        prompts.value.splice(index, 1);
    }

    function start() {
        setNoteRange(40, 69)
        rollPrompt();
        timer.value = window.setInterval(() => {
            this.time += 1
        }, 1000)

        midiListener.value = midiStore.$onAction(
            ({name, args}) => {
                if (name === 'midiNoteOn') {
                    let noteArgs = args as [number, number]
                    let match = prompts.value.findIndex((prompt) =>
                        formatMidiLetter(prompt.note) === formatMidiLetter(noteArgs[0]))

                    if (match !== -1) {
                        removePrompt(match)
                        rollPrompt()
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
        timer,
        midiListener,
        start,
        setNoteRange
    }
})

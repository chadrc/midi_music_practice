import {defineStore} from "pinia";
import {useMidiStore} from "./midi";
import {computed, ref} from "vue";
import {formatMidiLetter} from "../notes";
import {NoteScale, CHROMATIC_SCALE} from "../notes/scales";

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

export interface OctaveRangeOptions {
    startOctave: number;
    endOctave: number;
}

const MAX_MIDI_NOTES = 127
const STANDARD_TUNING_OPEN_FRET_NOTES = [40, 45, 50, 55, 59, 64]

export const usePracticeStore = defineStore('practice', () => {
    const midiStore = useMidiStore();

    const startTime = ref(0);
    const practiceSessionTimer = ref(null);
    const practiceSessionTime = ref(0);
    const successCount = ref(0);
    const practicing = ref(false);
    const midiListenerUnsubscribe = ref(null);

    const prompts = ref<Prompt[]>([])
    const numberOfActivePrompts = ref(6);
    const activePrompts = ref<(number | null)[]>([]);
    const promptCursor = ref(0);
    const currentPrompt = ref(0);

    const scale = ref<NoteScale>(CHROMATIC_SCALE);
    const requireOctave = ref(true);
    const minSuccessVelocity = ref(100);
    const noteRangeType = ref(NoteRangeType.Frets);
    const fretRangeOptions = ref<FretRangeOptions>({
        startFret: 0,
        endFret: 4
    });
    const octaveRangeOptions = ref<OctaveRangeOptions>({
        startOctave: 3,
        endOctave: 5
    })
    const minNote = ref(0);
    const maxNote = ref(MAX_MIDI_NOTES);

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
                let startingC = octaveRangeOptions.value.startOctave * 12
                let noteCount = (octaveRangeOptions.value.endOctave - octaveRangeOptions.value.startOctave) * 12;
                let endNote = startingC + noteCount;

                for (let i = startingC; i <= endNote; i++) {
                    notes.push(i)
                }
                break
        }

        return notes
    })

    function generatePrompts() {
        let noteOptions = selectedNotes.value
            .filter((note) => scale.value.contains(note))

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

    function refreshActivePrompts() {
        activePrompts.value = []
        const start = promptCursor.value;
        const end = promptCursor.value + numberOfActivePrompts.value;

        if (end >= prompts.value.length) {
            generatePrompts()
        }

        for (let i = start; i < end; i++) {
            activePrompts.value.push(i)
        }
        promptCursor.value += numberOfActivePrompts.value
    }

    function start() {
        setNoteRange(40, 69);
        generatePrompts();

        practicing.value = true;
        successCount.value = 0;
        promptCursor.value = 0;

        refreshActivePrompts();

        practiceSessionTimer.value = window.setInterval(() => {
            practiceSessionTime.value += 1
        }, 1000);

        midiListenerUnsubscribe.value = midiStore.$onAction(
            ({name, args}) => {
                if (name === 'midiNoteOn') {
                    let noteArgs = args as [number, number, number]
                    if (noteArgs[1] < minSuccessVelocity.value) return;

                    let promptIndex = activePrompts.value[currentPrompt.value]
                    let prompt = prompts.value[promptIndex]

                    let success = formatMidiLetter(prompt.note) === formatMidiLetter(noteArgs[0]);
                    if (requireOctave.value) {
                        success = prompt.note === noteArgs[0]
                    }

                    if (success) {
                        successCount.value += 1
                        activePrompts.value[currentPrompt.value] = null;

                        currentPrompt.value += 1
                        if (currentPrompt.value >= activePrompts.value.length) {
                            currentPrompt.value = 0
                            refreshActivePrompts()
                        }
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
        prompts.value = []
        practicing.value = false;
    }

    return {
        prompts,
        minNote,
        maxNote,
        startTime,
        practiceSessionTimer,
        practiceSessionTime,
        selectedNotes,
        activePrompts,
        currentPrompt,
        requireOctave,
        successCount,
        practicing,
        scale,
        noteRangeType,
        fretRangeOptions,
        octaveRangeOptions,
        start,
        stop,
    }
})

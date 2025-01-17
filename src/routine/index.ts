import {NoteRangeType, PracticeType, RoutinePartSettings} from "../store/settings";
import {formatMidiNote} from "../notes";
import {SCALES} from "../notes/scales";

export const MAX_MIDI_NOTES = 127
export const STANDARD_TUNING_OPEN_FRET_NOTES = [40, 45, 50, 55, 59, 64]

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
    index: number;
    notes: number[];
    color: string;
    displays: string[];
}

export interface RoutinePart {
    prompts: Prompt[];
}

export const generateRoutineSet = (settings: RoutinePartSettings): RoutinePart => {
    const scale = SCALES[settings.scale.setName][settings.scale.baseNote]
    const notes = generateNotesForRange(settings);
    const noteOptions = notes.filter((note) => scale.contains(note));

    const prompts = []
    for (let i = 0; i < settings.promptCount; i++) {
        const noteRoll = Math.floor(Math.random() * noteOptions.length);
        const colorRoll = Math.floor(Math.random() * colorOptions.length)

        const note = noteOptions[noteRoll]

        prompts.push({
            index: i,
            notes: [note],
            color: colorOptions[colorRoll],
            displays: [settings.requireOctave ? formatMidiNote(note) : formatMidiNote(note)],
        })
    }

    shuffle(prompts);

    return {
        prompts,
    }
}

export const shuffle = <T>(input: T[], count: number = 2) => {
    for (let j = 0; j < count; j++) {
        for (let i = 0; i < input.length; i++) {
            const roll = Math.floor(Math.random() * input.length);
            const temp = input[i];
            input[i] = input[roll];
            input[roll] = temp;
        }
    }
}

export const generateNotesForRange = (
    settings: RoutinePartSettings,
) => {
    const {noteRangeType} = settings;
    const notes = []
    switch (noteRangeType) {
        case NoteRangeType.Notes: {
            const {start, end} = settings.noteRangeOptions.range;
            for (let i = start; i <= end; i++) {
                notes.push(i)
            }
            break;
        }
        case NoteRangeType.Frets: {
            const {start, end} = settings.fretRangeOptions.range;
            for (const note in STANDARD_TUNING_OPEN_FRET_NOTES) {
                for (let i = start; i <= end; i++) {
                    notes.push(STANDARD_TUNING_OPEN_FRET_NOTES[note] + i)
                }
            }
            break;
        }
        case NoteRangeType.Octaves: {
            const {start, end} = settings.octaveRangeOptions.range;
            const startingC = start * 12
            const noteCount = (end - start) * 12;
            const lastNote = startingC + noteCount;

            for (let i = startingC; i <= lastNote; i++) {
                notes.push(i)
            }
            break;
        }
    }

    return notes;
}
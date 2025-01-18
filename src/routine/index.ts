import {NoteRangeType, RoutinePart, RoutinePartSettings} from "./types";
import {formatChord, formatMidiNote} from "../notes";
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

export const generateRoutineSet = (settings: RoutinePartSettings): RoutinePart => {
    const scale = SCALES[settings.scale.setName][settings.scale.baseNote]
    const notes = generateNotesForRange(settings);
    const noteOptions = notes.filter((note) => scale.contains(note));

    let count = 0;
    const prompts = []

    if (scale.chords.length > 0) {
        for (let i = 0; i < settings.chordRatio; i++) {
            const colorRoll = Math.floor(Math.random() * colorOptions.length);
            const chordRoll = Math.floor(Math.random() * scale.chords.length);
            const chord = scale.chords[chordRoll];

            // find chord fundamentals in note options
            const availableChordFundamentals = noteOptions.filter(
                (n) => n === chord.fundamental || (n % 12) === chord.fundamental
            );

            // ensure entire chord can be played, i.e. remaining notes wouldn't go past MIDI max
            const playableChordFundamentals = availableChordFundamentals.filter((chordFundamental) => {
                for (const c of chord.notes) {
                    const chordNote = chordFundamental + c;
                    if (chordNote > 127) {
                        return false;
                    }
                }

                return true;
            });

            if (playableChordFundamentals.length <= 0) {
                continue;
            }

            const fundamentalRoll = Math.floor(Math.random() * playableChordFundamentals.length);
            const fundamental = playableChordFundamentals[fundamentalRoll];
            const notes = [];
            const baseFundamental = chord.notes[0];

            for (let chordNote of chord.notes) {
                if (chordNote < baseFundamental) {
                    chordNote += 12;
                }
                chordNote -= baseFundamental;
                notes.push(fundamental + chordNote)
            }

            prompts.push({
                index: i,
                notes: notes,
                color: colorOptions[colorRoll],
                displays: [formatChord(chord.type, fundamental)],
            })

            count++;
        }
    }

    for (let i = count; i < settings.promptCount; i++) {
        const noteRoll = Math.floor(Math.random() * noteOptions.length);
        const colorRoll = Math.floor(Math.random() * colorOptions.length);

        const note = noteOptions[noteRoll]

        prompts.push({
            index: i,
            notes: [note],
            color: colorOptions[colorRoll],
            displays: [
                {
                    note: settings.requireOctave ? formatMidiNote(note) : formatMidiNote(note),
                    chordType: ""
                }
            ],
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
import {
    BakeRoutineSettings,
    NoteRangeType, ParentType,
    PracticeSettings, PracticeSettingsKeys,
    Routine,
    RoutinePart,
    RoutinePartSettings,
    RoutineSettings
} from "./types";
import {formatChord, formatMidiNote} from "../notes";
import {SCALES} from "../notes/scales";
import {clone, exists} from "../utilities";

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

export const resolveValues = (
    base: RoutinePartSettings,
    defaults: PracticeSettings,
): BakeRoutineSettings => {
    const toClone: PracticeSettingsKeys = [
        "name",
        "practiceType",
        "targetBPM",
        "scale",
        "chordRatio",
        "requireOctave",
        "minSuccessVelocity",
        "noteRangeType",
        "fretRange",
        "octaveRange",
        "noteRange",
        "promptCount",
    ];

    const baked: BakeRoutineSettings = {
        repeatCount: base.repeatCount,
        cloneRepeat: base.cloneRepeat,
        parentSettings: base.parentSettings,
        ...clone(defaults)
    };

    for (const prop of toClone) {
        const val = base[prop];
        if (exists(val)) {
            // @ts-expect-error Getting 'never' error which is wrong
            baked[prop] = val;
        }
    }

    return baked;
}

export const generateRoutine = (
    settings: RoutineSettings,
    userSettings: PracticeSettings,
) => {
    const routine: Routine = {
        parts: [],
    };

    if (settings.parts.length === 0) {
        return routine;
    }

    const first = resolveValues(settings.parts[0], userSettings);
    let previous = first;

    const baked = [first];
    for (let i=1; i<settings.parts.length; i++) {
        const setting = settings.parts[i];
        let parent = userSettings;
        switch (setting.parentSettings) {
            case ParentType.Settings:
                parent = userSettings;
                break;
            case ParentType.First:
                parent = first;
                break;
            case ParentType.Previous:
                parent = previous;
                break;
        }
        const bake = resolveValues(setting, parent);
        previous = bake;
        baked.push(bake);
    }

    routine.parts = baked.map((b) => generateRoutineSet(b));

    return routine;
}

export const generateRoutineSet = (settings: BakeRoutineSettings): RoutinePart => {
    const scale = SCALES[settings.scale.setName][settings.scale.baseNote]
    const notes = generateNotesForRange(settings);
    const noteOptions = notes.filter((note) => scale.contains(note));

    let count = 0;
    const prompts = []

    if (scale.chords.length > 0) {
        const chordRatio = Math.min(settings.chordRatio, settings.promptCount);

        for (let i = 0; i < chordRatio; i++) {
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
            const {start, end} = settings.noteRange;
            for (let i = start; i <= end; i++) {
                notes.push(i)
            }
            break;
        }
        case NoteRangeType.Frets: {
            const {start, end} = settings.fretRange;
            for (const note in STANDARD_TUNING_OPEN_FRET_NOTES) {
                for (let i = start; i <= end; i++) {
                    notes.push(STANDARD_TUNING_OPEN_FRET_NOTES[note] + i)
                }
            }
            break;
        }
        case NoteRangeType.Octaves: {
            const {start, end} = settings.octaveRange;
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
import {
    BakedRoutinePartSettings,
    NoteRangeType, ParentType,
    PracticeType,
    UserRoutinePartSettings,
    UserRoutinePractice,
    UserRoutineSettingsKeys,
    Routine,
    RoutinePart,
    RoutinePartSettings,
    RoutineSettings,
    Prompt,
    type UserRoutineNoteRange,
} from "./types";
import {formatMidiNote} from "../notes";
import type {
    ChordTypeId,
    PracticeChordSpec,
    PracticeScaleSpec,
    RoutineChordsPractice,
    RoutineScalesPractice,
    ScaleTypeId,
} from "./types";
import {
    BaseNotes,
    CHROMATIC_SCALE_SET_NAME,
    getRegisteredScale,
    NoteScale,
    SCALES,
} from "../notes/scales";
import {CHORDS, Chord, MAJOR_CHORDS_SET_NAME} from "../notes/chords";
import {clone, exists} from "../utilities";
import {NumberGenerator} from "../common/NumberGenerator";
import type {NumberRangeLike} from "../common/NumberRange";

export const MAX_MIDI_NOTES = 127
export const STANDARD_TUNING_OPEN_FRET_NOTES = [40, 45, 50, 55, 59, 64]

export const NOTE_RANGE_MAX_MIDI = MAX_MIDI_NOTES;
export const NOTE_RANGE_MAX_FRETS = 22;
/** Inclusive high bound for octave *index* UI (0…8). */
export const NOTE_RANGE_MAX_OCTAVES = 8;

export function maxForNoteRangeType(t: NoteRangeType): number {
    switch (t) {
        case NoteRangeType.Notes:
            return NOTE_RANGE_MAX_MIDI;
        case NoteRangeType.Frets:
            return NOTE_RANGE_MAX_FRETS;
        case NoteRangeType.Octaves:
            return NOTE_RANGE_MAX_OCTAVES;
    }
}

/** Map a range from one mode’s scale onto another (proportional), then clamp and order start/end. */
export function estimateRangeWhenChangingType(
    fromType: NoteRangeType,
    fromRange: NumberRangeLike,
    toType: NoteRangeType,
): NumberRangeLike {
    const fromMax = maxForNoteRangeType(fromType);
    const toMax = maxForNoteRangeType(toType);
    const scale = (v: number) =>
        fromMax <= 0 ? Math.min(toMax, Math.max(0, v)) : Math.round((v / fromMax) * toMax);
    let start = scale(fromRange.start);
    let end = scale(fromRange.end);
    start = Math.max(0, Math.min(toMax, start));
    end = Math.max(0, Math.min(toMax, end));
    if (start > end) {
        [start, end] = [end, start];
    }
    return {start, end};
}

export function setNoteRangeType(nr: UserRoutineNoteRange, newType: NoteRangeType): void {
    if (nr.type === newType) {
        return;
    }
    nr.range = estimateRangeWhenChangingType(nr.type, nr.range, newType);
    nr.type = newType;
}

export function defaultUserRoutineNoteRange(): UserRoutineNoteRange {
    return {
        type: NoteRangeType.Notes,
        range: {start: 0, end: NOTE_RANGE_MAX_MIDI},
    };
}

export function defaultPracticeForType(t: PracticeType): UserRoutinePractice {
    switch (t) {
        case PracticeType.Notes:
            return {type: PracticeType.Notes};
        case PracticeType.Chords:
            return {type: PracticeType.Chords, chordTypes: []};
        case PracticeType.Scales:
            return {type: PracticeType.Scales, scaleTypes: []};
    }
}

function migrateChordsFromLegacyItems(items: PracticeChordSpec[]): RoutineChordsPractice {
    const types = [
        ...new Set(
            items.map((i) => i.chordType).filter((t): t is ChordTypeId => t !== undefined),
        ),
    ];
    const bases = items.map((i) => i.baseNote).filter((b): b is string => b !== undefined);
    const baseNote =
        bases.length > 0 ? (bases.every((b) => b === bases[0]) ? bases[0] : bases[0]) : undefined;
    return {type: PracticeType.Chords, baseNote, chordTypes: types};
}

function migrateScalesFromLegacyItems(items: PracticeScaleSpec[]): RoutineScalesPractice {
    const types = [
        ...new Set(
            items.map((i) => i.scaleType).filter((t): t is ScaleTypeId => t !== undefined),
        ),
    ];
    const bases = items.map((i) => i.baseNote).filter((b): b is string => b !== undefined);
    const baseNote =
        bases.length > 0 ? (bases.every((b) => b === bases[0]) ? bases[0] : bases[0]) : undefined;
    return {type: PracticeType.Scales, baseNote, scaleTypes: types};
}

/**
 * Upgrade persisted practice data from the old `items[]` shape to `baseNote` + multi-select types.
 */
export function normalizeUserRoutinePractice(p: UserRoutinePractice): UserRoutinePractice {
    switch (p.type) {
        case PracticeType.Notes:
            return p;
        case PracticeType.Chords: {
            const c = p as RoutineChordsPractice & {items?: PracticeChordSpec[]};
            if (Array.isArray(c.items)) {
                return migrateChordsFromLegacyItems(c.items);
            }
            return {
                type: PracticeType.Chords,
                baseNote: c.baseNote,
                chordTypes: c.chordTypes ?? [],
            };
        }
        case PracticeType.Scales: {
            const s = p as RoutineScalesPractice & {items?: PracticeScaleSpec[]};
            if (Array.isArray(s.items)) {
                return migrateScalesFromLegacyItems(s.items);
            }
            return {
                type: PracticeType.Scales,
                baseNote: s.baseNote,
                scaleTypes: s.scaleTypes ?? [],
            };
        }
    }
}

export function normalizeRoutineSettings(settings: RoutineSettings): RoutineSettings {
    return {
        ...settings,
        parts: settings.parts.map((part) => ({
            ...part,
            practice:
                part.practice != null ? normalizeUserRoutinePractice(part.practice) : part.practice,
        })),
    };
}

export function noteScaleFromSpec(spec: PracticeScaleSpec): NoteScale {
    const setName = spec.scaleType ?? CHROMATIC_SCALE_SET_NAME;
    const baseKey = spec.baseNote ?? BaseNotes.C.mapKey;
    return getRegisteredScale(setName, baseKey);
}

/** Any value accepted where only {@link NoteScale.prototype.contains} is used (grid, prompt pools). */
export type PracticeScaleContainment = Pick<NoteScale, "contains">;

export function noteScaleFromPractice(practice: UserRoutinePractice): NoteScale {
    switch (practice.type) {
        case PracticeType.Notes:
            return SCALES[CHROMATIC_SCALE_SET_NAME][BaseNotes.C.mapKey];
        case PracticeType.Chords:
            return SCALES[CHROMATIC_SCALE_SET_NAME][BaseNotes.C.mapKey];
        case PracticeType.Scales: {
            const p = practice;
            if (p.scaleTypes.length === 0) {
                return getRegisteredScale(CHROMATIC_SCALE_SET_NAME, p.baseNote ?? BaseNotes.C.mapKey);
            }
            return getRegisteredScale(p.scaleTypes[0], p.baseNote ?? BaseNotes.C.mapKey);
        }
    }
}

export function practiceScaleMembership(practice: UserRoutinePractice): PracticeScaleContainment {
    switch (practice.type) {
        case PracticeType.Notes:
        case PracticeType.Chords:
            return noteScaleFromPractice(practice);
        case PracticeType.Scales: {
            const p = practice;
            const baseKey = p.baseNote ?? BaseNotes.C.mapKey;
            const typeIds =
                p.scaleTypes.length > 0 ? p.scaleTypes : [CHROMATIC_SCALE_SET_NAME];
            const scales = typeIds.map((t) => getRegisteredScale(t, baseKey));
            if (scales.length === 1) {
                return scales[0];
            }
            return {
                contains(n: number) {
                    return scales.some((s) => s.contains(n));
                },
            };
        }
    }
}

export function chordFromSpec(spec: PracticeChordSpec): Chord {
    const kind = spec.chordType ?? MAJOR_CHORDS_SET_NAME;
    const key = spec.baseNote ?? BaseNotes.C.mapKey;
    return CHORDS[kind][key];
}

function chordPoolSize(practice: RoutineChordsPractice): number {
    const n = practice.chordTypes.length;
    return n > 0 ? n : 1;
}

export function chordRatioFromSettings(settings: BakedRoutinePartSettings): number {
    if (settings.practice.type !== PracticeType.Chords) {
        return 0;
    }
    return Math.min(chordPoolSize(settings.practice), settings.promptCount);
}

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
    defaults: UserRoutinePartSettings,
): BakedRoutinePartSettings => {
    const toClone: UserRoutineSettingsKeys = [
        "name",
        "targetBPM",
        "practice",
        "requireOctave",
        "minSuccessVelocity",
        "noteRange",
        "promptCount",
    ];

    const baked: BakedRoutinePartSettings = {
        name: base.name,
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
    userSettings: UserRoutinePartSettings,
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

export const generateRoutineSet = (settings: BakedRoutinePartSettings): RoutinePart => {
    const seed = settings.seed || Math.random();
    const generator = new NumberGenerator(seed);
    const scaleMembership = practiceScaleMembership(settings.practice);
    const notes = generateNotesForRange(settings);
    const noteOptions = notes.filter((note) => scaleMembership.contains(note));

    const repetitions = []

    const totalReps = settings.repeatCount + 1;
    if (settings.cloneRepeat) {
        const rep = generatePrompts(
            settings,
            scaleMembership,
            generator,
            noteOptions,
        );
        for (let i=0; i<totalReps; i++) {
            repetitions.push({ prompts: clone(rep) });
        }
    } else {
        for (let i=0; i<totalReps; i++) {
            repetitions.push({
                prompts: generatePrompts(
                    settings,
                    scaleMembership,
                    generator,
                    noteOptions,
                )
            });
        }
    }

    return {
        name: settings.name,
        generator,
        repetitions,
        bakedSettings: settings,
    }
}

export const shuffle = <T>(input: T[], generator: NumberGenerator, count: number = 2) => {
    for (let j = 0; j < count; j++) {
        for (let i = 0; i < input.length; i++) {
            const roll = generator.rangeExclusiveI(0, input.length);
            const temp = input[i];
            input[i] = input[roll];
            input[roll] = temp;
        }
    }
}

export const generateNotesForRange = (
    settings: RoutinePartSettings,
) => {
    const notes: number[] = [];
    if (!exists(settings.noteRange)) {
        return notes;
    }

    const {type, range} = settings.noteRange;
    const {start, end} = range;
    switch (type) {
        case NoteRangeType.Notes: {
            for (let i = start; i <= end; i++) {
                notes.push(i)
            }
            break;
        }
        case NoteRangeType.Frets: {
            for (const note in STANDARD_TUNING_OPEN_FRET_NOTES) {
                for (let i = start; i <= end; i++) {
                    notes.push(STANDARD_TUNING_OPEN_FRET_NOTES[note] + i)
                }
            }
            break;
        }
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

    return notes;
}

function generatePrompts(
    settings: BakedRoutinePartSettings,
    _scale: PracticeScaleContainment,
    generator: NumberGenerator,
    noteOptions: number[],
): Prompt[] {
    const count = 0;
    const prompts = []

    /* Chord prompts (used NoteScale#chords) — re-enable with formatChord import when diatonic chords return.
    if (scale.chords.length > 0) {
        const chordRatio = Math.min(chordRatioFromSettings(settings), settings.promptCount);

        for (let i = 0; i < chordRatio; i++) {
            const colorRoll = generator.rangeExclusiveI(0, colorOptions.length);
            const chordRoll = generator.rangeExclusiveI(0, scale.chords.length);
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

            const fundamentalRoll = generator.rangeExclusiveI(0, playableChordFundamentals.length);
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
    */

    for (let i = count; i < settings.promptCount; i++) {
        const noteRoll = generator.rangeExclusiveI(0, noteOptions.length);
        const colorRoll = generator.rangeExclusiveI(0, colorOptions.length);

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

    shuffle(prompts, generator);

    return prompts;
}
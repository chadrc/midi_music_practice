import {
    BakedRoutinePartSettings,
    CHORD_TYPE_OPTIONS,
    DEFAULT_PRACTICE_OCTAVE_RANGE,
    NoteRangeType,
    ParentType,
    PracticePoolMode,
    PracticeType,
    SCALE_TYPE_OPTIONS,
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
import {formatMidiLetter, formatMidiNote, scientificOctaveFromMidi} from "../notes";
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
    CHORD_REGISTRY_PRIMARY_MAP_KEYS,
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
            return {type: PracticeType.Notes, noteRange: defaultUserRoutineNoteRange()};
        case PracticeType.Chords:
            return {
                type: PracticeType.Chords,
                chordTypes: [],
                mode: PracticePoolMode.Random,
                octaveRange: {...DEFAULT_PRACTICE_OCTAVE_RANGE},
            };
        case PracticeType.Scales:
            return {
                type: PracticeType.Scales,
                scaleTypes: [],
                mode: PracticePoolMode.Random,
                octaveRange: {...DEFAULT_PRACTICE_OCTAVE_RANGE},
            };
    }
}

function orderedOctaveRange(range: NumberRangeLike): NumberRangeLike {
    const lo = Math.min(range.start, range.end);
    const hi = Math.max(range.start, range.end);
    return {start: lo, end: hi};
}

function resolvedChordScaleOctaveRange(practice: UserRoutinePractice): NumberRangeLike {
    if (practice.type === PracticeType.Chords || practice.type === PracticeType.Scales) {
        return orderedOctaveRange(practice.octaveRange ?? DEFAULT_PRACTICE_OCTAVE_RANGE);
    }
    return orderedOctaveRange(DEFAULT_PRACTICE_OCTAVE_RANGE);
}

function midiInPracticeOctaveSpan(midi: number, span: NumberRangeLike): boolean {
    const o = scientificOctaveFromMidi(midi);
    return o >= span.start && o <= span.end;
}

/** Pitch span for prompts and grid: notes practice uses its own range; chords/scales use full span. */
export function noteRangeForPractice(practice: UserRoutinePractice): UserRoutineNoteRange {
    if (practice.type === PracticeType.Notes) {
        return practice.noteRange;
    }
    return defaultUserRoutineNoteRange();
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

    const repetitions = []

    const totalReps = settings.repeatCount + 1;
    if (settings.cloneRepeat) {
        const rep = generatePrompts(settings, generator);
        for (let i=0; i<totalReps; i++) {
            repetitions.push({ prompts: clone(rep) });
        }
    } else {
        for (let i=0; i<totalReps; i++) {
            repetitions.push({
                prompts: generatePrompts(settings, generator)
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

export function midiNotesForNoteRange(nr: UserRoutineNoteRange): number[] {
    const notes: number[] = [];
    const {type, range} = nr;
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

export const generateNotesForRange = (settings: {practice: UserRoutinePractice}) => {
    return midiNotesForNoteRange(noteRangeForPractice(settings.practice));
}

export function formatDisplayNote(requireOctave: boolean, midi: number): string {
    return requireOctave ? formatMidiNote(midi) : formatMidiLetter(midi);
}

export function resolveFundamentalMapKey(
    practice: RoutineChordsPractice | RoutineScalesPractice,
    generator: NumberGenerator,
): string {
    if (practice.baseNote) {
        return practice.baseNote;
    }
    const keys = CHORD_REGISTRY_PRIMARY_MAP_KEYS;
    return keys[generator.rangeExclusiveI(0, keys.length)]!;
}

export function pickPoolIndex(
    mode: PracticePoolMode,
    poolLength: number,
    promptIndex: number,
    generator: NumberGenerator,
): number {
    if (poolLength <= 0) {
        return 0;
    }
    switch (mode) {
        case PracticePoolMode.Up:
            return promptIndex % poolLength;
        case PracticePoolMode.Down:
            return poolLength - 1 - (promptIndex % poolLength);
        case PracticePoolMode.Random:
            return generator.rangeExclusiveI(0, poolLength);
    }
}

export function midiVoicingForChordAtFundamental(chord: Chord, fundamentalMidi: number): number[] {
    const relative = chord.pattern.map((deg) => fundamentalMidi + (deg - 1));
    return relative;
}

export function tryBuildChordPrompt(
    chordType: ChordTypeId,
    fundamentalMapKey: string,
    settings: BakedRoutinePartSettings,
    generator: NumberGenerator,
    promptIndex: number,
    partOctave: number,
): Prompt | null {
    const chord = CHORDS[chordType][fundamentalMapKey];
    if (!chord) {
        return null;
    }
    const rootPc = chord.baseNote.pitchClass;
    const octSpan = resolvedChordScaleOctaveRange(settings.practice);
    let fundamental: number | null = null;
    for (let fund = rootPc; fund <= MAX_MIDI_NOTES; fund += 12) {
        if (scientificOctaveFromMidi(fund) !== partOctave) {
            continue;
        }
        const voicing = midiVoicingForChordAtFundamental(chord, fund);
        if (voicing.every((n) => n >= 0 && n <= MAX_MIDI_NOTES)) {
            if (midiInPracticeOctaveSpan(fund, octSpan)) {
                fundamental = fund;
                break;
            }
        }
    }
    if (fundamental === null) {
        return null;
    }
    const voicing = midiVoicingForChordAtFundamental(chord, fundamental);
    const note = voicing[generator.rangeExclusiveI(0, voicing.length)]!;
    const colorRoll = generator.rangeExclusiveI(0, colorOptions.length);
    return {
        index: promptIndex,
        notes: [note],
        color: colorOptions[colorRoll],
        displays: [{kind: "note", note: formatDisplayNote(settings.requireOctave, note)}],
    };
}

export function tryBuildScalePrompt(
    scaleType: ScaleTypeId,
    fundamentalMapKey: string,
    settings: BakedRoutinePartSettings,
    generator: NumberGenerator,
    promptIndex: number,
    partOctave: number,
): Prompt | null {
    const scale = getRegisteredScale(scaleType, fundamentalMapKey);
    const notes: number[] = [];
    for (let n = 0; n <= MAX_MIDI_NOTES; n++) {
        if (scale.contains(n) && scientificOctaveFromMidi(n) === partOctave) {
            notes.push(n);
        }
    }
    if (notes.length === 0) {
        return null;
    }
    const note = notes[generator.rangeExclusiveI(0, notes.length)]!;
    const colorRoll = generator.rangeExclusiveI(0, colorOptions.length);
    return {
        index: promptIndex,
        notes: [note],
        color: colorOptions[colorRoll],
        displays: [{kind: "note", note: formatDisplayNote(settings.requireOctave, note)}],
    };
}

export function generateNotePrompts(
    settings: BakedRoutinePartSettings,
    generator: NumberGenerator,
): Prompt[] {
    const practiceUntyped = settings.practice;
    if (practiceUntyped.type !== PracticeType.Notes) {
        return [];
    }
    const notePool = midiNotesForNoteRange(practiceUntyped.noteRange);
    if (notePool.length === 0) {
        return [];
    }
    const prompts: Prompt[] = [];
    for (let i = 0; i < settings.promptCount; i++) {
        const noteRoll = generator.rangeExclusiveI(0, notePool.length);
        const colorRoll = generator.rangeExclusiveI(0, colorOptions.length);
        const note = notePool[noteRoll];
        prompts.push({
            index: i,
            notes: [note],
            color: colorOptions[colorRoll],
            displays: [{kind: "note", note: formatDisplayNote(settings.requireOctave, note)}],
        });
    }
    shuffle(prompts, generator);
    return prompts;
}

export function generateChordPrompts(
    settings: BakedRoutinePartSettings,
    generator: NumberGenerator,
): Prompt[] {
    const practiceUntyped = settings.practice;
    if (practiceUntyped.type !== PracticeType.Chords) {
        return [];
    }
    const practice = practiceUntyped;
    const fundKey = resolveFundamentalMapKey(practice, generator);
    const pool =
        practice.chordTypes.length > 0 ? [...practice.chordTypes] : [...CHORD_TYPE_OPTIONS];
    const octSpan = resolvedChordScaleOctaveRange(practice);
    const lo = octSpan.start;
    const hi = octSpan.end;
    const partOctave = lo + generator.rangeExclusiveI(0, hi - lo + 1);
    const prompts: Prompt[] = [];
    let attempts = 0;
    const maxAttempts = settings.promptCount * 24;
    while (prompts.length < settings.promptCount && attempts < maxAttempts) {
        attempts++;
        const i = prompts.length;
        const chordType = pool[pickPoolIndex(practice.mode, pool.length, i, generator)];
        const built = tryBuildChordPrompt(
            chordType,
            fundKey,
            settings,
            generator,
            i,
            partOctave,
        );
        if (built) {
            prompts.push(built);
        }
    }
    shuffle(prompts, generator);
    return prompts;
}

export function generateScalePrompts(
    settings: BakedRoutinePartSettings,
    generator: NumberGenerator,
): Prompt[] {
    const practiceUntyped = settings.practice;
    if (practiceUntyped.type !== PracticeType.Scales) {
        return [];
    }
    const practice = practiceUntyped;
    const fundKey = resolveFundamentalMapKey(practice, generator);
    const pool = practice.scaleTypes.length > 0 ? [...practice.scaleTypes] : [...SCALE_TYPE_OPTIONS];
    const octSpan = resolvedChordScaleOctaveRange(practice);
    const lo = octSpan.start;
    const hi = octSpan.end;
    const partOctave = lo + generator.rangeExclusiveI(0, hi - lo + 1);
    const prompts: Prompt[] = [];
    let attempts = 0;
    const maxAttempts = settings.promptCount * 24;
    while (prompts.length < settings.promptCount && attempts < maxAttempts) {
        attempts++;
        const i = prompts.length;
        const scaleType = pool[pickPoolIndex(practice.mode, pool.length, i, generator)];
        const built = tryBuildScalePrompt(
            scaleType,
            fundKey,
            settings,
            generator,
            i,
            partOctave,
        );
        if (built) {
            prompts.push(built);
        }
    }
    shuffle(prompts, generator);
    return prompts;
}

export function generatePrompts(
    settings: BakedRoutinePartSettings,
    generator: NumberGenerator,
): Prompt[] {
    switch (settings.practice.type) {
        case PracticeType.Notes:
            return generateNotePrompts(settings, generator);
        case PracticeType.Chords:
            return generateChordPrompts(settings, generator);
        case PracticeType.Scales:
            return generateScalePrompts(settings, generator);
    }
}

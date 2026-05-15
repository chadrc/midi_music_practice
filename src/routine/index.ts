import {
    BakedRoutinePartSettings,
    CHORD_TYPE_OPTIONS,
    DEFAULT_PRACTICE_OCTAVE_RANGE,
    NoteRangeType,
    ParentType,
    PracticePoolMode,
    PracticeType,
    UserRoutinePartSettings,
    UserRoutinePractice,
    UserRoutineSettingsKeys,
    Routine,
    RoutinePart,
    RoutinePartSettings,
    RoutineSettings,
    Prompt,
    GeneratedRepetitionPrompts,
    type PromptDisplay,
    type FreePlaySetPrompt,
    type StandardPrompt,
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
    displayNameFromMapKey,
    getRegisteredScale,
    MAJOR_SCALE_SET_NAME,
    NoteScale,
    SCALES,
} from "../notes/scales";
import {CHORD_TYPE_LABEL, SCALE_TYPE_LABEL} from "../notes/notes";
import {CHORDS, Chord, MAJOR_CHORDS_SET_NAME, chordSpellPrefersFlats} from "../notes/chords";
import {clone, exists} from "../utilities";
import {NumberGenerator} from "../common/NumberGenerator";
import type {NumberRangeLike} from "../common/NumberRange";
import {
    midiNotesForNoteRange,
    STANDARD_TUNING_OPEN_FRET_NOTES,
} from "./midiNotesForNoteRange";

export {midiNotesForNoteRange, STANDARD_TUNING_OPEN_FRET_NOTES};
export {noteGridLayoutFromNoteRange, type NoteGridLayoutFromNoteRange} from "./noteGridLayout";

export const MAX_MIDI_NOTES = 127

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
                upDownOffsetUp: 0,
                upDownOffsetDown: 0,
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

/** Unique pitch classes from MIDI numbers (0…11), sorted ascending. */
export function pitchClassesFromMidis(midis: number[]): number[] {
    return [...new Set(midis.map((n) => ((n % 12) + 12) % 12))].sort((a, b) => a - b);
}

/** MIDI pitch class 0–11. */
function normPitchClass(midi: number): number {
    return ((midi % 12) + 12) % 12;
}

/**
 * Scale pitches in one scientific octave are collected low→high; rotate so the scale tonic (root)
 * comes first, then continue ascending through the octave. Required when the key’s root is not
 * the lowest MIDI in C–B octave layout (e.g. B major starts on C# in “piano order”).
 */
function rotateScaleMidisRootFirst(sortedAsc: number[], rootPitchClass: number): number[] {
    if (sortedAsc.length === 0) {
        return sortedAsc;
    }
    const i = sortedAsc.findIndex((n) => normPitchClass(n) === rootPitchClass);
    if (i <= 0) {
        return sortedAsc;
    }
    return [...sortedAsc.slice(i), ...sortedAsc.slice(0, i)];
}

/** MIDI values allowed for this part (notes pool + chord/scale filter). */
function playableMidiSet(settings: BakedRoutinePartSettings): Set<number> {
    return new Set(midiNotesForNoteRange(settings.noteRange));
}

/** Whole-octave shifts (prefer smallest |octaves|) until every chord tone lies in `allowed`; bounds 0…127. */
export function transposeChordVoicingIntoAllowed(
    voicing: number[],
    allowed: Set<number>,
): number[] | null {
    if (voicing.length === 0) {
        return [];
    }
    const maxOct = 11;
    const fits = (octaves: number): boolean =>
        voicing.every((n) => {
            const t = n + octaves * 12;
            return t >= 0 && t <= MAX_MIDI_NOTES && allowed.has(t);
        });
    for (let d = 0; d <= maxOct; d++) {
        if (d === 0) {
            if (fits(0)) {
                return voicing.slice();
            }
            continue;
        }
        for (const sign of [-1, 1] as const) {
            const k = sign * d;
            if (fits(k)) {
                return voicing.map((n) => n + k * 12);
            }
        }
    }
    return null;
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
                return getRegisteredScale(MAJOR_SCALE_SET_NAME, p.baseNote ?? BaseNotes.C.mapKey);
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
                p.scaleTypes.length > 0 ? p.scaleTypes : [MAJOR_SCALE_SET_NAME];
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

function makeChordScalePrompt(
    settings: BakedRoutinePartSettings,
    shared: {
        index: number;
        notes: number[];
        color: string;
        ensembleMidi: number[];
        ensemblePitchClasses: number[];
        staffFundamentalMapKey?: string;
        repeatFocusLabel?: string;
    },
    displays: PromptDisplay[],
): Prompt {
    if (settings.freePlayInSet) {
        const p: FreePlaySetPrompt = {
            type: "freePlaySet",
            index: shared.index,
            notes: shared.notes,
            color: shared.color,
            ensembleMidi: shared.ensembleMidi,
            ensemblePitchClasses: shared.ensemblePitchClasses,
        };
        if (shared.staffFundamentalMapKey !== undefined) {
            p.staffFundamentalMapKey = shared.staffFundamentalMapKey;
        }
        if (shared.repeatFocusLabel !== undefined) {
            p.repeatFocusLabel = shared.repeatFocusLabel;
        }
        return p;
    }
    const p: StandardPrompt = {
        index: shared.index,
        notes: shared.notes,
        color: shared.color,
        displays,
        ensembleMidi: shared.ensembleMidi,
        ensemblePitchClasses: shared.ensemblePitchClasses,
    };
    if (shared.staffFundamentalMapKey !== undefined) {
        p.staffFundamentalMapKey = shared.staffFundamentalMapKey;
    }
    if (shared.repeatFocusLabel !== undefined) {
        p.repeatFocusLabel = shared.repeatFocusLabel;
    }
    return p;
}

function resolvedPartRepeatCount(
    base: RoutinePartSettings,
    defaults: UserRoutinePartSettings | BakedRoutinePartSettings,
): number {
    const raw = base.repeatCount as unknown;
    if (raw !== undefined && raw !== null) {
        const baseN = Number(raw);
        if (Number.isFinite(baseN)) {
            return Math.max(0, Math.floor(baseN));
        }
    }
    const d = (defaults as Partial<BakedRoutinePartSettings>).repeatCount;
    if (d !== undefined && d !== null) {
        const defN = Number(d as unknown);
        if (Number.isFinite(defN)) {
            return Math.max(0, Math.floor(defN));
        }
    }
    return 1;
}

export const resolveValues = (
    base: RoutinePartSettings,
    defaults: UserRoutinePartSettings | BakedRoutinePartSettings,
): BakedRoutinePartSettings => {
    const toClone: UserRoutineSettingsKeys = [
        "name",
        "targetBPM",
        "noteRange",
        "practice",
        "requireOctave",
        "minSuccessVelocity",
        "promptCount",
        "freePlayInSet",
        "maxConsecutiveSamePitchSuccess",
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

    /* Parent defaults can be a full {@link BakedRoutinePartSettings} (First/Previous).
     * Its repeatCount / cloneRepeat / parentSettings must not override this part's. */
    baked.repeatCount = resolvedPartRepeatCount(base, defaults);
    baked.cloneRepeat = base.cloneRepeat;
    baked.parentSettings = base.parentSettings;

    if (!exists(baked.practice)) {
        baked.practice = defaultPracticeForType(PracticeType.Notes);
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

    const repetitions: RoutinePart["repetitions"] = [];

    const raw = Number(settings.repeatCount as unknown);
    const repeatN = Number.isFinite(raw) ? Math.max(0, Math.floor(raw)) : 0;
    const totalReps = repeatN + 1;
    if (settings.cloneRepeat) {
        const rep = generatePrompts(settings, generator, 0);
        for (let i = 0; i < totalReps; i++) {
            repetitions.push({
                prompts: clone(rep.prompts),
                ...packRepeatFocus(rep),
            });
        }
    } else {
        for (let i = 0; i < totalReps; i++) {
            const rep = generatePrompts(settings, generator, i);
            repetitions.push({
                prompts: rep.prompts,
                ...packRepeatFocus(rep),
            });
        }
    }

    return {
        name: settings.name,
        generator,
        repetitions,
        bakedSettings: settings,
    };
};

function packRepeatFocus(rep: GeneratedRepetitionPrompts): {repeatFocusLabel?: string} {
    return rep.repeatFocusLabel !== undefined
        ? {repeatFocusLabel: rep.repeatFocusLabel}
        : {};
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

/** Uniform random permutation (Fisher–Yates). */
function shufflePermutationInPlace<T>(items: T[], generator: NumberGenerator): void {
    for (let i = items.length - 1; i > 0; i--) {
        const j = generator.rangeExclusiveI(0, i + 1);
        const tmp = items[i]!;
        items[i] = items[j]!;
        items[j] = tmp;
    }
}

function chordRepeatFocusLabel(
    fundKey: string,
    practice: RoutineChordsPractice,
    pool: ChordTypeId[],
    randomChordType: ChordTypeId | undefined,
): string {
    const root = displayNameFromMapKey(fundKey);
    const typesLegend = pool.map((t) => CHORD_TYPE_LABEL[t]).join(", ");
    if (practice.mode === PracticePoolMode.Random && randomChordType !== undefined) {
        return `${root} ${CHORD_TYPE_LABEL[randomChordType]}`;
    }
    return `${root} ${typesLegend}`;
}

function chordPromptFocusLabel(fundKey: string, chordType: ChordTypeId): string {
    return `${displayNameFromMapKey(fundKey)} ${CHORD_TYPE_LABEL[chordType]}`;
}

function scaleRepeatFocusLabel(
    fundKey: string,
    practice: RoutineScalesPractice,
    pool: ScaleTypeId[],
    randomScaleType: ScaleTypeId | undefined,
    upDownLeg: "up" | "down" | null,
): string {
    const root = displayNameFromMapKey(fundKey);
    const typesLegend = pool.map((t) => SCALE_TYPE_LABEL[t]).join(", ");
    if (practice.mode === PracticePoolMode.Random && randomScaleType !== undefined) {
        return `${root} ${SCALE_TYPE_LABEL[randomScaleType]}`;
    }
    let base = `${root} ${typesLegend}`;
    if (practice.mode === PracticePoolMode.UpDown && upDownLeg !== null) {
        base = `${base} (${upDownLeg})`;
    }
    return base;
}

export const generateNotesForRange = (settings: Pick<BakedRoutinePartSettings, "noteRange">) => {
    return midiNotesForNoteRange(settings.noteRange);
};

export function formatDisplayNote(requireOctave: boolean, midi: number, chordType?: ChordTypeId): string {
    const preferFlats = chordType !== undefined && chordSpellPrefersFlats(chordType);
    return requireOctave ? formatMidiNote(midi, preferFlats) : formatMidiLetter(midi, preferFlats);
}

function effectiveScaleTypesPool(practice: RoutineScalesPractice): ScaleTypeId[] {
    return practice.scaleTypes.length > 0 ? [...practice.scaleTypes] : [MAJOR_SCALE_SET_NAME];
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
        case PracticePoolMode.UpDown:
            return promptIndex % poolLength;
        case PracticePoolMode.Down:
            return poolLength - 1 - (promptIndex % poolLength);
        case PracticePoolMode.Random:
            return generator.rangeExclusiveI(0, poolLength);
    }
}

/** Uniform random chord quality from `pool` that exists for `fundamentalMapKey`. */
export function pickRandomChordTypeForFundamental(
    pool: ChordTypeId[],
    fundamentalMapKey: string,
    generator: NumberGenerator,
): ChordTypeId | null {
    const viable = pool.filter((t) => CHORDS[t][fundamentalMapKey]);
    if (viable.length === 0) {
        return null;
    }
    return viable[generator.rangeExclusiveI(0, viable.length)]!;
}

function fundamentalMidiForChordInPartOctave(
    chord: Chord,
    partOctave: number,
    octSpan: NumberRangeLike,
): number | null {
    const rootPc = chord.baseNote.pitchClass;
    for (let fund = rootPc; fund <= MAX_MIDI_NOTES; fund += 12) {
        if (scientificOctaveFromMidi(fund) !== partOctave) {
            continue;
        }
        const voicing = midiVoicingForChordAtFundamental(chord, fund);
        if (voicing.every((n) => n >= 0 && n <= MAX_MIDI_NOTES)) {
            if (midiInPracticeOctaveSpan(fund, octSpan)) {
                return fund;
            }
        }
    }
    return null;
}

function orderedPartOctaves(lo: number, hi: number, up: boolean): number[] {
    const span = hi - lo + 1;
    return Array.from({length: span}, (_, k) => (up ? lo + k : hi - k));
}

/** Each entry is one chord voicing (low→high) in traversal order plus its quality id. */
function chordToneMidiSegmentsOrdered(
    pool: ChordTypeId[],
    fundamentalMapKey: string,
    settings: BakedRoutinePartSettings,
    up: boolean,
): {voicing: number[]; chordType: ChordTypeId}[] {
    const practice = settings.practice;
    if (practice.type !== PracticeType.Chords) {
        return [];
    }
    const allowed = playableMidiSet(settings);
    const octSpan = resolvedChordScaleOctaveRange(practice);
    const lo = octSpan.start;
    const hi = octSpan.end;
    const segments: {voicing: number[]; chordType: ChordTypeId}[] = [];
    for (const partOct of orderedPartOctaves(lo, hi, up)) {
        for (const chordType of pool) {
            const chord = CHORDS[chordType][fundamentalMapKey];
            if (!chord) {
                continue;
            }
            const fund = fundamentalMidiForChordInPartOctave(chord, partOct, octSpan);
            if (fund === null) {
                continue;
            }
            const raw = midiVoicingForChordAtFundamental(chord, fund);
            const fitted = transposeChordVoicingIntoAllowed(raw, allowed);
            if (fitted === null) {
                continue;
            }
            const traversal = up ? fitted : [...fitted].reverse();
            segments.push({voicing: traversal, chordType});
        }
    }
    return segments;
}

/** Each inner array is one scale’s degrees in one nominal part octave, root first, whole-octave-shifted into {@link playableMidiSet} when possible (same as chord voicings). */
function scaleToneMidiSegmentsOrdered(
    pool: ScaleTypeId[],
    fundamentalMapKey: string,
    settings: BakedRoutinePartSettings,
    up: boolean,
): number[][] {
    const practice = settings.practice;
    if (practice.type !== PracticeType.Scales) {
        return [];
    }
    const allowed = playableMidiSet(settings);
    const octSpan = resolvedChordScaleOctaveRange(practice);
    const lo = octSpan.start;
    const hi = octSpan.end;
    const segments: number[][] = [];
    for (const partOct of orderedPartOctaves(lo, hi, up)) {
        for (const scaleType of pool) {
            const scale = getRegisteredScale(scaleType, fundamentalMapKey);
            const inOct: number[] = [];
            for (let n = 0; n <= MAX_MIDI_NOTES; n++) {
                if (scale.contains(n) && scientificOctaveFromMidi(n) === partOct) {
                    inOct.push(n);
                }
            }
            inOct.sort((a, b) => a - b);
            const rootPc = scale.fundamental.pitchClass;
            const rootFirst = rotateScaleMidisRootFirst(inOct, rootPc);
            const fitted = transposeChordVoicingIntoAllowed(rootFirst, allowed);
            if (fitted === null) {
                continue;
            }
            const traversal = up ? fitted : [...fitted].reverse();
            segments.push(traversal);
        }
    }
    return segments;
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
    const octSpan = resolvedChordScaleOctaveRange(settings.practice);
    const fundamental = fundamentalMidiForChordInPartOctave(chord, partOctave, octSpan);
    if (fundamental === null) {
        return null;
    }
    const rawVoicing = midiVoicingForChordAtFundamental(chord, fundamental);
    const allowed = playableMidiSet(settings);
    const voicing = transposeChordVoicingIntoAllowed(rawVoicing, allowed);
    if (voicing === null) {
        return null;
    }
    const note = voicing[generator.rangeExclusiveI(0, voicing.length)]!;
    const colorRoll = generator.rangeExclusiveI(0, colorOptions.length);
    return makeChordScalePrompt(
        settings,
        {
            index: promptIndex,
            notes: [note],
            color: colorOptions[colorRoll],
            ensembleMidi: voicing,
            ensemblePitchClasses: pitchClassesFromMidis(voicing),
            staffFundamentalMapKey: fundamentalMapKey,
        },
        [{kind: "note", note: formatDisplayNote(settings.requireOctave, note, chordType)}],
    );
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
    const allowed = playableMidiSet(settings);
    const choices = notes.filter((n) => allowed.has(n));
    if (choices.length === 0) {
        return null;
    }
    const note = choices[generator.rangeExclusiveI(0, choices.length)]!;
    const colorRoll = generator.rangeExclusiveI(0, colorOptions.length);
    return makeChordScalePrompt(
        settings,
        {
            index: promptIndex,
            notes: [note],
            color: colorOptions[colorRoll],
            ensembleMidi: choices,
            ensemblePitchClasses: pitchClassesFromMidis(notes),
            staffFundamentalMapKey: fundamentalMapKey,
        },
        [{kind: "note", note: formatDisplayNote(settings.requireOctave, note)}],
    );
}

export function generateNotePrompts(
    settings: BakedRoutinePartSettings,
    generator: NumberGenerator,
): GeneratedRepetitionPrompts {
    const practiceUntyped = settings.practice;
    if (practiceUntyped.type !== PracticeType.Notes) {
        return {prompts: []};
    }
    const notePool = midiNotesForNoteRange(settings.noteRange);
    if (notePool.length === 0) {
        return {prompts: []};
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
    return {prompts};
}

export function generateChordPrompts(
    settings: BakedRoutinePartSettings,
    generator: NumberGenerator,
    repetitionIndex = 0,
): GeneratedRepetitionPrompts {
    const practiceUntyped = settings.practice;
    if (practiceUntyped.type !== PracticeType.Chords) {
        return {prompts: []};
    }
    const practice = practiceUntyped;
    const fundKey = resolveFundamentalMapKey(practice, generator);
    const pool =
        practice.chordTypes.length > 0 ? [...practice.chordTypes] : [...CHORD_TYPE_OPTIONS];
    const prompts: Prompt[] = [];
    const allowed = playableMidiSet(settings);
    if (allowed.size === 0) {
        return {prompts: []};
    }

    if (practice.mode === PracticePoolMode.Random) {
        const octSpan = resolvedChordScaleOctaveRange(practice);
        const lo = octSpan.start;
        const hi = octSpan.end;
        const span = hi - lo + 1;
        const randomPartOctave = lo + generator.rangeExclusiveI(0, span);

        if (!pool.some((t) => CHORDS[t][fundKey])) {
            return {prompts: []};
        }

        const repeatFocusLabel = chordRepeatFocusLabel(fundKey, practice, pool, undefined);
        const multiTypePool = pool.length > 1;

        let cycleVoicing: number[] | null = null;
        let cycleChordType: ChordTypeId | null = null;
        let cycleIndex = 0;
        let attempts = 0;
        const maxAttempts = settings.promptCount * 24;
        while (prompts.length < settings.promptCount && attempts < maxAttempts) {
            attempts++;
            const i = prompts.length;
            if (!cycleVoicing || cycleIndex >= cycleVoicing.length) {
                const chordType = pickRandomChordTypeForFundamental(pool, fundKey, generator);
                if (chordType === null) {
                    return {prompts, repeatFocusLabel};
                }
                const chord = CHORDS[chordType][fundKey];
                if (!chord) {
                    return {prompts, repeatFocusLabel};
                }
                const fundamental = fundamentalMidiForChordInPartOctave(chord, randomPartOctave, octSpan);
                if (fundamental === null) {
                    return {prompts, repeatFocusLabel};
                }
                const rawVoicing = midiVoicingForChordAtFundamental(chord, fundamental);
                if (rawVoicing.length === 0) {
                    return {prompts, repeatFocusLabel};
                }
                const fitted = transposeChordVoicingIntoAllowed(rawVoicing, allowed);
                if (fitted === null) {
                    cycleVoicing = null;
                    cycleChordType = null;
                    cycleIndex = 0;
                    continue;
                }
                cycleChordType = chordType;
                cycleVoicing = fitted.slice();
                shufflePermutationInPlace(cycleVoicing, generator);
                cycleIndex = 0;
            }
            const note = cycleVoicing[cycleIndex]!;
            cycleIndex++;
            const colorRoll = generator.rangeExclusiveI(0, colorOptions.length);
            const ensembleMidi = cycleVoicing.slice();
            const ensemblePitchClasses = pitchClassesFromMidis(cycleVoicing);
            prompts.push(
                makeChordScalePrompt(
                    settings,
                    {
                        index: i,
                        notes: [note],
                        color: colorOptions[colorRoll],
                        ensembleMidi,
                        ensemblePitchClasses,
                        staffFundamentalMapKey: fundKey,
                        repeatFocusLabel:
                            multiTypePool && cycleChordType !== null
                                ? chordPromptFocusLabel(fundKey, cycleChordType)
                                : undefined,
                    },
                    [
                        {
                            kind: "note",
                            note: formatDisplayNote(settings.requireOctave, note, cycleChordType ?? undefined),
                        },
                    ],
                ),
            );
        }
        return {prompts, repeatFocusLabel};
    }

    const repeatFocusLabel = chordRepeatFocusLabel(fundKey, practice, pool, undefined);
    const multiTypePool = pool.length > 1;
    let up: boolean;
    if (practice.mode === PracticePoolMode.Down) {
        up = false;
    } else if (practice.mode === PracticePoolMode.UpDown) {
        up = repetitionIndex % 2 === 0;
    } else {
        up = practice.mode === PracticePoolMode.Up;
    }
    const segments = chordToneMidiSegmentsOrdered(pool, fundKey, settings, up);
    const steps: {
        target: number;
        ensemble: number[];
        ensemblePitchClasses: number[];
        chordType: ChordTypeId;
    }[] = [];
    for (const seg of segments) {
        const ensemblePitchClasses = pitchClassesFromMidis(seg.voicing);
        for (const target of seg.voicing) {
            steps.push({
                target,
                ensemble: seg.voicing,
                ensemblePitchClasses,
                chordType: seg.chordType,
            });
        }
    }
    if (steps.length === 0) {
        return {prompts: []};
    }
    for (let i = 0; i < settings.promptCount; i++) {
        const {target, ensemble, ensemblePitchClasses, chordType} = steps[i % steps.length]!;
        const colorRoll = generator.rangeExclusiveI(0, colorOptions.length);
        prompts.push(
            makeChordScalePrompt(
                settings,
                {
                    index: i,
                    notes: [target],
                    color: colorOptions[colorRoll],
                    ensembleMidi: ensemble,
                    ensemblePitchClasses,
                    staffFundamentalMapKey: fundKey,
                    repeatFocusLabel: multiTypePool
                        ? chordPromptFocusLabel(fundKey, chordType)
                        : undefined,
                },
                [{kind: "note", note: formatDisplayNote(settings.requireOctave, target, chordType)}],
            ),
        );

    }
    return {prompts, repeatFocusLabel};
}

export function rotateScaleSegmentOrdered(segment: number[], rawOffset: number): number[] {
    const L = segment.length;
    if (L === 0) {
        return segment;
    }
    const o = Math.floor(rawOffset);
    const offset = Math.max(0, Math.min(L - 1, o));
    return [...segment.slice(offset), ...segment.slice(0, offset)];
}

export function generateScalePrompts(
    settings: BakedRoutinePartSettings,
    generator: NumberGenerator,
    repetitionIndex = 0,
): GeneratedRepetitionPrompts {
    const practiceUntyped = settings.practice;
    if (practiceUntyped.type !== PracticeType.Scales) {
        return {prompts: []};
    }
    const practice = practiceUntyped;
    const fundKey = resolveFundamentalMapKey(practice, generator);
    const pool = effectiveScaleTypesPool(practice);
    const prompts: Prompt[] = [];
    const allowed = playableMidiSet(settings);
    if (allowed.size === 0) {
        return {prompts: []};
    }

    if (practice.mode === PracticePoolMode.Random) {
        const octSpan = resolvedChordScaleOctaveRange(practice);
        const lo = octSpan.start;
        const hi = octSpan.end;
        const span = hi - lo + 1;
        const randomPartOctave = lo + generator.rangeExclusiveI(0, span);

        let scaleType: ScaleTypeId | null = null;
        const maxTypePicks = Math.max(32, pool.length * 8);
        for (let pick = 0; pick < maxTypePicks; pick++) {
            const t = pool[pickPoolIndex(practice.mode, pool.length, 0, generator)]!;
            const scale = getRegisteredScale(t, fundKey);
            let hasInOctave = false;
            for (let n = 0; n <= MAX_MIDI_NOTES; n++) {
                if (scale.contains(n) && scientificOctaveFromMidi(n) === randomPartOctave) {
                    hasInOctave = true;
                    break;
                }
            }
            if (hasInOctave) {
                scaleType = t;
                break;
            }
        }
        if (scaleType === null) {
            return {prompts: []};
        }

        const repeatFocusLabel = scaleRepeatFocusLabel(fundKey, practice, pool, scaleType, null);

        const scale = getRegisteredScale(scaleType, fundKey);
        const ensembleMidi: number[] = [];
        for (let n = 0; n <= MAX_MIDI_NOTES; n++) {
            if (scale.contains(n) && scientificOctaveFromMidi(n) === randomPartOctave && allowed.has(n)) {
                ensembleMidi.push(n);
            }
        }
        ensembleMidi.sort((a, b) => a - b);
        if (ensembleMidi.length === 0) {
            return {prompts: []};
        }

        const fullOctMidis: number[] = [];
        for (let n = 0; n <= MAX_MIDI_NOTES; n++) {
            if (scale.contains(n) && scientificOctaveFromMidi(n) === randomPartOctave) {
                fullOctMidis.push(n);
            }
        }
        const ensemblePitchClasses = pitchClassesFromMidis(fullOctMidis);

        let cycleNotes: number[] | null = null;
        let cycleIndex = 0;
        let attempts = 0;
        const maxAttempts = settings.promptCount * 24;
        while (prompts.length < settings.promptCount && attempts < maxAttempts) {
            attempts++;
            const i = prompts.length;
            if (!cycleNotes || cycleIndex >= cycleNotes.length) {
                const scale = getRegisteredScale(scaleType, fundKey);
                const notes: number[] = [];
                for (let n = 0; n <= MAX_MIDI_NOTES; n++) {
                    if (scale.contains(n) && scientificOctaveFromMidi(n) === randomPartOctave) {
                        notes.push(n);
                    }
                }
                if (notes.length === 0) {
                    return {prompts, repeatFocusLabel};
                }
                notes.sort((a, b) => a - b);
                shufflePermutationInPlace(notes, generator);
                cycleNotes = notes;
                cycleIndex = 0;
            }
            const note = cycleNotes[cycleIndex]!;
            cycleIndex++;
            if (!allowed.has(note)) {
                continue;
            }
            const colorRoll = generator.rangeExclusiveI(0, colorOptions.length);
            prompts.push(
                makeChordScalePrompt(
                    settings,
                    {
                        index: i,
                        notes: [note],
                        color: colorOptions[colorRoll],
                        ensembleMidi,
                        ensemblePitchClasses,
                        staffFundamentalMapKey: fundKey,
                    },
                    [{kind: "note", note: formatDisplayNote(settings.requireOctave, note)}],
                ),
            );
        }
        return {prompts, repeatFocusLabel};
    }

    const upLeg =
        practice.mode === PracticePoolMode.UpDown ? repetitionIndex % 2 === 0 : practice.mode === PracticePoolMode.Up;
    const upDownLeg: "up" | "down" | null =
        practice.mode === PracticePoolMode.UpDown ? (upLeg ? "up" : "down") : null;
    const repeatFocusLabel = scaleRepeatFocusLabel(fundKey, practice, pool, undefined, upDownLeg);
    const up = upLeg;
    const degreeOffset =
        practice.mode === PracticePoolMode.UpDown
            ? upLeg
                ? (practice.upDownOffsetUp ?? 0)
                : (practice.upDownOffsetDown ?? 0)
            : 0;
    const segments = scaleToneMidiSegmentsOrdered(pool, fundKey, settings, up);
    const steps: {target: number; ensemble: number[]; ensemblePitchClasses: number[]}[] = [];
    for (const seg of segments) {
        const rotatedSeg = rotateScaleSegmentOrdered(seg, degreeOffset);
        const ensemblePitchClasses = pitchClassesFromMidis(seg);
        const ensemble = rotatedSeg.filter((n) => allowed.has(n));
        if (ensemble.length === 0) {
            continue;
        }
        for (const target of ensemble) {
            steps.push({target, ensemble, ensemblePitchClasses});
        }
    }
    if (steps.length === 0) {
        return {prompts: []};
    }
    for (let i = 0; i < settings.promptCount; i++) {
        const {target, ensemble, ensemblePitchClasses} = steps[i % steps.length]!;
        const colorRoll = generator.rangeExclusiveI(0, colorOptions.length);
        prompts.push(
            makeChordScalePrompt(
                settings,
                {
                    index: i,
                    notes: [target],
                    color: colorOptions[colorRoll],
                    ensembleMidi: ensemble,
                    ensemblePitchClasses,
                    staffFundamentalMapKey: fundKey,
                },
                [{kind: "note", note: formatDisplayNote(settings.requireOctave, target)}],
            ),
        );
    }
    return {prompts, repeatFocusLabel};
}

export function generatePrompts(
    settings: BakedRoutinePartSettings,
    generator: NumberGenerator,
    repetitionIndex = 0,
): GeneratedRepetitionPrompts {
    switch (settings.practice.type) {
        case PracticeType.Notes:
            return generateNotePrompts(settings, generator);
        case PracticeType.Chords:
            return generateChordPrompts(settings, generator, repetitionIndex);
        case PracticeType.Scales:
            return generateScalePrompts(settings, generator, repetitionIndex);
    }
}

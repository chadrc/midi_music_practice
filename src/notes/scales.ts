import {exists} from "../utilities";

/** Map key spellings like `CSharp` / `BFlat` to display text (same rules as scale UI). */
export function displayNameFromMapKey(mapKey: string): string {
    return mapKey.replace("Flat", "♭").replace("Sharp", "#");
}

/**
 * Pitch root for a scale or chord: MIDI pitch class 0–11 (C=0, …, B=11).
 * Two concrete kinds: seven letter-only spellings and enharmonic spellings (each instance is one registry key).
 */
export abstract class BaseNote {
    protected constructor(readonly pitchClass: number) {
        if (!Number.isInteger(pitchClass) || pitchClass < 0 || pitchClass > 11) {
            throw new RangeError(
                `BaseNote: pitchClass must be an integer 0–11, got ${String(pitchClass)}`,
            );
        }
    }

    /** Stable key for {@link SCALES}, {@link CHORDS_MAP}, and persisted `scale.baseNote` (e.g. `CSharp`, `BFlat`). */
    abstract readonly mapKey: string;

    /** Readable name; enharmonic roots include both spellings separated by `/`. */
    abstract getName(): string;
}

/** Natural letter roots C … B (one spelling per pitch class). */
export class LetterBaseNote extends BaseNote {
    constructor(pitchClass: number, readonly mapKey: string) {
        super(pitchClass);
    }

    getName(): string {
        return displayNameFromMapKey(this.mapKey);
    }
}

/** One spelling of an enharmonic pair; same {@link pitchClass} as the alternate spelling, different {@link mapKey}. */
export class EnharmonicBaseNote extends BaseNote {
    constructor(
        pitchClass: number,
        readonly mapKey: string,
        readonly alternateMapKey: string,
    ) {
        super(pitchClass);
    }

    getName(): string {
        return `${displayNameFromMapKey(this.mapKey)}/${displayNameFromMapKey(this.alternateMapKey)}`;
    }
}

export const BaseNotes = {
    C: new LetterBaseNote(0, "C"),
    CSharp: new EnharmonicBaseNote(1, "CSharp", "DFlat"),
    DFlat: new EnharmonicBaseNote(1, "DFlat", "CSharp"),
    D: new LetterBaseNote(2, "D"),
    DSharp: new EnharmonicBaseNote(3, "DSharp", "EFlat"),
    EFlat: new EnharmonicBaseNote(3, "EFlat", "DSharp"),
    E: new LetterBaseNote(4, "E"),
    F: new LetterBaseNote(5, "F"),
    FSharp: new EnharmonicBaseNote(6, "FSharp", "GFlat"),
    GFlat: new EnharmonicBaseNote(6, "GFlat", "FSharp"),
    G: new LetterBaseNote(7, "G"),
    GSharp: new EnharmonicBaseNote(8, "GSharp", "AFlat"),
    AFlat: new EnharmonicBaseNote(8, "AFlat", "GSharp"),
    A: new LetterBaseNote(9, "A"),
    ASharp: new EnharmonicBaseNote(10, "ASharp", "BFlat"),
    BFlat: new EnharmonicBaseNote(10, "BFlat", "ASharp"),
    B: new LetterBaseNote(11, "B"),
} as const;

export type BaseNoteRef = (typeof BaseNotes)[keyof typeof BaseNotes];

/**
 * Each value `d` is interpreted as (d − 1) semitones above the root (1 = P1, 2 = m2, …, 12 = 11 semitones, i.e. M7 — e.g. in C major, 1 = C and 12 = B, not the root an octave up). Same encoding as IONIAN_MODE_PATTERN.
 */
export type ScaleDegreePattern = number[];

function assertPitchClassDegree(baseNote: number, deg: number): void {
    if (!Number.isInteger(baseNote) || baseNote < 0 || baseNote > 11) {
        throw new RangeError(
            `NoteScale: baseNote must be an integer 0–11, got ${String(baseNote)}`,
        );
    }
    if (!Number.isInteger(deg) || deg < 1) {
        throw new RangeError(
            `NoteScale: each degree must be a positive integer (1 = unison, …), got ${String(deg)}`,
        );
    }
}

function pitchClassFromDegrees(baseNote: number, pattern: number[]): number[] {
    return pattern.map((deg) => {
        assertPitchClassDegree(baseNote, deg);
        return (baseNote + (deg - 1)) % 12;
    });
}

export class Chord {
    public readonly baseNote: BaseNoteRef;
    public readonly pattern: ScaleDegreePattern;

    /**
     * @param pattern Semitone degrees from root, same encoding as {@link NoteScale} (e.g. `MAJOR_CHORD_PATTERN`).
     */
    constructor(baseNote: BaseNoteRef, pattern: ScaleDegreePattern) {
        this.baseNote = baseNote;
        this.pattern = pattern;
    }

    get fundamental(): BaseNoteRef {
        return this.baseNote;
    }
}

export class NoteScale {
    public readonly notes: number[];
    private readonly root: BaseNoteRef;

    /**
     * @param pattern Each `d` encodes (d−1) semitones from the root (1 = root, 12 = M7, not P8). E.g. `IONIAN_MODE_PATTERN`.
     */
    constructor(
        baseNote: BaseNoteRef,
        pattern: ScaleDegreePattern,
    ) {
        this.root = baseNote;
        this.notes = pitchClassFromDegrees(baseNote.pitchClass, pattern);
    }

    public get fundamental(): BaseNoteRef {
        return this.root;
    }

    public contains(note: number): boolean {
        if (note < 0 || note > 127) {
            return false;
        }

        const col = note % 12;

        for (const scaleNote of this.notes) {
            if (col === scaleNote) {
                return true;
            }
        }

        return false;
    }

    /** True if every pitch class of `chord` is a note of this scale. */
    public containsChord(chord: Chord): boolean {
        const chordPcs = pitchClassFromDegrees(chord.baseNote.pitchClass, chord.pattern);
        for (const pc of chordPcs) {
            if (!this.notes.includes(pc)) {
                return false;
            }
        }
        return true;
    }
}

export const MINOR_CHORDS_SET_NAME = "MINOR";
export const MAJOR_CHORDS_SET_NAME = "MAJOR";
export const DIMINISHED_CHORDS_SET_NAME = "DIMINISHED";

export const MAJOR_CHORD_PATTERN = [1, 5, 8]
export const MAJOR_7TH_CHORD_PATHERN = [1, 5, 8, 12]
export const MINOR_CHORD_PATTERN = [1, 4, 8]
export const MINOR_7th_CHORD_PATTERN = [1, 4, 8, 11]
export const DIMINISHED_CHORD_PATTERN = [1, 4, 7]
export const DIMINISHED_7TH_CHORD_PATTERN = [1, 4, 7, 10]
export const HALF_DIMINISHED_7TH_CHORD_PATTERN = [1, 4, 7, 11]
export const AUGMENTED_CHORD_PATTERN = [1, 5, 9]
export const AUGMENTED_7TH_CHORD_PATTERN = [1, 5, 9, 11]
export const DOMINANT_7TH_CHORD_PATTERN = [1, 5, 8, 11]
export const DOMINANT_9TH_CHORD_PATTERN = [1, 5, 8, 11, 15]
export const MAJOR_6TH_CHORD_PATTERN = [1, 5, 8, 10]
export const MINOR_6TH_CHORD_PATTERN = [1, 4, 8, 10]
export const SUS_2_CHORD_PATTERN = [1, 3, 8]
export const SUS_4_CHORD_PATTERN = [1, 6, 8]
export const ADD_9_CHORD_PATTERN = [1, 5, 8, 15]
export const ADD_2_CHORD_PATTERN = [1, 3, 5, 8]
export const FIVE_CHORD_PATTERN = [1, 8]

// Diatonic mode degree patterns: Ionian → … → Locrian
export const IONIAN_MODE_PATTERN = [1, 3, 5, 6, 8, 10, 12]
export const DORIAN_MODE_PATTERN = [1, 3, 4, 6, 8, 10, 11]
export const PHRYGIAN_MODE_PATTERN = [1, 2, 4, 6, 8, 9, 11]
export const LYDIAN_MODE_PATTERN = [1, 3, 5, 7, 8, 10, 12]
export const MIXOLYDIAN_MODE_PATTERN = [1, 3, 5, 6, 8, 10, 11]
export const AEOLIAN_MODE_PATTERN = [1, 3, 4, 6, 8, 9, 11]
export const LOCRIAN_MODE_PATTERN = [1, 2, 4, 6, 7, 9, 11]

export const CHROMATIC_DEGREES: ScaleDegreePattern = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
export const MAJOR_PENTATONIC_DEGREES: ScaleDegreePattern = [1, 3, 5, 8, 10]
export const MINOR_PENTATONIC_DEGREES: ScaleDegreePattern = [1, 4, 6, 8, 11]

// When NoteScale held per-degree chord type labels, these paired with IONIAN / AEOLIAN for diatonic harmony.
// export const MAJOR_SCALE_CHORDS = [MAJOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME, MAJOR_CHORDS_SET_NAME, MAJOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME, DIMINISHED_CHORDS_SET_NAME];
// export const MINOR_SCALE_CHORDS = [MINOR_CHORDS_SET_NAME, DIMINISHED_CHORDS_SET_NAME, MAJOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME, MINOR_CHORDS_SET_NAME, MAJOR_CHORDS_SET_NAME, MAJOR_CHORDS_SET_NAME]

/** Twelve key roots with mixed sharp/flat spelling (same set as legacy IONIAN / Major registration). */
const DIATONIC_KEY_ROOTS: BaseNoteRef[] = [
    BaseNotes.A,
    BaseNotes.ASharp,
    BaseNotes.B,
    BaseNotes.C,
    BaseNotes.CSharp,
    BaseNotes.D,
    BaseNotes.DSharp,
    BaseNotes.E,
    BaseNotes.F,
    BaseNotes.FSharp,
    BaseNotes.G,
    BaseNotes.GSharp,
];

const SCALES_MAP: { [key: string]: { [key: string]: NoteScale } } = {}
const CHORDS_MAP: { [key: string]: { [key: string]: Chord } } = {}

const registerScale = (baseNote: BaseNoteRef, pattern: number[], setName: string) => {
    const scale = new NoteScale(baseNote, pattern);
    if (!exists(SCALES_MAP[setName])) {
        SCALES_MAP[setName] = {};
    }

    const set = SCALES_MAP[setName];
    set[baseNote.mapKey] = scale;
}

// ——— Chromatic (single registration, C only) ———
export const CHROMATIC_SCALE_SET_NAME = "Chromatic"
registerScale(
    BaseNotes.C,
    CHROMATIC_DEGREES,
    CHROMATIC_SCALE_SET_NAME
);

// ——— Diatonic modes: Ionian (Major) → Dorian → Phrygian → Lydian → Mixolydian → Aeolian (Minor) → Locrian ———
export const MAJOR_SCALE_SET_NAME = "Major";
DIATONIC_KEY_ROOTS.forEach((note) => registerScale(note, IONIAN_MODE_PATTERN, MAJOR_SCALE_SET_NAME));

export const DORIAN_SCALE_SET_NAME = "Dorian";
DIATONIC_KEY_ROOTS.forEach((note) => registerScale(note, DORIAN_MODE_PATTERN, DORIAN_SCALE_SET_NAME));

export const PHRYGIAN_SCALE_SET_NAME = "Phrygian";
DIATONIC_KEY_ROOTS.forEach((note) => registerScale(note, PHRYGIAN_MODE_PATTERN, PHRYGIAN_SCALE_SET_NAME));

export const LYDIAN_SCALE_SET_NAME = "Lydian";
DIATONIC_KEY_ROOTS.forEach((note) => registerScale(note, LYDIAN_MODE_PATTERN, LYDIAN_SCALE_SET_NAME));

export const MIXOLYDIAN_SCALE_SET_NAME = "Mixolydian";
DIATONIC_KEY_ROOTS.forEach((note) => registerScale(note, MIXOLYDIAN_MODE_PATTERN, MIXOLYDIAN_SCALE_SET_NAME));

export const MINOR_SCALE_SET_NAME = "Minor";
DIATONIC_KEY_ROOTS.forEach((note) => registerScale(note, AEOLIAN_MODE_PATTERN, MINOR_SCALE_SET_NAME));

export const LOCRIAN_SCALE_SET_NAME = "Locrian";
DIATONIC_KEY_ROOTS.forEach((note) => registerScale(note, LOCRIAN_MODE_PATTERN, LOCRIAN_SCALE_SET_NAME));

// ——— Pentatonic ———
export const MAJOR_PENTATONIC_SCALE_SET_NAME = "MajorPentatonic";
DIATONIC_KEY_ROOTS.forEach((note) => registerScale(note, MAJOR_PENTATONIC_DEGREES, MAJOR_PENTATONIC_SCALE_SET_NAME));

export const MINOR_PENTATONIC_SCALE_SET_NAME = "MinorPentatonic";
DIATONIC_KEY_ROOTS.forEach((note) => registerScale(note, MINOR_PENTATONIC_DEGREES, MINOR_PENTATONIC_SCALE_SET_NAME));

function makeChordsForPattern(degreePattern: ScaleDegreePattern) {
    const chords: {[key: string]: Chord} = {};

    [BaseNotes.C,
        BaseNotes.CSharp,
        BaseNotes.DFlat,
        BaseNotes.D,
        BaseNotes.DSharp,
        BaseNotes.EFlat,
        BaseNotes.E,
        BaseNotes.F,
        BaseNotes.FSharp,
        BaseNotes.GFlat,
        BaseNotes.G,
        BaseNotes.GSharp,
        BaseNotes.AFlat,
        BaseNotes.A,
        BaseNotes.ASharp,
        BaseNotes.BFlat,
        BaseNotes.B
    ].forEach((note) => {
        chords[note.mapKey] = new Chord(note, degreePattern)
    });

    return chords;
}

CHORDS_MAP[MINOR_CHORDS_SET_NAME] = makeChordsForPattern(MINOR_CHORD_PATTERN);
CHORDS_MAP[MAJOR_CHORDS_SET_NAME] = makeChordsForPattern(MAJOR_CHORD_PATTERN);
CHORDS_MAP[DIMINISHED_CHORDS_SET_NAME] = makeChordsForPattern(DIMINISHED_CHORD_PATTERN);

export const SCALES = SCALES_MAP

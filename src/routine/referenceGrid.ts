import {exists} from "../utilities";
import {CHORDS, MAJOR_CHORDS_SET_NAME, type Chord} from "../notes/chords";
import {BaseNotes, getRegisteredScale, MAJOR_SCALE_SET_NAME} from "../notes/scales";
import {
    CHORD_TYPE_OPTIONS,
    SCALE_TYPE_OPTIONS,
    type ChordTypeId,
    type ScaleTypeId,
} from "./types";

export type ReferenceSlotKind = "scale" | "chord";

export interface ReferenceGridSlot {
    kind: ReferenceSlotKind;
    scaleType: ScaleTypeId;
    chordType: ChordTypeId;
    baseNoteMapKey: string;
}

export function defaultReferenceGridSlot(): ReferenceGridSlot {
    return {
        kind: "scale",
        scaleType: MAJOR_SCALE_SET_NAME,
        chordType: MAJOR_CHORDS_SET_NAME,
        baseNoteMapKey: BaseNotes.C.mapKey,
    };
}

const SCALE_IDS = new Set<string>(SCALE_TYPE_OPTIONS);
const CHORD_IDS = new Set<string>(CHORD_TYPE_OPTIONS);
const BASE_KEYS = new Set(Object.values(BaseNotes).map((b) => b.mapKey));

/** Coerce stored JSON into a valid {@link ReferenceGridSlot}. */
export function normalizeReferenceGridSlot(raw: unknown): ReferenceGridSlot {
    const d = defaultReferenceGridSlot();
    if (!raw || typeof raw !== "object") {
        return d;
    }
    const o = raw as Record<string, unknown>;
    const kind = o.kind === "chord" ? "chord" : "scale";
    let scaleType = d.scaleType;
    if (typeof o.scaleType === "string" && SCALE_IDS.has(o.scaleType)) {
        scaleType = o.scaleType as ScaleTypeId;
    }
    let chordType = d.chordType;
    if (typeof o.chordType === "string" && CHORD_IDS.has(o.chordType)) {
        chordType = o.chordType as ChordTypeId;
    }
    let baseNoteMapKey = d.baseNoteMapKey;
    if (typeof o.baseNoteMapKey === "string" && BASE_KEYS.has(o.baseNoteMapKey)) {
        baseNoteMapKey = o.baseNoteMapKey;
    }
    return {kind, scaleType, chordType, baseNoteMapKey};
}

function resolveChord(kind: ChordTypeId, baseNoteKey: string): Chord {
    const sub = CHORDS[kind];
    const ch = sub[baseNoteKey];
    if (exists(ch)) {
        return ch;
    }
    const firstKey = Object.keys(sub)[0]!;
    return sub[firstKey]!;
}

function normPc(midi: number): number {
    return ((midi % 12) + 12) % 12;
}

/** MIDI numbers in `rangeMidis` that belong to the scale or chord in `slot` (pitch-class match). */
export function hintMidisForReferenceSlot(rangeMidis: number[], slot: ReferenceGridSlot): number[] {
    if (slot.kind === "scale") {
        const scale = getRegisteredScale(slot.scaleType, slot.baseNoteMapKey);
        return rangeMidis.filter((n) => scale.contains(n));
    }
    const chord = resolveChord(slot.chordType, slot.baseNoteMapKey);
    const rootPc = chord.baseNote.pitchClass;
    const pcs = new Set(
        chord.pattern.map((deg) => normPc(rootPc + (deg - 1))),
    );
    return rangeMidis.filter((n) => pcs.has(normPc(n)));
}

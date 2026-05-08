import type {NumberRangeLike} from "../common/NumberRange";
import {defaultUserRoutineNoteRange} from "./index";
import {
    defaultReferenceGridSlot,
    normalizeReferenceGridSlot,
    type ReferenceGridSlot,
} from "./referenceGrid";
import {NoteRangeType, type UserRoutineNoteRange} from "./types";

export const REFERENCE_PATTERN_DIM_MIN = 1;
export const REFERENCE_PATTERN_DIM_MAX = 6;

export function clampReferencePatternDim(n: number): number {
    return Math.min(
        REFERENCE_PATTERN_DIM_MAX,
        Math.max(REFERENCE_PATTERN_DIM_MIN, Math.floor(Number(n) || REFERENCE_PATTERN_DIM_MIN)),
    );
}

export interface ReferenceViewSettings {
    noteRange: UserRoutineNoteRange;
    patternRows: number;
    patternCols: number;
    gridSelections: ReferenceGridSlot[];
}

export interface ReferenceViewPreset extends ReferenceViewSettings {
    id: string;
    /** User-visible label (trimmed, length-capped when stored). */
    name: string;
}

const PRESET_NAME_MAX = 80;

function newPresetId(): string {
    return crypto.randomUUID();
}

/** Deep-normalized copy of the live reference panel (for preset payload). */
export function snapshotReferenceViewSettings(rv: ReferenceViewSettings): ReferenceViewSettings {
    return mergeStoredReferenceView(JSON.parse(JSON.stringify(rv)));
}

export function mergeStoredReferencePresets(raw: unknown): ReferenceViewPreset[] {
    if (!Array.isArray(raw)) {
        return [];
    }
    const out: ReferenceViewPreset[] = [];
    for (const item of raw) {
        if (!item || typeof item !== "object") {
            continue;
        }
        const o = item as Record<string, unknown>;
        const nameRaw = typeof o.name === "string" ? o.name.trim() : "";
        if (!nameRaw) {
            continue;
        }
        const name = nameRaw.slice(0, PRESET_NAME_MAX);
        const id = typeof o.id === "string" && o.id.length > 0 ? o.id : newPresetId();
        const snap = mergeStoredReferenceView({
            noteRange: o.noteRange,
            patternRows: o.patternRows,
            patternCols: o.patternCols,
            gridSelections: o.gridSelections,
        });
        out.push({
            id,
            name,
            ...snap,
        });
    }
    return out;
}

function isNoteRangeType(v: number): v is NoteRangeType {
    return (
        v === NoteRangeType.Notes ||
        v === NoteRangeType.Frets ||
        v === NoteRangeType.Octaves
    );
}

function normalizeStoredNoteRange(raw: unknown, fallback: UserRoutineNoteRange): UserRoutineNoteRange {
    if (!raw || typeof raw !== "object") {
        return fallback;
    }
    const o = raw as UserRoutineNoteRange & {range?: NumberRangeLike};
    let type = o.type as number | string;
    if (typeof type === "string") {
        type = Number.parseInt(type, 10);
    }
    const noteType = typeof type === "number" && isNoteRangeType(type) ? type : fallback.type;
    const r = o.range;
    let range: NumberRangeLike;
    if (r && typeof r === "object") {
        const start = Number(r.start);
        const end = Number(r.end);
        range = {
            start: Number.isFinite(start) ? start : fallback.range.start,
            end: Number.isFinite(end) ? end : fallback.range.end,
        };
    } else {
        range = {...fallback.range};
    }
    return {type: noteType, range};
}

export function defaultReferenceViewSettings(): ReferenceViewSettings {
    const patternRows = 1;
    const patternCols = 2;
    return {
        noteRange: defaultUserRoutineNoteRange(),
        patternRows,
        patternCols,
        gridSelections: Array.from({length: patternRows * patternCols}, () => defaultReferenceGridSlot()),
    };
}

/** Restore reference panel settings from persisted JSON (e.g. localStorage). */
export function mergeStoredReferenceView(raw: unknown): ReferenceViewSettings {
    const d = defaultReferenceViewSettings();
    if (!raw || typeof raw !== "object") {
        return d;
    }
    const o = raw as Record<string, unknown>;
    const patternRows = clampReferencePatternDim(Number(o.patternRows) || d.patternRows);
    const patternCols = clampReferencePatternDim(Number(o.patternCols) || d.patternCols);
    const noteRange = normalizeStoredNoteRange(o.noteRange, d.noteRange);
    let gridSelections: ReferenceGridSlot[];
    if (Array.isArray(o.gridSelections)) {
        gridSelections = o.gridSelections.map(normalizeReferenceGridSlot);
    } else {
        gridSelections = [...d.gridSelections];
    }
    const target = patternRows * patternCols;
    while (gridSelections.length < target) {
        gridSelections.push(defaultReferenceGridSlot());
    }
    gridSelections = gridSelections.slice(0, target);
    return {noteRange, patternRows, patternCols, gridSelections};
}

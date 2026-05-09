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
    /** One note range per panel row (same for all tiles in that row). */
    noteRangesPerRow: UserRoutineNoteRange[];
    patternRows: number;
    /** One entry per row; column count for that row (1…6). Tile order is row-major. */
    patternColsPerRow: number[];
    gridSelections: ReferenceGridSlot[];
    /** Per-tile scale/chord/root selects and theory button row in Reference view. */
    showTileControls: boolean;
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
            noteRangesPerRow: o.noteRangesPerRow,
            noteRange: o.noteRange,
            patternRows: o.patternRows,
            patternColsPerRow: o.patternColsPerRow,
            patternCols: o.patternCols,
            gridSelections: o.gridSelections,
            showTileControls: o.showTileControls,
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

export function cloneUserRoutineNoteRange(nr: UserRoutineNoteRange): UserRoutineNoteRange {
    return {type: nr.type, range: {...nr.range}};
}

/** Total number of reference tiles from row column counts. */
export function totalReferenceTileCount(patternColsPerRow: number[]): number {
    return patternColsPerRow.reduce((s, c) => s + c, 0);
}

function mergePatternColsPerRow(
    o: Record<string, unknown>,
    patternRows: number,
    defaults: ReferenceViewSettings,
): number[] {
    const fallbackCol = clampReferencePatternDim(
        Number(o.patternCols) || defaults.patternColsPerRow[0] || REFERENCE_PATTERN_DIM_MIN,
    );
    let perRow: number[] = [];
    if (Array.isArray(o.patternColsPerRow)) {
        perRow = o.patternColsPerRow.map((x) => clampReferencePatternDim(Number(x)));
    } else {
        perRow = Array.from({length: patternRows}, () => fallbackCol);
    }
    while (perRow.length < patternRows) {
        perRow.push(
            clampReferencePatternDim(perRow[perRow.length - 1] ?? fallbackCol),
        );
    }
    if (perRow.length > patternRows) {
        perRow = perRow.slice(0, patternRows);
    }
    if (patternRows > 0 && perRow.length === 0) {
        perRow = Array.from({length: patternRows}, () => fallbackCol);
    }
    return perRow;
}

export function defaultReferenceViewSettings(): ReferenceViewSettings {
    const patternRows = 1;
    const patternColsPerRow = [2];
    const nTiles = totalReferenceTileCount(patternColsPerRow);
    const nr0 = defaultUserRoutineNoteRange();
    return {
        noteRangesPerRow: [cloneUserRoutineNoteRange(nr0)],
        patternRows,
        patternColsPerRow,
        gridSelections: Array.from({length: nTiles}, () => defaultReferenceGridSlot()),
        showTileControls: false,
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
    const patternColsPerRow = mergePatternColsPerRow(o, patternRows, d);
    const baseNrFallback = d.noteRangesPerRow[0] ?? defaultUserRoutineNoteRange();
    let noteRangesPerRow: UserRoutineNoteRange[];
    if (Array.isArray(o.noteRangesPerRow)) {
        noteRangesPerRow = o.noteRangesPerRow.map((raw, i) =>
            normalizeStoredNoteRange(raw, d.noteRangesPerRow[i] ?? baseNrFallback),
        );
    } else if (o.noteRange != null) {
        const one = normalizeStoredNoteRange(o.noteRange, baseNrFallback);
        noteRangesPerRow = Array.from({length: patternRows}, () => cloneUserRoutineNoteRange(one));
    } else {
        noteRangesPerRow = d.noteRangesPerRow.map(cloneUserRoutineNoteRange);
    }
    while (noteRangesPerRow.length < patternRows) {
        const last = noteRangesPerRow[noteRangesPerRow.length - 1] ?? defaultUserRoutineNoteRange();
        noteRangesPerRow.push(cloneUserRoutineNoteRange(last));
    }
    noteRangesPerRow = noteRangesPerRow.slice(0, patternRows);

    let gridSelections: ReferenceGridSlot[];
    if (Array.isArray(o.gridSelections)) {
        gridSelections = o.gridSelections.map(normalizeReferenceGridSlot);
    } else {
        gridSelections = [...d.gridSelections];
    }
    const target = totalReferenceTileCount(patternColsPerRow);
    while (gridSelections.length < target) {
        gridSelections.push(defaultReferenceGridSlot());
    }
    gridSelections = gridSelections.slice(0, target);
    const showTileControls =
        typeof o.showTileControls === "boolean" ? o.showTileControls : d.showTileControls;
    return {noteRangesPerRow, patternRows, patternColsPerRow, gridSelections, showTileControls};
}

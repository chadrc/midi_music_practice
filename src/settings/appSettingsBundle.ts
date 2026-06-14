import type {RoutineSettings} from "../routine/types";
import {hydrateSettingsFromStoredBlob, type SettingsStore} from "../store/settings";
import {normalizeRoutinesFromStorage} from "../store/routineEdit";

export const APP_SETTINGS_EXPORT_VERSION = 1 as const;

export type AppSettingsExportFileV1 = {
    version: typeof APP_SETTINGS_EXPORT_VERSION;
    exportedAt: string;
    settings: Record<string, unknown>;
    routines: unknown[];
};

export type ParsedAppSettingsImport =
    | {ok: true; settings: SettingsStore; routines: RoutineSettings[]}
    | {ok: false; error: string};

function isRecord(x: unknown): x is Record<string, unknown> {
    return x != null && typeof x === "object" && !Array.isArray(x);
}

function looksLikeRoutineSettings(r: unknown): r is RoutineSettings {
    if (!isRecord(r)) {
        return false;
    }
    if (typeof r.id !== "string") {
        return false;
    }
    if (!Array.isArray(r.parts)) {
        return false;
    }
    return true;
}

export function buildAppSettingsExportPayload(
    settingsState: Record<string, unknown>,
    routines: unknown[],
): AppSettingsExportFileV1 {
    return {
        version: APP_SETTINGS_EXPORT_VERSION,
        exportedAt: new Date().toISOString(),
        settings: settingsState,
        routines,
    };
}

export function stringifyAppSettingsExport(payload: AppSettingsExportFileV1): string {
    return JSON.stringify(payload, null, 2);
}

export function parseAppSettingsImportData(parsed: unknown): ParsedAppSettingsImport {
    if (!isRecord(parsed)) {
        return {ok: false, error: "File must contain a JSON object."};
    }
    const version = parsed.version;
    if (version !== undefined && version !== APP_SETTINGS_EXPORT_VERSION) {
        return {ok: false, error: `Unsupported export version: ${String(version)}.`};
    }
    if (!isRecord(parsed.settings)) {
        return {ok: false, error: "Missing or invalid \"settings\" object."};
    }
    let routinesRaw = parsed.routines;
    if (routinesRaw === undefined) {
        routinesRaw = [];
    }
    if (!Array.isArray(routinesRaw)) {
        return {ok: false, error: "\"routines\" must be an array."};
    }
    for (const r of routinesRaw) {
        if (!looksLikeRoutineSettings(r)) {
            return {ok: false, error: "Invalid entry in \"routines\" array (expected id and parts)."};
        }
    }
    const routines = JSON.parse(JSON.stringify(routinesRaw)) as RoutineSettings[];
    normalizeRoutinesFromStorage(routines);
    const settings = hydrateSettingsFromStoredBlob(parsed.settings);
    return {ok: true, settings, routines};
}

import {expect, test} from "vitest";
import {
    APP_SETTINGS_EXPORT_VERSION,
    buildAppSettingsExportPayload,
    parseAppSettingsImportData,
    stringifyAppSettingsExport,
} from "../../src/settings/appSettingsBundle";
import {hydrateSettingsFromStoredBlob} from "../../src/store/settings";
import {defaultPracticeForType} from "../../src/routine";
import {ParentType, PracticeType, type RoutineSettings} from "../../src/routine/types";

test("parseAppSettingsImportData rejects non-object root", () => {
    expect(parseAppSettingsImportData(null)).to.deep.equal({
        ok: false,
        error: "File must contain a JSON object.",
    });
});

test("parseAppSettingsImportData rejects bad version", () => {
    expect(
        parseAppSettingsImportData({
            version: 99,
            settings: {},
            routines: [],
        }),
    ).to.deep.equal({
        ok: false,
        error: "Unsupported export version: 99.",
    });
});

test("parseAppSettingsImportData rejects missing settings object", () => {
    expect(parseAppSettingsImportData({routines: []})).to.deep.equal({
        ok: false,
        error: "Missing or invalid \"settings\" object.",
    });
});

test("parseAppSettingsImportData rejects invalid routines shape", () => {
    expect(
        parseAppSettingsImportData({
            version: APP_SETTINGS_EXPORT_VERSION,
            settings: {},
            routines: [{id: 1, parts: []}],
        }),
    ).to.deep.equal({
        ok: false,
        error: "Invalid entry in \"routines\" array (expected id and parts).",
    });
});

test("parseAppSettingsImportData accepts minimal v1 bundle", () => {
    expect(
        parseAppSettingsImportData({
            version: APP_SETTINGS_EXPORT_VERSION,
            settings: {},
            routines: [],
        }),
    ).to.deep.equal({
        ok: true,
        settings: hydrateSettingsFromStoredBlob({}),
        routines: [],
    });
});

test("parseAppSettingsImportData defaults routines when omitted", () => {
    expect(
        parseAppSettingsImportData({
            version: APP_SETTINGS_EXPORT_VERSION,
            settings: {},
        }),
    ).to.deep.equal({
        ok: true,
        settings: hydrateSettingsFromStoredBlob({}),
        routines: [],
    });
});

test("export JSON round-trips through parse", () => {
    const settings = hydrateSettingsFromStoredBlob({});
    const routines: RoutineSettings[] = [
        {
            id: "routine-a",
            appVersion: "1.0.8",
            schemaVersion: "0.0.1",
            name: "R",
            parts: [
                {
                    name: "p",
                    seed: null,
                    parentSettings: ParentType.Settings,
                    repeatCount: 1,
                    cloneRepeat: false,
                    targetBPM: null,
                    noteRange: null,
                    practice: defaultPracticeForType(PracticeType.Notes),
                    requireOctave: null,
                    minSuccessVelocity: null,
                    promptCount: null,
                    freePlayInSet: null,
                    maxConsecutiveSamePitchSuccess: null,
                },
            ],
        },
    ];
    const payload = buildAppSettingsExportPayload(
        JSON.parse(JSON.stringify(settings)) as Record<string, unknown>,
        JSON.parse(JSON.stringify(routines)) as unknown[],
    );
    const text = stringifyAppSettingsExport(payload);
    const round = parseAppSettingsImportData(JSON.parse(text) as unknown);
    expect(round).to.deep.equal({
        ok: true,
        settings,
        routines: [
            {
                id: "routine-a",
                appVersion: "1.0.8",
                schemaVersion: "0.0.1",
                name: "R",
                parts: [
                    {
                        name: "p",
                        seed: null,
                        parentSettings: ParentType.Settings,
                        repeatCount: 1,
                        cloneRepeat: false,
                        targetBPM: null,
                        noteRange: null,
                        practice: defaultPracticeForType(PracticeType.Notes),
                        requireOctave: null,
                        minSuccessVelocity: null,
                        promptCount: null,
                        freePlayInSet: null,
                        maxConsecutiveSamePitchSuccess: null,
                    },
                ],
            },
        ],
    });
});

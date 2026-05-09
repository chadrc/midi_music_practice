import {defineStore} from "pinia";
import {RNBOParameter} from "./types";
import {
    defaultPracticeForType,
    defaultUserRoutineNoteRange,
    midiNotesForNoteRange,
    noteScaleFromPractice,
    setNoteRangeType,
} from "../routine";
import {
    NoteRangeType,
    PracticeType,
    type UserRoutineNoteRange,
    type UserRoutinePartSettings,
    type UserRoutinePractice,
} from "../routine/types";
import {
    defaultReferenceGridSlot,
} from "../routine/referenceGrid";
import {
    cloneUserRoutineNoteRange,
    defaultReferenceViewSettings,
    mergeStoredReferenceView,
    mergeStoredReferencePresets,
    snapshotReferenceViewSettings,
    clampReferencePatternDim,
    type ReferenceViewSettings,
    type ReferenceViewPreset,
} from "../routine/referenceViewSettings";
import {NumberRangeLike} from "../common/NumberRange";
import {exists} from "../utilities";
import {usePracticeStore} from "./practice";

interface NoteGridSettings {
    formatted: boolean;
}

interface AudioSettings {
    instrumentAudioEnabled: boolean,
    autoReceiveInstruments: string[]
}

interface InstrumentData {
    name: string,
    parameterData: { [key: string]: RNBOParameter }
}

interface InstrumentSettings {
    volume: number,
    instrumentData: InstrumentData[]
}

interface PracticeSettings {
    selectedRoutine: string;
    matchPracticeRoutine: boolean;
}

export type PromptDisplayMode = "bubbles" | "staffAll";

/** How accidentals are drawn on the combined staff notation. */
export type StaffAccidentalsMode = "eachNote" | "keySignature";

interface PracticeUiSettings {
    promptDisplay: PromptDisplayMode;
    staffAccidentals: StaffAccidentalsMode;
}

interface SettingsStore {
    noteGrid: NoteGridSettings;
    audio: AudioSettings;
    instruments: InstrumentSettings;
    userRoutine: UserRoutinePartSettings;
    practice: PracticeSettings;
    practiceUi: PracticeUiSettings;
    referenceView: ReferenceViewSettings;
    referencePresets: ReferenceViewPreset[];
}

export const NONE_VALUE = "none";

export const useSettingsStore = defineStore('settings', {
    state: (): SettingsStore => {
        const defaultNoteGrid: NoteGridSettings = {
            formatted: false
        }

        const defaultAudio: AudioSettings = {
            instrumentAudioEnabled: false,
            autoReceiveInstruments: []
        }

        const defaultInstrument: InstrumentSettings = {
            volume: .5,
            instrumentData: []
        }

        const defaultUserRoutine: UserRoutinePartSettings = {
            name: "",
            seed: null,
            targetBPM: 120,
            noteRange: defaultUserRoutineNoteRange(),
            practice: defaultPracticeForType(PracticeType.Notes),
            requireOctave: true,
            minSuccessVelocity: 20,
            promptCount: 8,
            freePlayInSet: false,
            maxConsecutiveSamePitchSuccess: null,
        }

        const defaultPractice: PracticeSettings = {
            selectedRoutine: NONE_VALUE,
            matchPracticeRoutine: true,
        }

        const defaultPracticeUi: PracticeUiSettings = {
            promptDisplay: "bubbles",
            staffAccidentals: "eachNote",
        };

        if (localStorage.getItem('settings')) {
            const stored = JSON.parse(localStorage.getItem('settings')!);
            const rawUr = {...defaultUserRoutine, ...stored.userRoutine};
            let practice = rawUr.practice as UserRoutinePractice | undefined;
            if (practice != null) {
                const rawType = practice.type as PracticeType | string;
                if (typeof rawType === "string") {
                    practice = {
                        ...practice,
                        type: Number.parseInt(rawType, 10) as PracticeType,
                    } as UserRoutinePractice;
                }
            }
            let hoistedNoteRange: UserRoutineNoteRange | undefined;
            if (practice && practice.type === PracticeType.Notes && "noteRange" in practice) {
                const nr = (practice as UserRoutinePractice & {noteRange?: UserRoutineNoteRange}).noteRange;
                if (nr !== undefined) {
                    hoistedNoteRange = nr;
                }
                practice = {type: PracticeType.Notes} as UserRoutinePractice;
            }
            const userRoutine: UserRoutinePartSettings = {
                name: rawUr.name,
                seed: rawUr.seed,
                targetBPM: rawUr.targetBPM,
                noteRange:
                    rawUr.noteRange ?? hoistedNoteRange ?? defaultUserRoutineNoteRange(),
                practice: practice ?? defaultPracticeForType(PracticeType.Notes),
                requireOctave: rawUr.requireOctave,
                minSuccessVelocity: rawUr.minSuccessVelocity,
                promptCount: rawUr.promptCount,
                freePlayInSet: rawUr.freePlayInSet ?? defaultUserRoutine.freePlayInSet,
                maxConsecutiveSamePitchSuccess:
                    rawUr.maxConsecutiveSamePitchSuccess !== undefined
                        ? rawUr.maxConsecutiveSamePitchSuccess
                        : defaultUserRoutine.maxConsecutiveSamePitchSuccess,
            };

            const storedPracticeUi = stored.practiceUi ?? {};
            const migratedPromptDisplay =
                storedPracticeUi.promptDisplay === "staff"
                    ? "bubbles"
                    : (storedPracticeUi.promptDisplay ?? defaultPracticeUi.promptDisplay);
            const practiceUi: PracticeUiSettings = {
                ...defaultPracticeUi,
                ...storedPracticeUi,
                promptDisplay: migratedPromptDisplay as PromptDisplayMode,
            };

            return {
                noteGrid: Object.assign(defaultNoteGrid, stored.noteGrid),
                audio: Object.assign(defaultAudio, stored.audio),
                instruments: Object.assign(defaultInstrument, stored.instruments),
                userRoutine,
                practice: Object.assign(defaultPractice, stored.practice),
                practiceUi,
                referenceView: mergeStoredReferenceView(stored.referenceView),
                referencePresets: mergeStoredReferencePresets(stored.referencePresets),
            }
        }

        return {
            noteGrid: defaultNoteGrid,
            audio: defaultAudio,
            instruments: defaultInstrument,
            userRoutine: defaultUserRoutine,
            practice: defaultPractice,
            practiceUi: defaultPracticeUi,
            referenceView: defaultReferenceViewSettings(),
            referencePresets: [],
        }
    },
    getters: {
        noteScale(state) {
            return noteScaleFromPractice(state.userRoutine.practice);
        },
        currentRange(state): NumberRangeLike {
            return state.userRoutine.noteRange.range;
        },
        selectedNotes(state): number[] {
            return midiNotesForNoteRange(state.userRoutine.noteRange);
        },
        currentSettings() {
            if (this.practice.matchPracticeRoutine) {
                const practiceStore = usePracticeStore();
                if (practiceStore.practicing) {
                    const part = practiceStore.currentRoutinePart;
                    if (!exists(part)) {
                        return this.userRoutine;
                    }

                    return part.bakedSettings;
                }
            }
            return this.userRoutine
        },
        editingDisabled() {
            const practiceStore = usePracticeStore();
            return practiceStore.practicing;
        },
    },
    actions: {
        toggleAutoReceiveInstrument(deviceId: string) {
            const index = this.audio.autoReceiveInstruments
                .findIndex((id: string) => id === deviceId)

            if (index === -1) {
                this.audio.autoReceiveInstruments.push(deviceId)
            } else {
                this.audio.autoReceiveInstruments.splice(index, 1)
            }
        },
        saveInstrumentData(data: InstrumentData) {
            const existing = this.instruments.instrumentData
                .findIndex((instrument: InstrumentData) => instrument.name === data.name)

            if (existing > -1) {
                this.instruments.instrumentData[existing] = data
            } else {
                this.instruments.instrumentData.push(data)
            }
        },
        referenceSyncTileCount() {
            const target = this.referenceView.patternColsPerRow.reduce((s, c) => s + c, 0);
            const gs = this.referenceView.gridSelections;
            while (gs.length < target) {
                gs.push(defaultReferenceGridSlot());
            }
            if (gs.length > target) {
                gs.splice(target);
            }
        },
        referenceSetPatternRows(value: number | null) {
            if (value == null) {
                return;
            }
            const n = clampReferencePatternDim(value);
            const p = this.referenceView.patternColsPerRow;
            this.referenceView.patternRows = n;
            const fillCol = clampReferencePatternDim(p[p.length - 1] ?? 2);
            while (p.length < n) {
                p.push(fillCol);
            }
            if (p.length > n) {
                p.splice(n);
            }
            const nr = this.referenceView.noteRangesPerRow;
            while (nr.length < n) {
                const last = nr[nr.length - 1] ?? defaultUserRoutineNoteRange();
                nr.push(cloneUserRoutineNoteRange(last));
            }
            if (nr.length > n) {
                nr.splice(n);
            }
            this.referenceSyncTileCount();
        },
        referenceSetPatternColsForRow(row: number, value: number | null) {
            if (value == null) {
                return;
            }
            const p = this.referenceView.patternColsPerRow;
            if (row < 0 || row >= this.referenceView.patternRows) {
                return;
            }
            p[row] = clampReferencePatternDim(value);
            this.referenceSyncTileCount();
        },
        referenceSetNoteRangeTypeForRow(row: number, t: NoteRangeType) {
            const nr = this.referenceView.noteRangesPerRow;
            if (row < 0 || row >= this.referenceView.patternRows || nr[row] == null) {
                return;
            }
            setNoteRangeType(nr[row]!, t);
        },
        referenceSetNoteRangeSliderForRow(row: number, range: number[]) {
            const entry = this.referenceView.noteRangesPerRow[row];
            if (row < 0 || row >= this.referenceView.patternRows || entry == null) {
                return;
            }
            const [a, b] = range;
            entry.range.start = a!;
            entry.range.end = b!;
        },
        referenceSavePreset(name: string): string | null {
            const trimmed = name.trim();
            if (!trimmed) {
                return null;
            }
            const snap = snapshotReferenceViewSettings(this.referenceView);
            const id = crypto.randomUUID();
            this.referencePresets.push({
                id,
                name: trimmed.slice(0, 80),
                ...snap,
            });
            return id;
        },
        referenceLoadPreset(id: string) {
            const p = this.referencePresets.find((x) => x.id === id);
            if (!p) {
                return;
            }
            const m = mergeStoredReferenceView({
                noteRangesPerRow: p.noteRangesPerRow,
                patternRows: p.patternRows,
                patternColsPerRow: p.patternColsPerRow,
                gridSelections: p.gridSelections,
                showTileControls: p.showTileControls,
            });
            this.$patch({referenceView: m});
        },
        referenceDeletePreset(id: string) {
            const i = this.referencePresets.findIndex((x) => x.id === id);
            if (i !== -1) {
                this.referencePresets.splice(i, 1);
            }
        },
    },
})
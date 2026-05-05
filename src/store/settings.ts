import {defineStore} from "pinia";
import {RNBOParameter} from "./types";
import {
    defaultPracticeForType,
    defaultUserRoutineNoteRange,
    midiNotesForNoteRange,
    noteScaleFromPractice,
} from "../routine";
import {UserRoutinePartSettings, PracticeType, UserRoutinePractice, UserRoutineNoteRange} from "../routine/types";
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
                practice,
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
            }
        }

        return {
            noteGrid: defaultNoteGrid,
            audio: defaultAudio,
            instruments: defaultInstrument,
            userRoutine: defaultUserRoutine,
            practice: defaultPractice,
            practiceUi: defaultPracticeUi,
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
        }
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
        }
    },
})
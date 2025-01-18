import {defineStore} from "pinia";
import {ref} from "vue";
import {NoteRangeType, ParentType, PracticeType, RoutinePartSettings, RoutineSettings} from "../routine/types";
import {BaseNotes, CHROMATIC_SCALE_SET_NAME} from "../notes/scales";
import {MAX_MIDI_NOTES} from "../routine";

function makeDefaultRoutinePartSettings(): RoutinePartSettings {
    return {
        parentSettings: ParentType.Settings,
        repeatCount: 1,
        cloneRepeat: false,
        practiceType: PracticeType.Scales,
        targetBPM: 120,
        scale: {
            setName: CHROMATIC_SCALE_SET_NAME,
            baseNote: BaseNotes[BaseNotes.C],
        },
        chordRatio: 0,
        requireOctave: true,
        minSuccessVelocity: 100,
        noteRangeType: NoteRangeType.Notes,
        fretRangeOptions: {
            range: {
                start: 0,
                end: 4,
            }
        },
        octaveRangeOptions: {
            range: {
                start: 4,
                end: 6,
            }
        },
        noteRangeOptions: {
            range: {
                start: 0,
                end: MAX_MIDI_NOTES,
            }
        },
        noteCount: 0,
        fixed: null,
        promptCount: 8,
    }
}

export const useRoutineEditStore = defineStore('routineEdit', () => {
    const currentEdit = ref<RoutineSettings>({
        parts: [
            makeDefaultRoutinePartSettings()
        ],
    });

    function addNewPart() {
        currentEdit.value.parts.push(makeDefaultRoutinePartSettings());
    }

    return {
        currentEdit,
        addNewPart,
    }
})
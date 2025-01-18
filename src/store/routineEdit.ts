import {defineStore} from "pinia";
import {ref} from "vue";
import {ParentType, RoutinePartSettings, RoutineSettings} from "../routine/types";

function makeDefaultRoutinePartSettings(): RoutinePartSettings {
    return {
        parentSettings: ParentType.Settings,
        repeatCount: 1,
        cloneRepeat: false,
        practiceType: null,
        targetBPM: null,
        scale: null,
        chordRatio: null,
        requireOctave: null,
        minSuccessVelocity: null,
        noteRangeType: null,
        fretRangeOptions: null,
        octaveRangeOptions: null,
        noteRangeOptions: null,
        noteCount: null,
        fixed: null,
        promptCount: null,

        // cloneRepeat: false,
        // practiceType: PracticeType.Generated,
        // targetBPM: 120,
        // scale: {
        //     setName: CHROMATIC_SCALE_SET_NAME,
        //     baseNote: BaseNotes[BaseNotes.C],
        // },
        // chordRatio: 0,
        // requireOctave: true,
        // minSuccessVelocity: 100,
        // noteRangeType: NoteRangeType.Notes,
        // fretRangeOptions: {
        //     range: {
        //         start: 0,
        //         end: 4,
        //     }
        // },
        // octaveRangeOptions: {
        //     range: {
        //         start: 4,
        //         end: 6,
        //     }
        // },
        // noteRangeOptions: {
        //     range: {
        //         start: 0,
        //         end: MAX_MIDI_NOTES,
        //     }
        // },
        // noteCount: 0,
        // fixed: null,
        // promptCount: 8,
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
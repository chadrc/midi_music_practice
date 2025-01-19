<script setup lang="ts">
import {Stepper, StepList, Step, StepPanels, StepPanel, ToggleSwitch, InputNumber, InputText} from "primevue";
import {useRoutineEditStore} from "../store/routineEdit";
import ParentTypeSelect from "../routine/components/ParentTypeSelect.vue";
import SettingsEditField from "../routine/components/SettingsEditField.vue";
import PracticeTypeSelect from "../routine/components/PracticeTypeSelect.vue";
import {NoteRangeType, PracticeType} from "../routine/types";
import BPMSelect from "../routine/components/BPMSelect.vue";
import ScaleSelect from "../routine/components/ScaleSelect.vue";
import {BaseNotes, CHROMATIC_SCALE_SET_NAME} from "../notes/scales";
import ChordRatioSlider from "../routine/components/ChordRatioSlider.vue";
import NoteRangeSelect from "../routine/components/NoteRangeSelect.vue";
import RangeSlider from "../routine/components/RangeSlider.vue";

const routineEditStore = useRoutineEditStore();

function onStepUpdate(value: number) {
  if (value >= routineEditStore.currentEdit.parts.length + 1) {
    routineEditStore.addNewPart();
  }
}
</script>

<template>
  <Stepper
    :value="1"
    class="routine-stepper"
    @update:value="onStepUpdate"
  >
    <StepList>
      <Step 
        v-for="(item, index) in routineEditStore.currentEdit.parts"
        :key="index"
        :value="index + 1"
      />
      <Step :value="routineEditStore.currentEdit.parts.length + 1" />
    </StepList>
    <StepPanels class="routine-settings-panels">
      <StepPanel
        v-for="(item, index) in routineEditStore.currentEdit.parts"
        :key="index"
        :value="index + 1"
        class="routine-settings-panel"
      >
        <section class="settings-edit">
          <SettingsEditField
            v-model="item.name"
            label="Name"
            :can-set="false"
            :component="InputText"
          />
          <SettingsEditField
            v-model="item.parentSettings"
            label="Parent"
            :can-set="false"
            :component="ParentTypeSelect"
          />
          <SettingsEditField
            v-model="item.practiceType"
            label="Type"
            :set-value="PracticeType.Generated"
            :component="PracticeTypeSelect"
          />
          <SettingsEditField
            v-model="item.repeatCount"
            label="Repeat Count"
            :can-set="false"
            :component="InputNumber"
            :component-props="{min: 0, showButtons: true}"
          />
          <SettingsEditField
            v-model="item.cloneRepeat"
            label="Clone Repeat"
            :can-set="false"
            :component="ToggleSwitch"
          />
          <SettingsEditField
            v-model="item.targetBPM"
            label="BPM"
            :set-value="120"
            :component="BPMSelect"
          />
          <SettingsEditField
            v-model="item.scale"
            label="Scale"
            :set-value="{setName: CHROMATIC_SCALE_SET_NAME, baseNote: BaseNotes[BaseNotes.C]}"
            :component="ScaleSelect"
          />
          <SettingsEditField
            v-model="item.chordRatio"
            label="Chords Per Set"
            :set-value="0"
            :component="ChordRatioSlider"
            :component-props="{max: 8}"
          />
          <SettingsEditField
            v-model="item.requireOctave"
            label="Require Octave"
            :set-value="false"
            :component="ToggleSwitch"
          />
          <SettingsEditField
            v-model="item.minSuccessVelocity"
            label="Minimum Velocity"
            :set-value="32"
            :component="InputNumber"
            :component-props="{min: 0, max: 127, showButtons: true}"
          />
          <SettingsEditField
            v-model="item.noteRangeType"
            label="Note Range Type"
            :set-value="NoteRangeType.Notes"
            :component="NoteRangeSelect"
          />
          <SettingsEditField
            v-model="item.fretRange"
            label="Fret Range"
            :set-value="{min: 0, max: 4}"
            :component="RangeSlider"
            :component-props="{min: 0, max: 22}"
          />
          <SettingsEditField
            v-model="item.octaveRange"
            label="Octave Range"
            :set-value="{min: 4, max: 6}"
            :component="RangeSlider"
            :component-props="{min: 0, max: 12}"
          />
          <SettingsEditField
            v-model="item.noteRange"
            label="Note Range"
            :set-value="{min: 0, max: 127}"
            :component="RangeSlider"
            :component-props="{min: 0, max: 127}"
          />
          <SettingsEditField
            v-model="item.promptCount"
            label="Prompt Count"
            :set-value="8"
            :component="InputNumber"
            :component-props="{min: 0, showButtons: true}"
          />
        </section>
      </StepPanel>
    </StepPanels>
  </Stepper>
</template>

<style scoped>
.routine-stepper {
  height: 100%;
}

.settings-edit {
  padding: 1rem;
}

.settings-edit > .settings-edit-field {
  margin: 1rem 0;
}
</style>
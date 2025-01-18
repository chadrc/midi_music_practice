<script setup lang="ts">
import {Stepper, StepList, Step, StepPanels, StepPanel, InputNumber, ToggleSwitch} from "primevue";
import {useRoutineEditStore} from "../store/routineEdit";
import ParentTypeSelect from "../routine/components/ParentTypeSelect.vue";
import SettingsEditField from "../routine/components/SettingsEditField.vue";
import PracticeTypeSelect from "../routine/components/PracticeTypeSelect.vue";
import MinZeroInput from "../routine/components/MinZeroInput.vue";
import {PracticeType} from "../routine/types";
import BPMSelect from "../routine/components/BPMSelect.vue";
import ScaleSelect from "./ScaleSelect.vue";
import {BaseNotes, CHROMATIC_SCALE_SET_NAME} from "../notes/scales";

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
    <StepPanels>
      <StepPanel
        v-for="(item, index) in routineEditStore.currentEdit.parts"
        :key="index"
        :value="index + 1"
      >
        <section class="settings-edit">
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
            :component="MinZeroInput"
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
        </section>
      </StepPanel>
    </StepPanels>
  </Stepper>
</template>

<style scoped>
.settings-edit {
  padding: 1rem;
}

.settings-edit > .settings-edit-field {
  margin: 1rem 0;
}
</style>
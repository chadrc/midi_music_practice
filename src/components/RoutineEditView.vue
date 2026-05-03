<script setup lang="ts">
import {Button, Stepper, StepList, Step, StepPanels, StepPanel, ToggleSwitch, InputNumber, InputText} from "primevue";
import {useRoutineStore} from "../store/routineEdit";
import ParentTypeSelect from "../routine/components/ParentTypeSelect.vue";
import SettingsEditField from "../routine/components/SettingsEditField.vue";
import {PracticeType} from "../routine/types";
import {defaultPracticeForType, defaultUserRoutineNoteRange} from "../routine";
import BPMSelect from "../routine/components/BPMSelect.vue";
import RoutinePartPracticeEditor from "../routine/components/RoutinePartPracticeEditor.vue";
import RoutinePartNoteRangeEditor from "../routine/components/RoutinePartNoteRangeEditor.vue";
import {exists} from "../utilities";

const routineEditStore = useRoutineStore();
</script>

<template>
  <section
    v-if="exists(routineEditStore.currentEdit)"
    class="routine-settings"
  >
    <SettingsEditField
      v-model="routineEditStore.currentEdit.name"
      label="Routine Name"
      :can-set="false"
      :component="InputText"
    />
  </section>
  <section
    v-if="exists(routineEditStore.currentEdit)"
    class="title-divider"
  >
    <hr>
    <span>Steps</span>
    <hr>
  </section>
  <Stepper
    v-if="exists(routineEditStore.currentEdit)"
    :value="routineEditStore.selectedStep"
    class="routine-stepper"
    @update:value="routineEditStore.onStepUpdate"
  >
    <StepList>
      <Step
        v-for="(item, index) in routineEditStore.currentEdit.parts"
        :key="index"
        :value="index + 1"
      >
        {{ item.name || `Part ${index + 1}` }}
      </Step>
      <Step :value="routineEditStore.currentEdit.parts.length + 1">
        New
      </Step>
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
            label="Part Name"
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
            v-model="item.seed"
            label="Fixed Seed"
            :set-value="Math.round(Math.random() * 1000)"
            :component="InputNumber"
            :component-props="{min: 0, showButtons: true}"
          />
          <SettingsEditField
            v-model="item.practice"
            label="Practice"
            :set-value="defaultPracticeForType(PracticeType.Notes)"
            :component="RoutinePartPracticeEditor"
          />
          <SettingsEditField
            v-model="item.noteRange"
            label="Note / fret span"
            :set-value="defaultUserRoutineNoteRange()"
            :component="RoutinePartNoteRangeEditor"
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
            v-model="item.promptCount"
            label="Prompt Count"
            :set-value="8"
            :component="InputNumber"
            :component-props="{min: 0, showButtons: true}"
          />
          <Button
            v-if="routineEditStore.selectedStep !== 1"
            severity="danger"
            @click="routineEditStore.removeStep(index)"
          >
            Remove Step
          </Button>
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

.title-divider {
  display: flex;
  align-items: center;
}
.title-divider > span {
  padding: 0.5rem 1rem;
}

.title-divider > hr {
  flex: 1;
}
</style>
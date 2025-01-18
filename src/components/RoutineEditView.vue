<script setup lang="ts">
import {Stepper, StepList, Step, StepPanels, StepPanel, InputNumber, ToggleSwitch} from "primevue";
import {useRoutineEditStore} from "../store/routineEdit";
import ParentTypeSelect from "../routine/components/ParentTypeSelect.vue";
import SettingsEditField from "../routine/components/SettingsEditField.vue";

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
          <SettingsEditField label="Parent">
            <ParentTypeSelect v-model="item.parentSettings" />
          </SettingsEditField>
          <SettingsEditField label="Repeat Count">
            <InputNumber
              v-model="item.repeatCount"
              :min="0"
            />
          </SettingsEditField>
          <SettingsEditField label="Clone Repeat">
            <ToggleSwitch v-model="item.cloneRepeat" />
          </SettingsEditField>
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
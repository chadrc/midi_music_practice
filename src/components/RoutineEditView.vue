<script setup lang="ts">
import {Stepper, StepList, Step, StepPanels, StepPanel} from "primevue";
import {useRoutineEditStore} from "../store/routineEdit";
import ParentTypeSelect from "../routine/components/ParentTypeSelect.vue";

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
          <div class="settings-edit-field">
            <span>Parent:</span>
            <ParentTypeSelect v-model="item.parentSettings" />
          </div>
        </section>
      </StepPanel>
    </StepPanels>
  </Stepper>
</template>

<style scoped>
.settings-edit {
  padding: 1rem;
}

.settings-edit-field {

}

.settings-edit-field > span {
  margin-right: 1rem;
}
</style>
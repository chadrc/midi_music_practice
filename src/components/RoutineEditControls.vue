<script setup lang="ts">
import {SplitButton, Select} from "primevue";
import {useRoutineEditStore} from "../store/routineEdit";
import {computed} from "vue";
import {exists, notEmptyOr} from "../utilities";

const routineStore = useRoutineEditStore();

function onSave() {
  routineStore.saveRoutine();
}

const routineSelectOptions = computed(() =>
  routineStore.routines.map(routine => ({
    name: notEmptyOr(routine.name, "[Unnamed Routine]"),
    value: routine.id,
  }))
)

const actions = [
  {
    label: "Create",
    command: () => {
      routineStore.createRoutine();
    }
  },
  {
    label: "Delete",
    command: () => {
      console.log("deleting");
    }
  }
]
</script>

<template>
  <div class="control-wrapper">
    <Select
      v-model="routineStore.currentRoutine"
      :options="routineSelectOptions"
      option-label="name"
      option-value="value"
    />
  </div>
  <div class="control-wrapper">
    <SplitButton
      label="Save"
      :button-props="{disabled: !exists(routineStore.currentEdit)}"
      :model="actions"
      @click="onSave"
    />
  </div>
</template>

<style scoped>
.control-wrapper {
  margin: 0 .5rem;
}
</style>
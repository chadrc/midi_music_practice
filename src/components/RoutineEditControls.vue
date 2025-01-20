<script setup lang="ts">
import {SplitButton, Select} from "primevue";
import {useRoutineStore} from "../store/routineEdit";
import {computed} from "vue";
import {exists, notEmptyOr} from "../utilities";
import {useSettingsStore} from "../store/settings";
import RoutineSelect from "./RoutineSelect.vue";

const routineStore = useRoutineStore();
const settingsStore = useSettingsStore();

function onSave() {
  routineStore.saveRoutine();
}

const routineSelectOptions = computed(() =>
  routineStore.routines
      .map(routine => ({
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
      routineStore.deleteRoutine(routineStore.currentRoutine);
    }
  }
]
</script>

<template>
  <div class="control-wrapper">
    <RoutineSelect />
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
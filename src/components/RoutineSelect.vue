<script setup lang="ts">

import {Select} from "primevue";
import {NONE_VALUE, useSettingsStore} from "../store/settings";
import {useRoutineStore} from "../store/routineEdit";
import {computed} from "vue";

const settingsStore = useSettingsStore();
const routineStore = useRoutineStore();

const routineOptions = computed(() => {
  const options: {name: string, value: string | null}[] = [
    {
      name: "None",
      value: NONE_VALUE,
    }
  ];

  for (let routine of routineStore.routines) {
    options.push({
      name: routine.name,
      value: routine.id,
    });
  }

  return options;
})
</script>

<template>
  <Select
    v-model="settingsStore.practice.selectedRoutine"
    :options="routineOptions"
    option-label="name"
    option-value="value"
    :disabled="settingsStore.editingDisabled"
  />
</template>

<style scoped>

</style>
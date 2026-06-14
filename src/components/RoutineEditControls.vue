<script setup lang="ts">
import {SplitButton} from "primevue";
import {computed} from "vue";
import {useRoutineStore} from "../store/routineEdit";
import {exists} from "../utilities";
import RoutineSelect from "./RoutineSelect.vue";

const routineStore = useRoutineStore();

function onSave() {
  routineStore.saveRoutine();
}

const actions = computed(() => [
  {
    label: "Create",
    command: () => {
      routineStore.createRoutine();
    }
  },
  {
    label: "Clone",
    disabled: !exists(routineStore.currentEdit),
    command: () => {
      routineStore.cloneRoutine();
    }
  },
  {
    label: "Delete",
    command: () => {
      routineStore.deleteRoutine(routineStore.currentRoutine);
    }
  }
])
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
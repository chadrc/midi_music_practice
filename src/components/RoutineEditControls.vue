<script setup lang="ts">
import {SplitButton} from "primevue";
import {useRoutineEditStore} from "../store/routineEdit";

const routineStore = useRoutineEditStore();

function onSave() {
  routineStore.saveRoutine();
}

const actions = [
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
    <SplitButton
      label="Save"
      :model="actions"
      @click="onSave"
    />
  </div>
</template>

<style scoped>
.feedback-text {
  margin-left: 1rem;
  margin-right: 1rem;
}
</style>
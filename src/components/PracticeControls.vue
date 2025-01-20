<script setup lang="ts">
import {Button, Select} from "primevue";
import {usePracticeStore} from "../store/practice";
import {useSettingsStore} from "../store/settings";
import RoutineSelect from "./RoutineSelect.vue";

const practiceStore = usePracticeStore();
const settingsStore = useSettingsStore();

function formatPracticeTime() {
  let seconds = practiceStore.practiceSessionTime % 60;
  let minutes = Math.floor(practiceStore.practiceSessionTime / 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function makeTargetBPMOptions() {
  const options = [];
  for (let i = 5; i <= 200; i += 5) {
    options.push(i);
  }
  return options;
}

function onStop() {
  practiceStore.stop();
  practiceStore.finalize();
}
</script>

<template>
  <div class="instrument-option">
    <span>Routine: </span>
    <RoutineSelect />
  </div>
  <div class="instrument-option">
    <span>Target BPM: </span>
    <Select
      v-model="settingsStore.currentSettings.targetBPM"
      class="target-bpm-control"
      :options="makeTargetBPMOptions()"
      :disabled="settingsStore.editingDisabled"
    />
  </div>
  <span class="feedback-text">
    Play Rate: {{ practiceStore.playRateDisplay }}
  </span>
  <Button
    :label="practiceStore.practicing ? 'Stop' : 'Start' "
    :severity="practiceStore.practicing ? 'danger' : 'info'"
    size="small"
    :disabled="!practiceStore.practicing && practiceStore.complete"
    @click="practiceStore.practicing ? onStop() : practiceStore.start()"
  >
    {{ practiceStore.practicing ? 'Stop' : 'Start' }}
  </Button>
  <span class="feedback-text">
    Time: {{ formatPracticeTime() }}
  </span>
  <span class="feedback-text">
    Notes Played: {{ practiceStore.successCount }}
  </span>
</template>

<style scoped>
.feedback-text {
  margin-left: 1rem;
  margin-right: 1rem;
}

.instrument-option {
  margin: 0 .5rem;
}
</style>
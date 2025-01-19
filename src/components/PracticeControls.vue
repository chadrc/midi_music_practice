<script setup lang="ts">
import {Button, Select} from "primevue";
import {usePracticeStore} from "../store/practice";
import {useSettingsStore} from "../store/settings";

const practiceStore = usePracticeStore()
const settingsStore = useSettingsStore()

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
</script>

<template>
  <div class="instrument-option">
    <span>Target BPM: </span>
    <Select
      v-model="settingsStore.practice.targetBPM"
      class="target-bpm-control"
      :options="makeTargetBPMOptions()"
    />
  </div>
  <span class="feedback-text">
    Play Rate: {{ practiceStore.playRateDisplay }}
  </span>
  <Button
    :label="practiceStore.practicing ? 'Stop' : 'Start' "
    :severity="practiceStore.practicing ? 'danger' : 'info'"
    size="small"
    @click="practiceStore.practicing ? practiceStore.stop() : practiceStore.start()"
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
</style>
<script setup lang="ts">
import {Button, Select} from "primevue";
import {NONE_VALUE, usePracticeStore} from "../store/practice";
import {useSettingsStore} from "../store/settings";
import {computed} from "vue";
import {useRoutineStore} from "../store/routineEdit";

const practiceStore = usePracticeStore();
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
    <span>Routine: </span>
    <Select
      v-model="practiceStore.selectedRoutine"
      :options="routineOptions"
      option-label="name"
      option-value="value"
    />
  </div>
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
    :disabled="!practiceStore.practicing && practiceStore.complete"
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

.instrument-option {
  margin: 0 .5rem;
}
</style>
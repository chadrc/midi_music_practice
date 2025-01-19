<script setup lang="ts">
import {Button, SelectButton, Dialog, Select, Slider, Toolbar, Splitter, SplitterPanel} from "primevue";
import {usePracticeStore} from "../store/practice";
import {markRaw, ref} from "vue";
import {useSettingsStore} from "../store/settings";
import Settings from "./SettingsView.vue";
import PromptsView from "./PromptsView.vue";
import RoutineEditView from "./RoutineEditView.vue";
import InstrumentPanel from "./InstrumentPanel.vue";

interface ViewOption {
  name: string;
  component: object;
}

const practiceStore = usePracticeStore()
const settingsStore = useSettingsStore()

const settingsOpen = ref(false)
const views = [
  {
    name: "Practice",
    component: markRaw(PromptsView),
  },
  {
    name: "Routines",
    current: false,
    component: markRaw(RoutineEditView),
  }
];

const currentView = ref<ViewOption>(views[0]);

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
  <section class="practice-view">
    <section class="practice-controls">
      <Toolbar>
        <template #start>
          <SelectButton
            v-model="currentView"
            :options="views"
            option-label="name"
            :option-disabled="(data) => data.name === currentView.name"
          />
        </template>
        <template #center>
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
        <template #end>
          <div class="volume-control">
            <span>Volume</span>
            <Slider
              v-model="settingsStore.instruments.volume"
              class="volume-slider"
              :min="0"
              :max="1"
              :step=".01"
            />
          </div>
          <Button
            icon="pi pi-cog"
            aria-label="Settings"
            @click="settingsOpen = true"
          />
        </template>
      </Toolbar>
      <Dialog
        v-model:visible="settingsOpen"
        modal
        header="Settings"
        :style="{ width: '90%', height: '90%' }"
      >
        <Settings />
      </Dialog>
    </section>
    <Splitter
      class="splitter"
      layout="vertical"
      style="height: 500px"
    >
      <SplitterPanel>
        <div class="active-view">
          <component :is="currentView.component" />
        </div>
      </SplitterPanel>
      <SplitterPanel>
        <InstrumentPanel />
      </SplitterPanel>
    </Splitter>
  </section>
</template>

<style scoped>
.practice-view {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}

.practice-controls {
  margin: 1rem;
}

.volume-control {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.volume-control > span {
  padding: 0.5rem;
}

.volume-slider {
  margin: 0.5rem;
  width: 10rem;
}

.splitter {
  flex: 1;
  border: none;
  background: none;
}

.active-view {
  height: 100%;
  overflow-y: scroll;
  margin: 0 1rem 1rem 1rem;
}

.feedback-text {
  margin-left: 1rem;
  margin-right: 1rem;
}

.instrument-option {
  margin-right: 0.5rem;
}

.chord-ratio-slider-wrapper > span {
  margin-bottom: 0.5rem;
}
</style>
<script setup lang="ts">
import {Button, SelectButton, Dialog, Slider, Toolbar, Splitter, SplitterPanel} from "primevue";
import {markRaw, ref} from "vue";
import {useSettingsStore} from "../store/settings";
import Settings from "./SettingsView.vue";
import PromptsView from "./PromptsView.vue";
import RoutineEditView from "./RoutineEditView.vue";
import InstrumentPanel from "./InstrumentPanel.vue";
import PracticeControls from "./PracticeControls.vue";
import RoutineEditControls from "./RoutineEditControls.vue";
import EarTrainingView from "../ear_training/components/EarTrainingView.vue";
import EarTrainingControls from "../ear_training/components/EarTrainingControls.vue";

interface ViewOption {
  name: string;
  component: object;
  toolbar: object;
  overflow: boolean;
}

const settingsStore = useSettingsStore()

const settingsOpen = ref(false)
const views = [
  {
    name: "Practice",
    component: markRaw(PromptsView),
    toolbar: markRaw(PracticeControls),
    overflow: false,
  },
  {
    name: "Ear Training",
    component: markRaw(EarTrainingView),
    toolbar: markRaw(EarTrainingControls),
    overflow: true,
  },
  {
    name: "Routines",
    component: markRaw(RoutineEditView),
    toolbar: markRaw(RoutineEditControls),
    overflow: true,
  }
];

const currentView = ref<ViewOption>(views[0]);

function makeOverflowClass(overflow: boolean) {
  if (overflow) {
    return "overflow";
  }

  return "";
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
            :disabled="settingsStore.editingDisabled"
            :option-disabled="(data) => data.name === currentView.name"
          />
        </template>
        <template #center>
          <component :is="currentView.toolbar" />
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
        <div
          class="active-view"
          :class="makeOverflowClass(currentView.overflow)"
        >
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
  margin: 0 1rem 0 1rem;
  overflow: hidden;
  scrollbar-width: none;
}

.overflow {
  overflow-y: scroll;
  scrollbar-width: thin;
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
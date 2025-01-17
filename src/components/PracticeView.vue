<script setup lang="ts">
import {Button, Dialog, Select, Slider, Tab, TabList, TabPanel, TabPanels, Tabs, ToggleButton, Toolbar} from "primevue";
import {PromptData, usePracticeStore} from "../store/practice";
import NoteGrid from "./NoteGrid.vue";
import {computed, ref} from "vue";
import ScaleSelect from "./ScaleSelect.vue";
import {NoteRangeType, useSettingsStore} from "../store/settings";
import {SCALES} from "../notes/scales";
import Settings from "./SettingsView.vue";
import RNBOPatch from "./RNBOPatch.vue";

const practiceStore = usePracticeStore()
const settingsStore = useSettingsStore()

const settingsOpen = ref(false)

function formatPromptColor(prompt: PromptData) {
  if (prompt.success) return 'var(--p-gray-800)';
  return `var(--p-${prompt.prompt.color}-800`;
}

function formatPracticeTime() {
  let seconds = practiceStore.practiceSessionTime % 60;
  let minutes = Math.floor(practiceStore.practiceSessionTime / 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function makeNoteRangeOptions() {
  return [
    {
      name: "Notes",
      value: NoteRangeType.Notes
    },
    {
      name: "Frets",
      value: NoteRangeType.Frets
    },
    {
      name: "Octaves",
      value: NoteRangeType.Octaves
    }
  ]
}

const noteRangeValues = computed(() => {
  return [settingsStore.currentRange.start, settingsStore.currentRange.end];
})

const noteRangeMax = computed(() => {
  switch (settingsStore.practice.noteRangeType) {
    case NoteRangeType.Notes:
      return 127;
    case NoteRangeType.Frets:
      return 22;
    case NoteRangeType.Octaves:
      return 12;
    default:
      return 0;
  }
})

const gridStyle = computed(() => {
  switch (settingsStore.practice.noteRangeType) {
    case NoteRangeType.Notes:
      return "box"
    case NoteRangeType.Frets:
      return "circle"
    case NoteRangeType.Octaves:
      return "bar"
    default:
      return "box";
  }
})

const gridColumns = computed(() => {
  switch (settingsStore.practice.noteRangeType) {
    case NoteRangeType.Notes:
      return 12
    case NoteRangeType.Frets: {
      const {start, end} = settingsStore.practice.fretRangeOptions.range;
      return end - start + 1
    }
    case NoteRangeType.Octaves:
      return practiceStore.selectedNotes.length
    default:
      return 0;
  }
})

const gridHeaders = computed(() => {
  switch (settingsStore.practice.noteRangeType) {
    case NoteRangeType.Notes:
      return []
    case NoteRangeType.Frets: {
      const {start, end} = settingsStore.practice.fretRangeOptions.range;
      const headers = []
      for (let i = start; i <= end; ++i) {
        headers.push(i.toString())
      }

      return headers
    }
    case NoteRangeType.Octaves:
      return []
    default:
      return [];
  }
})

const gridNoteFormat = computed(() => {
  switch (settingsStore.practice.noteRangeType) {
    case NoteRangeType.Notes:
      return "letter-octave"
    case NoteRangeType.Frets:
      return "letter-octave"
    case NoteRangeType.Octaves:
      return "letter"
    default:
      return "letter";
  }
})

const selectedScale = computed(() => {
  let {setName, baseNote} = settingsStore.practice.scale
  return SCALES[setName][baseNote];
})

function updateNoteRange(range: number[]) {
  let s = settingsStore.practice
  switch (s.noteRangeType) {
    case NoteRangeType.Notes:
      s.noteRangeOptions.range.start = range[0]
      s.noteRangeOptions.range.end = range[1]
      break;
    case NoteRangeType.Frets:
      s.fretRangeOptions.range.start = range[0]
      s.fretRangeOptions.range.end = range[1]
      break;
    case NoteRangeType.Octaves:
      s.octaveRangeOptions.range.start = range[0]
      s.octaveRangeOptions.range.end = range[1]
      break;
  }
}

</script>

<template>
  <section class="practice-view">
    <section class="practice-controls">
      <Toolbar>
        <template #start>
          <Button
            icon="pi pi-cog"
            aria-label="Settings"
            @click="settingsOpen = true"
          />
        </template>
        <template #center>
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
    <div class="prompt-area">
      <div
        v-for="prompt in practiceStore.activePrompts"
        :key="prompt.prompt.index"
        :class="`prompt-column ${prompt.current ? 'current' : ''}`"
      >
        <div
          class="prompt-card"
          :style="{backgroundColor: formatPromptColor(prompt)}"
        >
          <span
            v-for="note in prompt.prompt.displays"
            :key="note.note"
            class="prompt-text"
          >
            <span>{{ note.note }}</span>
            <span class="chord-text">{{ note.chordType }}</span>
          </span>
        </div>
      </div>
    </div>
    <Tabs value="instrument">
      <TabList class="centered">
        <Tab value="instrument">
          Instrument
        </Tab>
        <Tab value="patch">
          Patch
        </Tab>
        <Tab value="options">
          Options
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="instrument">
          <div class="instrument-options">
            <div class="instrument-option">
              <div class="chord-ratio-slider-wrapper">
                <span>Chords Per Set: {{ settingsStore.practice.chordRatio }}</span>
                <Slider
                  v-model="settingsStore.practice.chordRatio"
                  :max="settingsStore.chordRatioMax"
                  class="note-range-slider"
                />
              </div>
            </div>
            <div class="instrument-option">
              <ToggleButton
                v-model="settingsStore.practice.requireOctave"
                on-label="Octave On"
                off-label="Octave Off"
              />
            </div>
            <div class="instrument-option">
              <ScaleSelect
                v-model="settingsStore.practice.scale"
                :disabled="practiceStore.practicing"
              />
            </div>
            <div class="instrument-option">
              <Select
                v-model="settingsStore.practice.noteRangeType"
                :options="makeNoteRangeOptions()"
                option-value="value"
                option-label="name"
              />
            </div>
            <div class="instrument-option">
              <div class="note-range-slider-wrapper">
                <span>{{ noteRangeValues[0] }}</span>
                <Slider
                  :model-value="noteRangeValues"
                  :max="noteRangeMax"
                  range
                  class="note-range-slider"
                  @value-change="updateNoteRange"
                />
                <span>{{ noteRangeValues[1] }}</span>
              </div>
            </div>
          </div>
          <div class="instrument-display">
            <NoteGrid
              :notes="practiceStore.selectedNotes"
              :scale="selectedScale"
              :note-style="gridStyle"
              :headers="gridHeaders"
              :columns="gridColumns"
              :note-format="gridNoteFormat"
            />
          </div>
        </TabPanel>
        <TabPanel value="patch">
          <Suspense>
            <RNBOPatch />
            <template #fallback>
              Loading Instrument...
            </template>
          </Suspense>
        </TabPanel>
        <TabPanel value="options">
          <div class="option-control">
            <span>Min Velocity for Success</span>
            <Slider
              v-model="settingsStore.practice.minSuccessVelocity"
              class="min-success-slider"
              :max="127"
            />
            <span>{{ settingsStore.practice.minSuccessVelocity }}</span>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </section>
</template>

<style>
.p-tablist.centered .p-tablist-tab-list {
  justify-content: center;
  align-items: center;
}

.settings-dialog-content {
  height: 100%;
}
</style>

<style scoped>
.p-tabs {
  height: unset;
}

.practice-view {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}

.practice-controls {
  margin: 1rem
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

.settings-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.settings-wrapper {
  flex: 1;
}

.prompt-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.prompt-column {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 1rem;
}

.prompt-column.current {
  background-color: var(--p-zinc-500);
}

.prompt-card {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  aspect-ratio: 1;
  border-radius: 50%;
  font-size: 2rem;
}

.prompt-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
}

.prompt-text > .chord-text {
  font-size: 1rem;
}

.feedback-text {
  margin-left: 1rem;
}

.instrument-display {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: scroll;
}

.instrument-display::-webkit-scrollbar {
  display: none;
}

.instrument-options {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.instrument-option {
  margin-right: 0.5rem;
}

.note-range-slider {
  width: 10rem;
  margin-left: 1rem;
  margin-right: 1rem;
}

.note-range-slider-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 1rem;
  margin-right: 1rem;
}

.chord-ratio-slider-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.chord-ratio-slider-wrapper > span {
  margin-bottom: 0.5rem;
}

.option-control {
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.min-success-slider {
  width: 10rem;
  margin-left: 1rem;
  margin-right: 1rem;
}
</style>
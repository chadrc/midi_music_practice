<script setup lang="ts">

// reverse order so the lowest note is at bottom
import {formatMidiLetter, formatMidiNote} from "../notes";
import {Panel, Button, Toolbar, Slider, Select, Tabs, Tab, TabList, TabPanel, TabPanels} from "primevue";
import {usePracticeStore} from "../store/practice";
import NoteGrid from "./NoteGrid.vue";
import {computed} from "vue";
import {exists} from "../utilities";
import ScaleSelect from "./ScaleSelect.vue";
import {NoteRangeType, useSettingsStore} from "../store/settings";
import {SCALES} from "../notes/scales";
import Settings from "./Settings.vue";
import RNBOPatch from "./RNBOPatch.vue";

const practiceStore = usePracticeStore()
const settingsStore = useSettingsStore()

const displayPrompts = computed(() => {
  let prompts = practiceStore.activePrompts
      .map(prompt => (exists(prompt) ? {
            current: false,
            ...practiceStore.prompts[prompt],
          } : {
            current: false,
            note: null,
            color: null,
          })
      )

  if (prompts[practiceStore.currentPrompt]) {
    prompts[practiceStore.currentPrompt].current = true;
  }

  return prompts;
})

const noteSize = computed(() => settingsStore.practiceSettings.requireOctave ? 8 : 10)

function formatPromptColor(prompt) {
  if (!prompt.color) return 'var(--p-gray-800)';
  return `var(--p-${prompt.color}-800`;
}

function formatPromptNote(prompt) {
  if (!prompt.note) return '';

  if (settingsStore.practiceSettings.requireOctave) {
    return formatMidiNote(prompt.note)
  }
  return formatMidiLetter(prompt.note)
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

const gridStyle = computed(() => {
  switch (settingsStore.practiceSettings.noteRangeType) {
    case NoteRangeType.Notes:
      return "box"
    case NoteRangeType.Frets:
      return "circle"
    case NoteRangeType.Octaves:
      return "bar"
  }
})

const gridColumns = computed(() => {
  switch (settingsStore.practiceSettings.noteRangeType) {
    case NoteRangeType.Notes:
      return 12
    case NoteRangeType.Frets:
      let {startFret, endFret} = settingsStore.practiceSettings.fretRangeOptions;
      return endFret - startFret + 1
    case NoteRangeType.Octaves:
      return practiceStore.selectedNotes.length
  }
})

const gridHeaders = computed(() => {
  switch (settingsStore.practiceSettings.noteRangeType) {
    case NoteRangeType.Notes:
      return []
    case NoteRangeType.Frets:
      let {startFret, endFret} = settingsStore.practiceSettings.fretRangeOptions;
      let headers = []
      for (let i = startFret; i <= endFret; ++i) {
        headers.push(i.toString())
      }

      return headers
    case NoteRangeType.Octaves:
      return []
  }
})

const gridNoteFormat = computed(() => {
  switch (settingsStore.practiceSettings.noteRangeType) {
    case NoteRangeType.Notes:
      return "letter-octave"
    case NoteRangeType.Frets:
      return "letter-octave"
    case NoteRangeType.Octaves:
      return "letter"
  }
})

const selectedScale = computed(() => {
  let {setName, baseNote} = settingsStore.practiceSettings.scale
  return SCALES[setName][baseNote];
})

</script>

<template>
  <section class="practice-view">
    <section class="practice-controls">
      <Toolbar>
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
    </section>
    <div class="prompt-area">
      <div
        v-for="prompt in displayPrompts"
        :key="prompt.note"
        :class="`prompt-column ${prompt.current ? 'current' : ''}`"
      >
        <div
          class="prompt-card"
          :style="{backgroundColor: formatPromptColor(prompt)}"
        >
          <span
            class="prompt-text"
            :style="{fontSize: `${noteSize}vh`}"
          >
            {{ formatPromptNote(prompt) }}
          </span>
        </div>
      </div>
    </div>
    <Tabs value="instrument">
      <TabList>
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
              <ScaleSelect
                v-model="settingsStore.practiceSettings.scale"
                :disabled="practiceStore.practicing"
              />
            </div>
            <div class="instrument-option">
              <Select
                v-model="settingsStore.practiceSettings.noteRangeType"
                :options="makeNoteRangeOptions()"
                option-value="value"
                option-label="name"
              />
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
        <TabPanel value="options" />
      </TabPanels>
    </Tabs>
  </section>
</template>

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
  height: calc(10vh + 5vw);
  aspect-ratio: 1;
  border-radius: 50%;
}

.prompt-text {
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
}

.feedback-text {
  margin-left: 1rem;
}

.instrument-display {
  display: flex;
  justify-content: center;
  align-items: center;
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

.volume-slider {
  width: 10rem;
}
</style>
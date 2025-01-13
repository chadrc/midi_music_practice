<script setup lang="ts">

// reverse order so the lowest note is at bottom
import {formatMidiLetter, formatMidiNote} from "../notes";
import {Panel, Button, Toolbar, Slider, Select} from "primevue";
import {usePracticeStore} from "../store/practice";
import NoteGrid from "./NoteGrid.vue";
import {computed} from "vue";
import {exists} from "../utilities";
import ScaleSelect from "./ScaleSelect.vue";
import {NoteRangeType, useSettingsStore} from "../store/settings";
import {SCALES} from "../notes/scales";

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
        <template #start>
          <ScaleSelect
            v-model="settingsStore.practiceSettings.scale"
            :disabled="practiceStore.practicing"
          />
          <Select
            v-model="settingsStore.practiceSettings.noteRangeType"
            :options="makeNoteRangeOptions()"
            option-value="value"
            option-label="name"
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
          <Slider
            v-model="settingsStore.instruments.volume"
            class="volume-slider"
            :min="0"
            :max="1"
            :step=".01"
          />
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
    <Panel
      header="Instrument"
      toggleable
    >
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
    </Panel>
  </section>
</template>

<style scoped>
.practice-view {
  height: 100%;
  display: flex;
  flex-direction: column;
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

.volume-slider {
  width: 10rem;
}
</style>
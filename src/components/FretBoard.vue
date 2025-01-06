<script setup lang="ts">

// reverse order so the lowest note is at bottom
import {formatMidiLetter, formatMidiNote} from "../notes";
import {Panel, Button, Toolbar, CascadeSelect} from "primevue";
import {usePracticeStore} from "../store/practice";
import NoteGrid from "./NoteGrid.vue";
import {computed} from "vue";
import {exists} from "../utilities";
import ScaleSelect from "./ScaleSelect.vue";
import {NoteScale} from "../notes/scales";

const practiceStore = usePracticeStore()

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

const noteSize = computed(() => practiceStore.requireOctave ? 8 : 10)

function formatPromptColor(prompt) {
  if (!prompt.color) return 'var(--p-gray-800)';
  return `var(--p-${prompt.color}-800`;
}

function formatPromptNote(prompt) {
  if (!prompt.note) return '';

  if (practiceStore.requireOctave) {
    return formatMidiNote(prompt.note)
  }
  return formatMidiLetter(prompt.note)
}

function formatPracticeTime() {
  let seconds = practiceStore.practiceSessionTime % 60;
  let minutes = Math.floor(practiceStore.practiceSessionTime / 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function onScaleSelected(scale: NoteScale) {
  practiceStore.scale = scale
}
</script>

<template>
  <section class="practice-view">
    <section class="practice-controls">
      <Toolbar>
        <template #start>
          <ScaleSelect
            :value="practiceStore.scale"
            :disabled="practiceStore.practicing"
            @scale-selected="onScaleSelected"
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
          <span class="practice-time">
            Time: {{ formatPracticeTime() }}
          </span>
          <span class="practice-time">
            Notes Played: {{ practiceStore.successCount }}
          </span>
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
    <Panel header="Instrument">
      <div class="instrument-display">
        <NoteGrid
          :notes="practiceStore.selectedNotes"
          :scale="practiceStore.scale"
          note-style="circle"
          :headers="['0', '1', '2', '3', '4']"
          :columns="5"
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

.instrument-display {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
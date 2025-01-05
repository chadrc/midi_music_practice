<script setup lang="ts">

// reverse order so the lowest note is at bottom
import {formatMidiLetter} from "../notes";
import {Panel, Button} from "primevue";
import {usePracticeStore} from "../store/practice";
import NoteGrid from "./NoteGrid.vue";
import {computed} from "vue";
import {exists} from "../utilities";

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

function formatPromptColor(prompt) {
  if (!prompt.color) return 'var(--p-gray-800)';
  return `var(--p-${prompt.color}-800`;
}

function formatPromptNote(prompt) {
  if (!prompt.note) return '';
  return formatMidiLetter(prompt.note)
}

function formatPracticeTime() {
  let seconds = practiceStore.practiceSessionTime % 60;
  let minutes = Math.floor(practiceStore.practiceSessionTime / 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
</script>

<template>
  <section class="practice-view">
    <section class="practice-controls">
      <Button
        label="Start"
        size="small"
        @click="practiceStore.start()"
      >
        Start
      </Button>
      <span class="practice-time">
        Time: {{ formatPracticeTime() }}
      </span>
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
          <span class="prompt-text">
            {{ formatPromptNote(prompt) }}
          </span>
        </div>
      </div>
    </div>
    <Panel header="Instrument">
      <div class="instrument-display">
        <NoteGrid
          :notes="practiceStore.selectedNotes"
          note-style="circle"
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
  height: 20vh;
  aspect-ratio: 1;
  border-radius: 50%;
}

.prompt-text {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 7vh;
  font-weight: bold;
}

.instrument-display {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
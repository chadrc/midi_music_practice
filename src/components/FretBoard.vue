<script setup lang="ts">

// reverse order so the lowest note is at bottom
import {formatMidiLetter, formatMidiNote} from "../notes";
import {Panel, Card, Button} from "primevue";
import {usePracticeStore} from "../store/practice";
import NoteGrid from "./NoteGrid.vue";

const practiceStore = usePracticeStore()

const fretMidiNotes = [64, 59, 55, 50, 45, 40]
const fretCount = Array.from(Array(5).keys());


function formatPromptColor(color: string) {
  return `var(--p-${color}-900`;
}

function formatPracticeTime() {
  let seconds = practiceStore.startTime % 60;
  let minutes = Math.floor(seconds / 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
</script>

<template>
  <section class="practice-view">
    <section class="practice-controls">
      <Button label="Start"
              size="small"
              @click="practiceStore.start()">
        Start
      </Button>
      <span class="practice-time">
      Time: {{ formatPracticeTime() }}
    </span>
    </section>
    <div class="prompt-area">
      <div class="prompt-card"
           v-for="prompt in practiceStore.prompts"
           :style="{backgroundColor: formatPromptColor(prompt.color)}">
        <span class="prompt-text">
          {{ formatMidiLetter(prompt.note) }}
        </span>
      </div>
    </div>
    <Panel header="Instrument">
      <div class="instrument-display">
        <NoteGrid :notes="practiceStore.selectedNotes"
                  note-style="circle"
                  :columns="5"/>
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
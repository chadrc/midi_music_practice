<script setup lang="ts">
import {Button} from "primevue";
import {PromptData, usePracticeStore} from "../store/practice";

const practiceStore = usePracticeStore();

function formatPromptColor(prompt: PromptData) {
  if (prompt.success) return 'var(--p-gray-800)';
  return `var(--p-${prompt.prompt.color}-800`;
}
</script>

<template>
  <div
    v-if="practiceStore.activePrompts.length > 0"
    class="prompt-area"
  >
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
  <div
    v-else-if="practiceStore.activePrompts.length === 0 && practiceStore.practicing"
    class="advance-step"
  >
    <span>No Prompts</span>
    <Button @click="practiceStore.advanceStep">
      Next Step
    </Button>
  </div>
  <div
    v-else 
    class="prompt-area"
  >
    <h1>Press start to practice</h1>
  </div>
</template>

<style scoped>
.prompt-area {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
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

.advance-step {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.advance-step > span {
  margin-bottom: 1rem;
}
</style>
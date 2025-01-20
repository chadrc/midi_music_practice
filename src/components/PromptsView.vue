<script setup lang="ts">
import {Button, Step, StepList, Stepper} from "primevue";
import {PromptData, usePracticeStore} from "../store/practice";
import {exists} from "../utilities";

const practiceStore = usePracticeStore();

function formatPromptColor(prompt: PromptData) {
  if (prompt.success) return 'var(--p-gray-800)';
  return `var(--p-${prompt.prompt.color}-800`;
}
</script>

<template>
  <Stepper
    v-if="exists(practiceStore.routine) && practiceStore.routine.parts.length > 0"
    :value="practiceStore.currentPart + 1"
  >
    <StepList>
      <Step
        v-for="(item, index) in practiceStore.routine.parts"
        :key="index"
        :value="index + 1"
      >
        {{ item.name }}
      </Step>
      <Step :value="practiceStore.routine.parts.length + 1" />
    </StepList>
  </Stepper>
  <div
    v-if="practiceStore.activePrompts.length > 0"
    class="prompt-area"
  >
    <div
      class="repetition-display"
    >
      {{ practiceStore.currentRepetition + 1 }} / {{ practiceStore.targetRepetitions }}
    </div>
    <div class="prompt-cards">
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
    v-else-if="!practiceStore.practicing && practiceStore.complete"
    class="advance-step"
  >
    <span>Complete</span>
    <Button @click="practiceStore.finalize">
      Finish
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
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.repetition-display {
  display: flex;
  justify-content: center;
  align-items: center;
}

.prompt-cards {
  flex: 1;
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
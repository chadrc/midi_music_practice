<script setup lang="ts">
import {Button, Step, StepList, Stepper} from "primevue";
import {PromptData, usePracticeStore} from "../store/practice";
import {exists} from "../utilities";

const practiceStore = usePracticeStore();

function formatPromptColor(prompt: PromptData) {
  if (prompt.success) return 'var(--p-gray-800)';
  return `var(--p-${prompt.prompt.color}-800`;
}

function promptCardClass(prompt: PromptData) {
  const multi = prompt.prompt.displays.some(
    (d) => d.kind === "chord" || d.kind === "scale",
  );
  return multi ? "prompt-card prompt-card--wide" : "prompt-card";
}
</script>

<template>
  <Stepper
    v-if="practiceStore.routine != null && (practiceStore.routine.parts?.length ?? 0) > 0"
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
      <div
        v-if="practiceStore.currentRepetitionFocusLabel"
        class="repeat-focus-label"
      >
        {{ practiceStore.currentRepetitionFocusLabel }}
      </div>
      <div class="repetition-count">
        {{ practiceStore.currentRepetition + 1 }} / {{ practiceStore.targetRepetitions }}
      </div>
    </div>
    <div
      class="prompt-cards"
      :class="{
        'prompt-cards--over-eight': practiceStore.activePrompts.length > 8,
      }"
    >
      <div
        v-for="(prompt, pi) in practiceStore.activePrompts"
        :key="`${pi}-${prompt.prompt.index}`"
        :class="`prompt-column ${prompt.current ? 'current' : ''}`"
      >
        <div
          :class="promptCardClass(prompt)"
          :style="{backgroundColor: formatPromptColor(prompt)}"
        >
          <template
            v-for="(disp, di) in prompt.prompt.displays"
            :key="di"
          >
            <div
              v-if="disp.kind === 'note'"
              class="prompt-text"
            >
              <span>{{ disp.note }}</span>
            </div>
            <div
              v-else
              class="prompt-block"
            >
              <div class="prompt-title">
                {{ disp.title }}
              </div>
              <div class="prompt-cells">
                <span
                  v-for="(cell, ci) in disp.cells"
                  :key="ci"
                  class="prompt-cell"
                >{{ cell }}</span>
              </div>
            </div>
          </template>
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
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.repetition-count {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--p-zinc-500);
}

.repeat-focus-label {
  font-size: clamp(1.25rem, 2.5vw, 1.65rem);
  font-weight: 700;
  text-align: center;
  color: var(--p-zinc-200);
  line-height: 1.3;
  max-width: 36rem;
}

.prompt-cards {
  flex: 1;
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
}

/** More than 8 prompts: fixed 8 per row so the rest wrap without shrinking unreadably. */
.prompt-cards--over-eight {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  grid-auto-rows: auto;
  align-content: center;
  gap: 0.25rem 0;
  width: 100%;
  max-width: min(100%, 72rem);
  box-sizing: border-box;
}

.prompt-column {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 1rem;
}

.prompt-cards--over-eight .prompt-column {
  height: auto;
  min-height: 0;
  min-width: 0;
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

.prompt-card--wide {
  aspect-ratio: unset;
  min-height: 100px;
  min-width: 180px;
  max-width: 280px;
  border-radius: 1rem;
  padding: 0.75rem;
  flex-direction: column;
  font-size: 1rem;
  gap: 0.35rem;
}

.prompt-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
}

.prompt-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  width: 100%;
}

.prompt-title {
  font-size: 0.95rem;
  font-weight: bold;
  text-align: center;
  line-height: 1.2;
}

.prompt-cells {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35rem 0.5rem;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
  font-size: 1.1rem;
}

.prompt-cell {
  line-height: 1.2;
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

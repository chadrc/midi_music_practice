<script setup lang="ts">
import {Button, Step, StepList, Stepper} from "primevue";
import {computed} from "vue";
import {PromptData, usePracticeStore} from "../store/practice";
import {useSettingsStore} from "../store/settings";
import {inferVexKeySignature} from "../notation/staffKeySpelling";
import {formatDisplayNote} from "../routine";
import {isFreePlaySetPrompt, PracticeType} from "../routine/types";
import StaffAllPromptsRow from "./StaffAllPromptsRow.vue";

const practiceStore = usePracticeStore();
const settingsStore = useSettingsStore();

/** Tooltips for session stats column headers */
const STATS_TT_INCORRECT_NOTES =
  "Wrong presses at eligible velocity (at or above your minimum success velocity) over total Midi targets planned for each step—the sum across prompts of notes per chord (or equivalent).";

const STATS_TT_AVG_VELOCITY =
  "Mean Midi note-on velocity (1–127) for presses that meet your minimum success velocity. Shows “—” if there were none.";

const STATS_TT_BPM =
  "Completed prompt cards per minute. Each step timing starts at the first eligible-velocity strike on that step and ends when the last prompt there is cleared; overall BPM uses your session’s first such strike through the last cleared prompt anywhere, so silence between steps is included.";
/**
 * Key signature must follow the routine part that built these prompts. When “Not Matching” is on,
 * {@link useSettingsStore.currentSettings} still reflects the sidebar and may be a different practice type.
 */
const practiceForStaffKey = computed(() => {
  const part = practiceStore.currentRoutinePart;
  return part != null ? part.bakedSettings.practice : settingsStore.currentSettings.practice;
});

/** Focus prompt for combined staff (key sig matches what you’re playing now). */
const activeStaffPrompt = computed(
  () => practiceStore.activePrompts[practiceStore.currentPrompt] ?? practiceStore.activePrompts[0],
);

const staffAllMode = computed(() => settingsStore.practiceUi.promptDisplay === "staffAll");

const freePlayInSet = computed(() => {
  const part = practiceStore.currentRoutinePart;
  if (practiceStore.activePrompts.length > 0) {
    return practiceStore.activePrompts.some((row) => isFreePlaySetPrompt(row.prompt));
  }
  if (part == null) {
    return false;
  }
  const b = part.bakedSettings;
  return (
    b.freePlayInSet === true &&
    (b.practice.type === PracticeType.Chords || b.practice.type === PracticeType.Scales)
  );
});

function formatPromptColor(prompt: PromptData) {
  if (prompt.success) return 'var(--p-gray-800)';
  return `var(--p-${prompt.prompt.color}-800)`;
}

function freePlayPlayedLabel(pd: PromptData): string {
  if (pd.freePlayResolvedMidi == null) {
    return "";
  }
  return formatDisplayNote(settingsStore.currentSettings.requireOctave, pd.freePlayResolvedMidi);
}

function promptCardClass(prompt: PromptData) {
  if (isFreePlaySetPrompt(prompt.prompt)) {
    return "prompt-card";
  }
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
      v-if="staffAllMode"
      class="prompt-staff-all"
    >
      <StaffAllPromptsRow
        :prompts="practiceStore.activePrompts"
        :free-play="freePlayInSet"
        :require-octave="settingsStore.currentSettings.requireOctave"
        :staff-accidentals="settingsStore.practiceUi.staffAccidentals"
        :vex-key="
          inferVexKeySignature(
            practiceForStaffKey,
            activeStaffPrompt?.prompt.notes ?? [],
            activeStaffPrompt?.prompt.staffFundamentalMapKey,
          )
        "
      />
    </div>
    <div
      v-if="!staffAllMode"
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
          <template v-if="isFreePlaySetPrompt(prompt.prompt)">
            <div
              v-if="prompt.success && prompt.freePlayResolvedMidi != null"
              class="prompt-text"
            >
              <span>{{ freePlayPlayedLabel(prompt) }}</span>
            </div>
            <span
              v-else
              class="prompt-blank"
              aria-hidden="true"
            >&nbsp;</span>
          </template>
          <template v-else>
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
    class="advance-step advance-step--complete"
  >
    <span class="complete-title">
      Complete
    </span>
    <section
      v-if="practiceStore.sessionNoteStats"
      class="session-stats"
      aria-label="Practice session statistics"
    >
      <table class="stats-table">
        <thead>
          <tr>
            <th scope="col">
              Step
            </th>
            <th scope="col">
              <span class="stats-th-inner">
                <span>Incorrect / notes in step</span>
                <button
                  v-tooltip.top="STATS_TT_INCORRECT_NOTES"
                  type="button"
                  class="stats-header-info-btn"
                  :aria-label="STATS_TT_INCORRECT_NOTES"
                >
                  <span
                    class="pi pi-info-circle"
                    aria-hidden="true"
                  />
                </button>
              </span>
            </th>
            <th scope="col">
              <span class="stats-th-inner">
                <span>Avg velocity</span>
                <button
                  v-tooltip.top="STATS_TT_AVG_VELOCITY"
                  type="button"
                  class="stats-header-info-btn"
                  :aria-label="STATS_TT_AVG_VELOCITY"
                >
                  <span
                    class="pi pi-info-circle"
                    aria-hidden="true"
                  />
                </button>
              </span>
            </th>
            <th scope="col">
              <span class="stats-th-inner">
                <span>BPM</span>
                <button
                  v-tooltip.top="STATS_TT_BPM"
                  type="button"
                  class="stats-header-info-btn"
                  :aria-label="STATS_TT_BPM"
                >
                  <span
                    class="pi pi-info-circle"
                    aria-hidden="true"
                  />
                </button>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, ri) in practiceStore.sessionNoteStats.steps"
            :key="ri"
          >
            <th scope="row">
              {{ row.partName.trim() !== '' ? row.partName : `Step ${ri + 1}` }}
            </th>
            <td class="stats-table-numeric">
              {{ row.incorrect }} / {{ row.expected }}
            </td>
            <td class="stats-table-numeric">
              {{ row.avgVelocity != null ? row.avgVelocity : "—" }}
            </td>
            <td class="stats-table-numeric">
              {{ row.bpm != null ? row.bpm : "—" }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">
              Overall
            </th>
            <td class="stats-table-numeric">
              {{ practiceStore.sessionNoteStats.totalIncorrect }} / {{ practiceStore.sessionNoteStats.totalExpected }}
            </td>
            <td class="stats-table-numeric">
              {{ practiceStore.sessionNoteStats.overallAvgVelocity != null ? practiceStore.sessionNoteStats.overallAvgVelocity : "—" }}
            </td>
            <td class="stats-table-numeric">
              {{ practiceStore.sessionNoteStats.overallBpm != null ? practiceStore.sessionNoteStats.overallBpm : "—" }}
            </td>
          </tr>
        </tfoot>
      </table>
    </section>
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

.prompt-staff-all {
  flex: 1;
  width: 100%;
  max-width: min(100%, 72rem);
  overflow-x: auto;
  display: flex;
  justify-content: center;
  align-items: stretch;
  min-height: 140px;
  box-sizing: border-box;
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

.advance-step--complete {
  gap: 0.25rem;
}

.complete-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem !important;
}

.session-stats {
  margin-bottom: 1.25rem;
  max-width: min(54rem, 100%);
}

.stats-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.925rem;
}

.stats-table th,
.stats-table td {
  padding: 0.35rem 0.6rem;
  text-align: left;
  border-bottom: 1px solid var(--p-content-border-color, rgba(255, 255, 255, 0.08));
}

.stats-table thead th {
  font-weight: 600;
  color: var(--p-zinc-400);
}

.stats-th-inner {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.stats-header-info-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: var(--p-content-border-radius, 9999px);
  background: transparent;
  color: var(--p-primary-color);
  opacity: 0.65;
  cursor: help;
  transition: opacity 120ms ease, background 120ms ease;
}

.stats-header-info-btn:hover {
  opacity: 1;
  background: var(--p-content-hover-background, rgba(255, 255, 255, 0.06));
}

.stats-header-info-btn:focus-visible {
  outline: 2px solid var(--p-primary-color);
  outline-offset: 2px;
  opacity: 1;
}

.stats-header-info-btn .pi {
  font-size: 0.85rem;
}

.stats-table-numeric {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.stats-table tfoot tr {
  font-weight: 600;
}

</style>

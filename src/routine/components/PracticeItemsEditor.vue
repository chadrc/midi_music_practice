<script setup lang="ts">
import {computed, watchEffect} from "vue";
import {InputNumber, MultiSelect, Select} from "primevue";
import {
    CHORD_TYPE_LABEL,
    SCALE_TYPE_LABEL,
} from "../../notes/notes";
import {
    CHORD_TYPE_OPTIONS,
    DEFAULT_PRACTICE_OCTAVE_RANGE,
    SCALE_TYPE_OPTIONS,
    PracticePoolMode,
    PracticeType,
    type ChordTypeId,
    type ScaleTypeId,
    type RoutineChordsPractice,
    type RoutineScalesPractice,
    type UserRoutineNoteRange,
} from "../types";
import {BaseNotes} from "../../notes/scales";
import {
    defaultUserRoutineNoteRange,
    ROUTINE_TRAVERSAL_OFFSET_MAX_STEP_INDEX,
    traversalPreviewOffsetLabels,
} from "..";
import RangeSlider from "./RangeSlider.vue";

const props = defineProps<{
    kind: "chords" | "scales",
    /** When set (e.g. from part/instrument settings), preview matches playable MIDI filtering. */
    noteRange?: UserRoutineNoteRange | null,
}>();

const practice = defineModel<RoutineChordsPractice | RoutineScalesPractice>({required: true});

const baseNoteOptions = Object.values(BaseNotes).map((b) => ({
    label: b.getName(),
    value: b.mapKey,
}));

const chordTypeOptions = CHORD_TYPE_OPTIONS.map((v) => ({
    label: CHORD_TYPE_LABEL[v as ChordTypeId],
    value: v,
}));

const scaleTypeOptions = SCALE_TYPE_OPTIONS.map((v) => ({
    label: SCALE_TYPE_LABEL[v as ScaleTypeId],
    value: v,
}));

const chordPoolModeOptions = [
    {label: "Up", value: PracticePoolMode.Up},
    {label: "Down", value: PracticePoolMode.Down},
    {label: "Up-Down", value: PracticePoolMode.UpDown},
    {label: "Random", value: PracticePoolMode.Random},
];

const scalePoolModeOptions = chordPoolModeOptions;

const previewNoteRange = computed(() => props.noteRange ?? defaultUserRoutineNoteRange());

const chordFields = computed(() => practice.value as RoutineChordsPractice);
const scaleFields = computed(() => practice.value as RoutineScalesPractice);

function offsetTooltipBinding(
    practice: RoutineChordsPractice | RoutineScalesPractice,
    leg: "up" | "down",
    step: number | null | undefined,
) {
    const lines = traversalPreviewOffsetLabels(practice, previewNoteRange.value, leg, step);
    const value =
        lines.length === 0 ? "No playable preview for this octave range." : lines.join("\n");
    return {
        value,
        class: "routine-offset-tooltip-root",
        fitContent: false,
    };
}

const chordUpTooltipBinding = computed(() =>
    offsetTooltipBinding(chordFields.value, "up", chordFields.value.upDownOffsetUp),
);
const chordDownTooltipBinding = computed(() =>
    offsetTooltipBinding(chordFields.value, "down", chordFields.value.upDownOffsetDown),
);
const scaleUpTooltipBinding = computed(() =>
    offsetTooltipBinding(scaleFields.value, "up", scaleFields.value.upDownOffsetUp),
);
const scaleDownTooltipBinding = computed(() =>
    offsetTooltipBinding(scaleFields.value, "down", scaleFields.value.upDownOffsetDown),
);

watchEffect(() => {
    const pv = practice.value;
    const chordsOk = props.kind === "chords" && pv.type === PracticeType.Chords;
    const scalesOk = props.kind === "scales" && pv.type === PracticeType.Scales;
    if (!chordsOk && !scalesOk) {
        return;
    }
    const p = pv as RoutineChordsPractice | RoutineScalesPractice;
    if (!p.octaveRange) {
        p.octaveRange = {...DEFAULT_PRACTICE_OCTAVE_RANGE};
    }
    if (p.mode === PracticePoolMode.Up || p.mode === PracticePoolMode.UpDown) {
        if (p.upDownOffsetUp == null) {
            p.upDownOffsetUp = 0;
        }
    }
    if (p.mode === PracticePoolMode.Down || p.mode === PracticePoolMode.UpDown) {
        if (p.upDownOffsetDown == null) {
            p.upDownOffsetDown = 0;
        }
    }

    const up = Math.max(0, Math.min(ROUTINE_TRAVERSAL_OFFSET_MAX_STEP_INDEX, Math.floor(p.upDownOffsetUp ?? 0)));
    const down = Math.max(0, Math.min(ROUTINE_TRAVERSAL_OFFSET_MAX_STEP_INDEX, Math.floor(p.upDownOffsetDown ?? 0)));
    if ((p.upDownOffsetUp ?? 0) !== up || (p.upDownOffsetDown ?? 0) !== down) {
        practice.value = {...p, upDownOffsetUp: up, upDownOffsetDown: down};
    }
});
</script>

<template>
  <div class="practice-items-editor">
    <template v-if="props.kind === 'chords'">
      <Select
        v-model="chordFields.baseNote"
        :options="baseNoteOptions"
        option-label="label"
        option-value="value"
        placeholder="Root (default)"
        show-clear
        class="practice-item-control"
      />
      <Select
        v-model="chordFields.mode"
        :options="chordPoolModeOptions"
        option-label="label"
        option-value="value"
        class="practice-item-control"
      />
      <MultiSelect
        v-model="chordFields.chordTypes"
        :options="chordTypeOptions"
        option-label="label"
        option-value="value"
        display="chip"
        filter
        placeholder="Chord types (defaults when empty)"
        class="practice-item-control practice-item-multiselect"
      />
      <div
        v-if="
          chordFields.mode === PracticePoolMode.Up ||
          chordFields.mode === PracticePoolMode.Down ||
          chordFields.mode === PracticePoolMode.UpDown
        "
        class="updown-offset-block"
      >
        <span v-if="chordFields.mode === PracticePoolMode.UpDown" class="octave-range-label">
          Up-Down: starting step (hover number for preview note per chord type in pool)
        </span>
        <span v-else-if="chordFields.mode === PracticePoolMode.Up" class="octave-range-label">
          Ascending: starting step — lowest part octave, each selected chord quality in pool order (tooltip)
        </span>
        <span v-else class="octave-range-label">
          Descending: starting step — tooltip shows note per chord type at this step index
        </span>
        <div
          v-if="chordFields.mode === PracticePoolMode.Up || chordFields.mode === PracticePoolMode.UpDown"
          class="updown-offset-row"
        >
          <label class="updown-offset-label">
            {{ chordFields.mode === PracticePoolMode.UpDown ? "Up repeat" : "Starting step" }}
          </label>
          <span
            v-tooltip.top="chordUpTooltipBinding"
            class="offset-input-hint-wrap"
          >
            <InputNumber
              v-model="chordFields.upDownOffsetUp"
              :min="0"
              :max="ROUTINE_TRAVERSAL_OFFSET_MAX_STEP_INDEX"
              show-buttons
              button-layout="horizontal"
              class="practice-item-control updown-offset-input"
            />
          </span>
        </div>
        <div
          v-if="chordFields.mode === PracticePoolMode.Down || chordFields.mode === PracticePoolMode.UpDown"
          class="updown-offset-row"
        >
          <label class="updown-offset-label">
            {{ chordFields.mode === PracticePoolMode.UpDown ? "Down repeat" : "Starting step" }}
          </label>
          <span
            v-tooltip.top="chordDownTooltipBinding"
            class="offset-input-hint-wrap"
          >
            <InputNumber
              v-model="chordFields.upDownOffsetDown"
              :min="0"
              :max="ROUTINE_TRAVERSAL_OFFSET_MAX_STEP_INDEX"
              show-buttons
              button-layout="horizontal"
              class="practice-item-control updown-offset-input"
            />
          </span>
        </div>
      </div>
      <div class="octave-range-block">
        <span class="octave-range-label">Chord root octaves</span>
        <RangeSlider
          v-model="chordFields.octaveRange"
          :min="-1"
          :max="9"
        />
      </div>
    </template>
    <template v-else>
      <Select
        v-model="scaleFields.baseNote"
        :options="baseNoteOptions"
        option-label="label"
        option-value="value"
        placeholder="Root (default)"
        show-clear
        class="practice-item-control"
      />
      <Select
        v-model="scaleFields.mode"
        :options="scalePoolModeOptions"
        option-label="label"
        option-value="value"
        class="practice-item-control"
      />
      <div
        v-if="
          scaleFields.mode === PracticePoolMode.Up ||
          scaleFields.mode === PracticePoolMode.Down ||
          scaleFields.mode === PracticePoolMode.UpDown
        "
        class="updown-offset-block"
      >
        <span v-if="scaleFields.mode === PracticePoolMode.UpDown" class="octave-range-label">
          Up-Down: starting step (hover number for preview note per scale type in pool)
        </span>
        <span v-else-if="scaleFields.mode === PracticePoolMode.Up" class="octave-range-label">
          Ascending: starting step — tooltip lists each scale in the multi-select pool
        </span>
        <span v-else class="octave-range-label">
          Descending: starting step — tooltip lists preview note per selected scale type
        </span>
        <div
          v-if="scaleFields.mode === PracticePoolMode.Up || scaleFields.mode === PracticePoolMode.UpDown"
          class="updown-offset-row"
        >
          <label class="updown-offset-label">
            {{ scaleFields.mode === PracticePoolMode.UpDown ? "Up repeat" : "Starting step" }}
          </label>
          <span
            v-tooltip.top="scaleUpTooltipBinding"
            class="offset-input-hint-wrap"
          >
            <InputNumber
              v-model="scaleFields.upDownOffsetUp"
              :min="0"
              :max="ROUTINE_TRAVERSAL_OFFSET_MAX_STEP_INDEX"
              show-buttons
              button-layout="horizontal"
              class="practice-item-control updown-offset-input"
            />
          </span>
        </div>
        <div
          v-if="scaleFields.mode === PracticePoolMode.Down || scaleFields.mode === PracticePoolMode.UpDown"
          class="updown-offset-row"
        >
          <label class="updown-offset-label">
            {{ scaleFields.mode === PracticePoolMode.UpDown ? "Down repeat" : "Starting step" }}
          </label>
          <span
            v-tooltip.top="scaleDownTooltipBinding"
            class="offset-input-hint-wrap"
          >
            <InputNumber
              v-model="scaleFields.upDownOffsetDown"
              :min="0"
              :max="ROUTINE_TRAVERSAL_OFFSET_MAX_STEP_INDEX"
              show-buttons
              button-layout="horizontal"
              class="practice-item-control updown-offset-input"
            />
          </span>
        </div>
      </div>
      <MultiSelect
        v-model="scaleFields.scaleTypes"
        :options="scaleTypeOptions"
        option-label="label"
        option-value="value"
        display="chip"
        filter
        placeholder="Scale types (major / Ionian when empty)"
        class="practice-item-control practice-item-multiselect"
      />
      <div class="octave-range-block">
        <span class="octave-range-label">Scale octaves (one random octave per prompt)</span>
        <RangeSlider
          v-model="scaleFields.octaveRange"
          :min="-1"
          :max="9"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.practice-items-editor {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.practice-item-control {
  min-width: 10rem;
}

.practice-item-multiselect {
  min-width: 14rem;
  width: 100%;
  max-width: 28rem;
}

.offset-input-hint-wrap {
  display: inline-flex;
}

.octave-range-block {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.octave-range-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

.updown-offset-block {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.updown-offset-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.updown-offset-label {
  font-size: 0.875rem;
  min-width: 7rem;
}

.updown-offset-input {
  width: auto;
}
</style>

<style>
/* PrimeVue tooltips are portaled to body; class comes from v-tooltip object binding */
.routine-offset-tooltip-root.p-tooltip {
  max-width: min(26rem, 94vw);
}

.routine-offset-tooltip-root .p-tooltip-text {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>

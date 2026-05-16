<script setup lang="ts">
import {computed, watchEffect} from "vue";
import {MultiSelect, Select, InputNumber} from "primevue";
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
} from "../types";
import {BaseNotes} from "../../notes/scales";
import RangeSlider from "./RangeSlider.vue";

const props = defineProps<{
    kind: "chords" | "scales",
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

/** UI cap; each scale segment clamps at generation time to its own length − 1. */
const UP_DOWN_OFFSET_MAX = 11;

const chordFields = computed(() => practice.value as RoutineChordsPractice);
const scaleFields = computed(() => practice.value as RoutineScalesPractice);

watchEffect(() => {
    if (props.kind === "chords" && practice.value.type === PracticeType.Chords) {
        const p = practice.value;
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
    } else if (props.kind === "scales" && practice.value.type === PracticeType.Scales) {
        const p = practice.value;
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
          Up-Down: starting chord tone index (0 = first in that direction along each voicing; clamped at run time)
        </span>
        <span v-else-if="chordFields.mode === PracticePoolMode.Up" class="octave-range-label">
          Ascending traversal: starting chord tone index (0 = lowest MIDI in the voicing; clamped at run time)
        </span>
        <span v-else class="octave-range-label">
          Descending traversal: starting chord tone index (0 = highest MIDI in the voicing; clamped at run time)
        </span>
        <div
          v-if="chordFields.mode === PracticePoolMode.Up || chordFields.mode === PracticePoolMode.UpDown"
          class="updown-offset-row"
        >
          <label class="updown-offset-label">
            {{ chordFields.mode === PracticePoolMode.UpDown ? "Up repeat" : "Starting step" }}
          </label>
          <InputNumber
            v-model="chordFields.upDownOffsetUp"
            :min="0"
            :max="UP_DOWN_OFFSET_MAX"
            show-buttons
            button-layout="horizontal"
            class="practice-item-control updown-offset-input"
          />
        </div>
        <div
          v-if="chordFields.mode === PracticePoolMode.Down || chordFields.mode === PracticePoolMode.UpDown"
          class="updown-offset-row"
        >
          <label class="updown-offset-label">
            {{ chordFields.mode === PracticePoolMode.UpDown ? "Down repeat" : "Starting step" }}
          </label>
          <InputNumber
            v-model="chordFields.upDownOffsetDown"
            :min="0"
            :max="UP_DOWN_OFFSET_MAX"
            show-buttons
            button-layout="horizontal"
            class="practice-item-control updown-offset-input"
          />
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
          Up-Down: starting scale step (0 = first degree in that direction; clamped per scale at run time)
        </span>
        <span v-else-if="scaleFields.mode === PracticePoolMode.Up" class="octave-range-label">
          Ascending traversal: starting scale step (0 = first degree low→high in the octave segment; clamped at run time)
        </span>
        <span v-else class="octave-range-label">
          Descending traversal: starting scale step (0 = first degree high→low in the octave segment; clamped at run time)
        </span>
        <div
          v-if="scaleFields.mode === PracticePoolMode.Up || scaleFields.mode === PracticePoolMode.UpDown"
          class="updown-offset-row"
        >
          <label class="updown-offset-label">
            {{ scaleFields.mode === PracticePoolMode.UpDown ? "Up repeat" : "Starting step" }}
          </label>
          <InputNumber
            v-model="scaleFields.upDownOffsetUp"
            :min="0"
            :max="UP_DOWN_OFFSET_MAX"
            show-buttons
            button-layout="horizontal"
            class="practice-item-control updown-offset-input"
          />
        </div>
        <div
          v-if="scaleFields.mode === PracticePoolMode.Down || scaleFields.mode === PracticePoolMode.UpDown"
          class="updown-offset-row"
        >
          <label class="updown-offset-label">
            {{ scaleFields.mode === PracticePoolMode.UpDown ? "Down repeat" : "Starting step" }}
          </label>
          <InputNumber
            v-model="scaleFields.upDownOffsetDown"
            :min="0"
            :max="UP_DOWN_OFFSET_MAX"
            show-buttons
            button-layout="horizontal"
            class="practice-item-control updown-offset-input"
          />
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

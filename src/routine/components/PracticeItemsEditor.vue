<script setup lang="ts">
import {watchEffect} from "vue";
import {MultiSelect, Select} from "primevue";
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

const poolModeOptions = [
    {label: "Up", value: PracticePoolMode.Up},
    {label: "Down", value: PracticePoolMode.Down},
    {label: "Random", value: PracticePoolMode.Random},
];

const chordFields = computed(() => practice.value as RoutineChordsPractice);
const scaleFields = computed(() => practice.value as RoutineScalesPractice);

watchEffect(() => {
    if (props.kind === "chords" && practice.value.type === PracticeType.Chords) {
        const p = practice.value;
        if (!p.octaveRange) {
            p.octaveRange = {...DEFAULT_PRACTICE_OCTAVE_RANGE};
        }
    } else if (props.kind === "scales" && practice.value.type === PracticeType.Scales) {
        const p = practice.value;
        if (!p.octaveRange) {
            p.octaveRange = {...DEFAULT_PRACTICE_OCTAVE_RANGE};
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
        :options="poolModeOptions"
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
        :options="poolModeOptions"
        option-label="label"
        option-value="value"
        class="practice-item-control"
      />
      <MultiSelect
        v-model="scaleFields.scaleTypes"
        :options="scaleTypeOptions"
        option-label="label"
        option-value="value"
        display="chip"
        filter
        placeholder="Scales (chromatic default when empty)"
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
</style>

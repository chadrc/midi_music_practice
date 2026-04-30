<script setup lang="ts">
import {computed} from "vue";
import {MultiSelect, Select} from "primevue";
import {
    CHORD_TYPE_LABEL,
    SCALE_TYPE_LABEL,
} from "../../notes/notes";
import {
    CHORD_TYPE_OPTIONS,
    SCALE_TYPE_OPTIONS,
    type ChordTypeId,
    type ScaleTypeId,
    type RoutineChordsPractice,
    type RoutineScalesPractice,
} from "../types";
import {BaseNotes} from "../../notes/scales";

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

const chordFields = computed(() => practice.value as RoutineChordsPractice);
const scaleFields = computed(() => practice.value as RoutineScalesPractice);
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
</style>

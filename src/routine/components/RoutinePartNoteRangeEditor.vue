<script setup lang="ts">
import {NoteRangeType, type UserRoutineNoteRange} from "../types";
import {maxForNoteRangeType, setNoteRangeType} from "..";
import NoteRangeSelect from "./NoteRangeSelect.vue";
import RangeSlider from "./RangeSlider.vue";

const model = defineModel<UserRoutineNoteRange>({required: true});

function onTypeChange(t: NoteRangeType) {
    setNoteRangeType(model.value, t);
}
</script>

<template>
  <div class="routine-note-range-editor">
    <NoteRangeSelect
      class="note-range-type-select"
      :model-value="model.type"
      @update:model-value="onTypeChange"
    />
    <RangeSlider
      v-model="model.range"
      :min="0"
      :max="maxForNoteRangeType(model.type)"
    />
  </div>
</template>

<style scoped>
.routine-note-range-editor {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
  flex: 1 1 auto;
  min-width: 0;
  width: 100%;
}

.note-range-type-select {
  flex: 0 0 auto;
  min-width: 8.5rem;
}

.routine-note-range-editor :deep(.note-range-slider-wrapper) {
  flex: 1 1 14rem;
  min-width: 12rem;
  margin-left: 0;
  margin-right: 0;
  justify-content: flex-start;
}

.routine-note-range-editor :deep(.note-range-slider) {
  flex: 1 1 auto;
  width: auto;
  min-width: 6rem;
  max-width: 20rem;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}
</style>

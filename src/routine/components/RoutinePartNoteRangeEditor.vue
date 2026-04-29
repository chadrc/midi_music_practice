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
      :model-value="model.type"
      @update:model-value="onTypeChange"
    />
    <span class="range-label">Range</span>
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
  flex-direction: column;
  gap: 0.75rem;
}

.range-label {
  font-size: 0.875rem;
  opacity: 0.85;
}
</style>

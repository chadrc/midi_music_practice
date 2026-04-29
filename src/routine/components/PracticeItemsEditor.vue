<script setup lang="ts">
import {Button, Select} from "primevue";
import {
    CHORD_TYPE_LABEL,
    SCALE_TYPE_LABEL,
} from "../../notes/notes";
import {
    CHORD_TYPE_OPTIONS,
    SCALE_TYPE_OPTIONS,
    type ChordTypeId,
    type ScaleTypeId,
    type PracticeChordSpec,
    type PracticeScaleSpec,
} from "../types";
import {BaseNotes} from "../../notes/scales";

defineProps<{
    kind: "chords" | "scales",
}>();

const items = defineModel<PracticeChordSpec[] | PracticeScaleSpec[]>({required: true});

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

function addItem() {
    items.value = [...items.value, {}];
}

function removeItem(index: number) {
    const next = items.value.slice();
    next.splice(index, 1);
    items.value = next.length > 0 ? next : [{}];
}

function asChordRow(i: number): PracticeChordSpec {
    return items.value[i] as PracticeChordSpec;
}

function asScaleRow(i: number): PracticeScaleSpec {
    return items.value[i] as PracticeScaleSpec;
}
</script>

<template>
  <div class="practice-items-editor">
    <div
      v-for="(_entry, index) in items"
      :key="index"
      class="practice-item-row"
    >
      <template v-if="kind === 'chords'">
        <Select
          v-model="asChordRow(index).baseNote"
          :options="baseNoteOptions"
          option-label="label"
          option-value="value"
          placeholder="Root (default)"
          show-clear
          class="practice-item-control"
        />
        <Select
          v-model="asChordRow(index).chordType"
          :options="chordTypeOptions"
          option-label="label"
          option-value="value"
          placeholder="Type (default)"
          show-clear
          class="practice-item-control"
        />
      </template>
      <template v-else>
        <Select
          v-model="asScaleRow(index).baseNote"
          :options="baseNoteOptions"
          option-label="label"
          option-value="value"
          placeholder="Root (default)"
          show-clear
          class="practice-item-control"
        />
        <Select
          v-model="asScaleRow(index).scaleType"
          :options="scaleTypeOptions"
          option-label="label"
          option-value="value"
          placeholder="Scale (default)"
          show-clear
          class="practice-item-control"
        />
      </template>
      <Button
        icon="pi pi-times"
        severity="secondary"
        rounded
        :disabled="items.length <= 1"
        @click="removeItem(index)"
      />
    </div>
    <Button
      label="Add"
      size="small"
      @click="addItem"
    />
  </div>
</template>

<style scoped>
.practice-items-editor {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.practice-item-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.practice-item-control {
  min-width: 10rem;
}
</style>

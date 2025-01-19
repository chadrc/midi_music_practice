<script setup lang="ts">
import {NoteRangeType} from "../types";
import {Select} from "primevue";

const model = defineModel<NoteRangeType>();

function makeNoteRangeOptions() {
  return [
    {
      name: "Notes",
      value: NoteRangeType.Notes
    },
    {
      name: "Frets",
      value: NoteRangeType.Frets
    },
    {
      name: "Octaves",
      value: NoteRangeType.Octaves
    }
  ]
}
</script>

<template>
  <Select
    v-model="model"
    :options="makeNoteRangeOptions()"
    option-value="value"
    option-label="name"
  />
</template>

<style scoped>

</style>
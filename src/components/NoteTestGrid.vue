<script setup lang="ts">
import {useSettingsStore} from "../store/settings";
import {Checkbox} from "primevue";
import NoteGrid from "./NoteGrid.vue";

const settingsStore = useSettingsStore();
const noteOrder = Array.from(Array(128).keys());
</script>

<template>
  <section class="note-test-grid-options">
    <span>Formatted</span>
    <Checkbox
      v-model="settingsStore.noteGrid.formatted"
      binary
    />
  </section>
  <NoteGrid
    :notes="noteOrder"
    :columns="12"
    :formatted="settingsStore.noteGrid.formatted"
  />
</template>

<style scoped>

.note-test-grid {
  display: flex;
  flex-wrap: wrap-reverse;
  width: calc(var(--note-test-grid-cell-size) * 12);
}

.note-test-cell {
  display: flex;
  width: var(--note-test-grid-cell-size);
  height: var(--note-test-grid-cell-size);
  justify-content: center;
  align-items: center;
  transition: opacity 0.2s;
}
</style>
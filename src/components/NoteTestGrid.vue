<script setup lang="ts">
import {formatMidiNote} from "../notes";
import {useMidiStore} from "../store/midi";

const midiStore = useMidiStore();
const noteOrder = Array.from(Array(128).keys());

function opacityForNote(note: number) {
  let playData = midiStore.playData[note];
  if (playData.on) {
    return 1;
  }
  return 0.25;
}
</script>

<template>
  <section class="note-test-grid">
    <div
      v-for="i in noteOrder"
      :key="i"
      :style="{opacity: opacityForNote(i)}"
      class="note-test-cell"
    >
      <span>{{ formatMidiNote(i) }}</span>
    </div>
  </section>
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
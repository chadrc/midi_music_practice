<script setup lang="ts">

// reverse order so the lowest note is at bottom
import {formatMidiNote} from "../notes";

const fretMidiNotes = [64, 59, 55, 50, 45, 40]
const fretCount = Array.from(Array(5).keys());

</script>

<template>
  <section class="fret-board">
    <ul
      v-for="fret in fretCount"
      :key="fret"
      class="fret"
    >
      <li
        v-for="fretNote in fretMidiNotes"
        :key="fretNote"
        class="fret-note"
      >
        {{ formatMidiNote(fretNote + fret) }}
      </li>
    </ul>
  </section>
</template>

<style scoped>
.fret-board {
  display: flex;
}

.fret {
  display: flex;
  list-style: none;
  flex-direction: column;
}

.fret-note {
  display: flex;
  width: var(--note-test-grid-cell-size);
  height: var(--note-test-grid-cell-size);
  justify-content: center;
  align-items: center;
  transition: opacity 0.2s;
}
</style>
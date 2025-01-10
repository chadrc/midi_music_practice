<script setup lang="ts">

import {formatMidiNote} from "../notes";
import {useMidiStore} from "../store/midi";
import {computed} from "vue";
import {NoteScale, CHROMATIC_SCALE} from "../notes/scales";
import {exists} from "../utilities";

interface NoteGridProps {
  notes: Array<number>,
  columns: number,
  formatted?: boolean,
  noteStyle?: "box" | "circle",
  scale?: NoteScale,
  headers?: string[],
}

const props = withDefaults(defineProps<NoteGridProps>(), {
  notes: () => [],
  formatted: true,
  noteStyle: "box",
  scale: () => CHROMATIC_SCALE,
  headers: () => [],
});

const midiStore = useMidiStore();

const rowCount = computed(() => Math.ceil(props.notes.length / props.columns));
const rowIndices = computed(() => Array.from(Array(rowCount.value).keys()));
const columnIndices = computed(() => Array.from(Array(props.columns).keys()));

const hueIncrement = 360 / 128;

function opacityForNote(row: number, column: number) {
  let note = midiNoteAtRowColumn(row, column);
  if (!exists(note)) {
    return 0;
  }

  let playData = midiStore.playData[note];
  if (playData.on) {
    return 1;
  }
  return 0.25;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function colorForNote(row: number, column: number) {
  let note = midiNoteAtRowColumn(row, column);
  let playData = midiStore.playData[note];
  let hue = note * hueIncrement;
  let saturation = lerp(25, 100, playData.velocity / 127);

  return `hsl(${hue}, ${saturation}%, 50%)`;
}

function makeStyleClass() {
  return `note-grid-cell note-style-${props.noteStyle}`
}

function midiNoteAtRowColumn(row: number, column: number) {
  return props.notes[row * props.columns + column];
}

function hasNote(row: number, column: number) {
  let note = midiNoteAtRowColumn(row, column);
  if (!exists(note)) {
    return false
  }
  return props.scale.contains(note);
}
</script>

<template>
  <section class="note-grid">
    <div v-for="r in rowIndices"
         :key="`row-${r}`"
         class="note-grid-row">
      <div
          v-for="c in columnIndices"
          :key="`cell-${r}-${c}`"
      >
        <div v-if="hasNote(r, c)"
             :style="{opacity: opacityForNote(r, c), 'background-color': colorForNote(r, c)}"
             :class="makeStyleClass()">
          <span>{{ props.formatted ? formatMidiNote(midiNoteAtRowColumn(r, c)) : midiNoteAtRowColumn(r, c) }}</span>
        </div>
        <div v-else
             :style="{opacity: opacityForNote(r, c)}"
             :class="`${makeStyleClass()} empty`">
        </div>
      </div>
    </div>
    <div v-if="props.headers.length > 0" class="note-grid-row header">
      <div v-for="header in props.headers">
        <div :class="`${makeStyleClass()} header`">
          <span>{{ header }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.note-grid {
  display: flex;
  flex-direction: column-reverse;
}

.note-grid-row {
  display: flex;
  flex-direction: row;
}

.note-grid-cell {
  display: flex;
  width: var(--note-test-grid-cell-size);
  height: var(--note-test-grid-cell-size);
  justify-content: center;
  align-items: center;
  transition: opacity 0.2s;
}

.note-grid-cell.header {
  background-color: var(--p-neutral-700);
}

.note-grid-cell.empty {
  background-color: var(--p-neutral-800);
}

.note-style-box {

}

.note-style-circle {
  margin: 0.1rem;
  border-radius: 50%;
}
</style>
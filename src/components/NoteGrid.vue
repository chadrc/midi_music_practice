<script setup lang="ts">

import {formatMidiLetter, formatMidiNote} from "../notes";
import {useMidiStore} from "../store/midi";
import {computed} from "vue";
import {NoteScale, SCALES, MINOR_PENTATONIC_SCALE_SET_NAME, BaseNotes, CHROMATIC_SCALE_SET_NAME} from "../notes/scales";
import {exists} from "../utilities";

interface NoteGridProps {
  notes: Array<number>,
  columns: number,
  noteStyle?: "box" | "circle" | "bar",
  scale?: NoteScale,
  headers?: string[],
  noteFormat?: "number" | "letter" | "letter-octave"
}

const props = withDefaults(defineProps<NoteGridProps>(), {
  notes: () => [],
  noteStyle: "box",
  scale: () => SCALES[CHROMATIC_SCALE_SET_NAME][BaseNotes[BaseNotes.C]],
  headers: () => [],
  noteFormat: "number",
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

const BLACK_KEYS_ONLY_SCALE = SCALES[MINOR_PENTATONIC_SCALE_SET_NAME][BaseNotes[BaseNotes.DSharp]]

function colorForNote(row: number, column: number) {
  let note = midiNoteAtRowColumn(row, column);
  let playData = midiStore.playData[note];
  let hue = note * hueIncrement;
  if (BLACK_KEYS_ONLY_SCALE.contains(note)) {
    let n = note + 64
    if (n > 127) {
      n -= 127
    }
    hue = n * hueIncrement;
  }
  let saturation = lerp(25, 100, playData.velocity / 127);

  return `hsl(${hue}, ${saturation}%, 50%)`;
}

function makeStyleClass(
    row: number | null = null,
    column: number | null = null
) {
  let classes = [
    "note-grid-cell",
    `note-style-${props.noteStyle}`
  ]
  if (exists(row) && exists(column)) {
    let note = midiNoteAtRowColumn(row, column);
    if (BLACK_KEYS_ONLY_SCALE.contains(note)) {
      classes.push("black-key");
    }
  }
  return classes.join(' ')
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

function makeNoteText(row: number, column: number) {
  let note = midiNoteAtRowColumn(row, column);

  switch (props.noteFormat) {
    case "number":
      return note.toString();
    case "letter":
      return formatMidiLetter(note);
    case "letter-octave":
      return formatMidiNote(note);
  }
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
             :style="{
                opacity: opacityForNote(r, c),
                'background-color': colorForNote(r, c)
              }"
             :class="makeStyleClass(r, c)">
          <span>{{ makeNoteText(r, c) }}</span>
        </div>
        <div v-else
             :style="{opacity: opacityForNote(r, c)}"
             :class="`${makeStyleClass(r, c)} empty`">
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

.note-style-bar {
  width: calc(var(--note-test-grid-cell-size) * .75);
  height: calc(var(--note-test-grid-cell-size) * 5)
}

.note-style-bar.black-key {
  width: calc(var(--note-test-grid-cell-size) * .5);
}
</style>
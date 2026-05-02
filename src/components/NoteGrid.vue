<script setup lang="ts">

import {formatMidiLetter, formatMidiNote} from "../notes";
import {useMidiStore} from "../store/midi";
import {computed} from "vue";
import {NoteScale, SCALES, MINOR_PENTATONIC_SCALE_SET_NAME, BaseNotes, CHROMATIC_SCALE_SET_NAME} from "../notes/scales";
import {exists} from "../utilities";

/** Anything with {@link NoteScale.prototype.contains}; supports union scales from practice settings. */
export type ScaleContainment = Pick<NoteScale, "contains">;

interface NoteGridProps {
    notes: Array<number>,
    hints?: Array<number>,
    /** Secondary highlight: chord voicing / scale degrees (white border), e.g. while practicing. */
    ensembleHints?: Array<number>,
    columns: number,
    noteStyle?: "box" | "circle" | "bar",
    scale?: ScaleContainment,
  headers?: string[],
  noteFormat?: "number" | "letter" | "letter-octave",
}

const props = withDefaults(defineProps<NoteGridProps>(), {
  notes: () => [],
  hints: () => [],
  ensembleHints: () => [],
  noteStyle: "box",
  scale: () => SCALES[CHROMATIC_SCALE_SET_NAME][BaseNotes.C.mapKey],
  headers: () => [],
  noteFormat: "number",
});

const midiStore = useMidiStore();

const rowCount = computed(() => {
  return Math.ceil(props.notes.length / props.columns)
});
const rowIndices = computed(() => {
  return Array.from(Array(rowCount.value).keys())
});
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

  if (exists(props.hints.find((n) => n === note))) {
    return .5;
  }
  return 0.25;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const BLACK_KEYS_ONLY_SCALE = SCALES[MINOR_PENTATONIC_SCALE_SET_NAME][BaseNotes.DSharp.mapKey]

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

/** Inner cell shape (opacity applied here so ensemble ring stays fully opaque on the shell). */
function innerCellClass(row: number, column: number) {
  const classes = [
    "note-grid-cell",
    `note-style-${props.noteStyle}`,
  ];
  const note = midiNoteAtRowColumn(row, column);
  if (BLACK_KEYS_ONLY_SCALE.contains(note)) {
    classes.push("black-key");
  }
  return classes.join(" ");
}

function cellShellClass(row: number, column: number) {
  const note = midiNoteAtRowColumn(row, column);
  if (ensembleHintForNote(note)) {
    return "note-grid-cell-shell ensemble-hint";
  }
  return "note-grid-cell-shell";
}

function ensembleHintForNote(note: number) {
  return exists(props.ensembleHints.find((n) => n === note));
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
    <div
      v-for="r in rowIndices"
      :key="`row-${r}`"
      class="note-grid-row"
    >
      <div
        v-for="c in columnIndices"
        :key="`cell-${r}-${c}`"
      >
        <div
          v-if="hasNote(r, c)"
          :class="cellShellClass(r, c)"
        >
          <div
            :style="{
              opacity: opacityForNote(r, c),
              'background-color': colorForNote(r, c)
            }"
            :class="innerCellClass(r, c)"
          >
            <span>{{ makeNoteText(r, c) }}</span>
          </div>
        </div>
        <div
          v-else
          :class="cellShellClass(r, c)"
        >
          <div
            :style="{opacity: opacityForNote(r, c)}"
            :class="`${innerCellClass(r, c)} empty`"
          />
        </div>
      </div>
    </div>
    <div
      v-if="props.headers.length > 0"
      class="note-grid-row header"
    >
      <div
        v-for="header in props.headers"
        :key="header"
      >
        <div :class="`note-grid-cell note-style-${props.noteStyle} header`">
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
  height: 100%;
}

.note-grid-row {
  display: flex;
  flex-direction: row;
  height: 100%;
}

.note-grid-cell-shell {
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  /* Same 3px ring geometry as ensemble cells; transparent so the scene behind shows through. */
  box-shadow: 0 0 0 3px transparent;
}

.note-grid-cell-shell.ensemble-hint {
  position: relative;
  z-index: 1;
  box-shadow: 0 0 0 3px #fff;
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
  height: 100%;
}

.note-style-bar.black-key {
  width: calc(var(--note-test-grid-cell-size) * .5);
}
</style>

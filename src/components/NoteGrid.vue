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

  const hasEnsemble = props.ensembleHints.length > 0;
  const inEnsemble = exists(props.ensembleHints.find((n) => n === note));
  if (hasEnsemble) {
    return inEnsemble ? 0.12 : 0.06;
  }
  return 0.11;
}

function labelOpacityForNote(row: number, column: number) {
  const note = midiNoteAtRowColumn(row, column);
  if (!exists(note)) {
    return 1;
  }
  if (midiStore.playData[note].on) {
    return 1;
  }
  if (exists(props.hints.find((n) => n === note))) {
    return 1;
  }
  return 0.28;
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

/** Inner cell shape; ensemble ring sits on this wrapper while opacity only affects the fill layer. */
function innerCellClass(row: number, column: number) {
  const classes = [
    "note-grid-cell",
    `note-style-${props.noteStyle}`,
  ];
  const note = midiNoteAtRowColumn(row, column);
  if (BLACK_KEYS_ONLY_SCALE.contains(note)) {
    classes.push("black-key");
  }
  if (ensembleHintForNote(note)) {
    classes.push("ensemble-hint");
  }
  return classes.join(" ");
}

function cellShellClass(row: number, column: number) {
  const classes = ["note-grid-cell-shell"];
  if (props.noteStyle === "circle") {
    classes.push("note-grid-cell-shell--circle");
  }
  return classes.join(" ");
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
  <section
    class="note-grid"
    :class="{'note-grid--bar': noteStyle === 'bar'}"
  >
    <div
      v-for="r in rowIndices"
      :key="`row-${r}`"
      class="note-grid-row"
    >
      <div
        v-for="c in columnIndices"
        :key="`cell-${r}-${c}`"
        class="note-grid-slot"
      >
        <div
          v-if="hasNote(r, c)"
          :class="cellShellClass(r, c)"
        >
          <div :class="innerCellClass(r, c)">
            <div
              class="note-grid-cell-fill"
              :style="{
                opacity: opacityForNote(r, c),
                'background-color': colorForNote(r, c)
              }"
            />
            <span
              class="note-grid-cell-label"
              :style="{ opacity: labelOpacityForNote(r, c) }"
            >{{ makeNoteText(r, c) }}</span>
          </div>
        </div>
        <div
          v-else
          :class="cellShellClass(r, c)"
        >
          <div :class="`${innerCellClass(r, c)} empty`">
            <div
              class="note-grid-cell-fill"
              :style="{ opacity: opacityForNote(r, c) }"
            />
          </div>
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
        class="note-grid-slot"
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
  min-height: 0;
  justify-content: start;
  /* Ring draws outside the shell; gap equals 2× ring so neighbors’ shadows don’t overlap. */
  --note-grid-cell-ring: 3px;
  --note-grid-ensemble-ring: var(--p-slate-400, #94a3b8);
  --note-grid-bar-gap: 0;
  gap: calc(var(--note-grid-cell-ring) * 2);
}

.note-grid.note-grid--bar {
  gap: var(--note-grid-bar-gap);
  /** Letter breathing room; fill stays edge-to-edge inside the cell border. */
  --note-grid-bar-label-pad-x: 0.55rem;
}

.note-grid-row {
  display: flex;
  flex-direction: row;
  gap: calc(var(--note-grid-cell-ring) * 2);
}

.note-grid.note-grid--bar .note-grid-row {
  gap: var(--note-grid-bar-gap);
}

/** One row of octave bars: row grows with parent height so bar fills stretch vertically. */
.note-grid.note-grid--bar .note-grid-row:not(.header) {
  flex: 1 1 0;
  min-height: 0;
}

/**
 * Slot sits between row and shell; without a flex chain here the shell stays content-height
 * even when the row has extra vertical space.
 */
.note-grid.note-grid--bar .note-grid-row:not(.header) .note-grid-slot {
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.note-grid.note-grid--bar .note-grid-row:not(.header) .note-grid-cell-shell {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  align-items: stretch;
}

.note-grid-cell-shell {
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  box-shadow: 0 0 0 var(--note-grid-cell-ring) transparent;
}

.note-grid-cell-shell--circle {
  border-radius: 50%;
}

.note-grid-cell {
  position: relative;
  display: flex;
  width: var(--note-test-grid-cell-size);
  height: var(--note-test-grid-cell-size);
  justify-content: center;
  align-items: center;
}

.note-grid-cell.ensemble-hint {
  box-shadow: 0 0 0 var(--note-grid-cell-ring) var(--note-grid-ensemble-ring);
}

/** Octave bars: inside border (outer ring distorted spacing/clipped top & bottom in tall cells). */
.note-grid.note-grid--bar .note-grid-cell.note-style-bar.ensemble-hint {
  box-shadow: none;
  border: var(--note-grid-cell-ring) solid var(--note-grid-ensemble-ring);
  box-sizing: border-box;
}

.note-grid-cell-fill {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  transition: opacity 0.2s;
}

.note-grid-cell-label {
  position: relative;
  z-index: 1;
  transition: opacity 0.2s;
}

.note-grid-cell.header {
  background-color: var(--p-neutral-700);
}

.note-grid-cell.empty .note-grid-cell-fill {
  background-color: var(--p-neutral-800);
}

.note-style-box {

}

.note-style-circle {
  margin: 0.1rem;
  /*border-radius: 50%;*/
  padding: .25rem 1rem;
  height: auto;
}

.note-style-bar {
  width: calc(var(--note-test-grid-cell-size) * .75);
  min-height: var(--note-test-grid-cell-size);
}

.note-grid.note-grid--bar .note-grid-row:not(.header) .note-grid-cell.note-style-bar {
  width: 100%;
  max-width: none;
  height: 100%;
  min-height: var(--note-test-grid-cell-size);
  align-self: stretch;
  box-sizing: border-box;
}

/** Horizontal padding on the label only so hue fill reaches left/right inner edges. */
.note-grid.note-grid--bar .note-grid-row:not(.header) .note-grid-cell.note-style-bar .note-grid-cell-label {
  padding: 0 var(--note-grid-bar-label-pad-x);
  box-sizing: border-box;
  text-align: center;
}
</style>

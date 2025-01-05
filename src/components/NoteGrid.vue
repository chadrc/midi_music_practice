<script setup lang="ts">

import {formatMidiNote} from "../notes";
import {useMidiStore} from "../store/midi";
import {useSettingsStore} from "../store/settings";

interface NoteGridProps {
  notes: Array<number>,
  columns: number,
  formatted?: boolean,
}

const props = withDefaults(defineProps<NoteGridProps>(), {
  notes: () => [],
  formatted: true,
});

const midiStore = useMidiStore();

const hueIncrement = 360 / 128;

function opacityForNote(note: number) {
  let playData = midiStore.playData[note];
  if (playData.on) {
    return 1;
  }
  return 0.25;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function colorForNote(note: number) {
  let playData = midiStore.playData[note];
  let hue = note * hueIncrement;
  let saturation = lerp(25, 100, playData.velocity / 127);

  return `hsl(${hue}, ${saturation}%, 50%)`;
}
</script>

<template>
  <section class="note-grid"
           :style="{width: `calc(var(--note-test-grid-cell-size) * ${props.columns})`}">
    <div
        v-for="i in props.notes"
        :key="i"
        :style="{opacity: opacityForNote(i), 'background-color': colorForNote(i)}"
        class="note-grid-cell"
    >
      <span>{{ props.formatted ? formatMidiNote(i) : i }}</span>
    </div>
  </section>
</template>

<style scoped>
.note-grid {
  display: flex;
  flex-wrap: wrap-reverse;
  width: calc(var(--note-test-grid-cell-size) * 12);
}

.note-grid-cell {
  display: flex;
  width: var(--note-test-grid-cell-size);
  height: var(--note-test-grid-cell-size);
  justify-content: center;
  align-items: center;
  transition: opacity 0.2s;
}
</style>
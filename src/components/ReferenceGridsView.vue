<script setup lang="ts">
import {Select, SelectButton} from "primevue";
import {storeToRefs} from "pinia";
import {computed} from "vue";
import NoteGrid from "./NoteGrid.vue";
import {useSettingsStore} from "../store/settings";
import {noteGridLayoutFromNoteRange} from "../routine/noteGridLayout";
import {hintMidisForReferenceSlot} from "../routine/referenceGrid";
import {
    BaseNotes,
    CHROMATIC_SCALE_SET_NAME,
    SCALES,
} from "../notes/scales";
import {CHORD_TYPE_LABEL, SCALE_TYPE_LABEL} from "../notes/notes";
import {
    CHORD_TYPE_OPTIONS,
    SCALE_TYPE_OPTIONS,
    type ChordTypeId,
} from "../routine/types";
const {referenceView} = storeToRefs(useSettingsStore());

const layout = computed(() => noteGridLayoutFromNoteRange(referenceView.value.noteRange));

const chromaticMembership = SCALES[CHROMATIC_SCALE_SET_NAME][BaseNotes.C.mapKey];

const kindOptions = [
    {label: "Scale", value: "scale" as const},
    {label: "Chord", value: "chord" as const},
];

const baseNoteOptions = Object.values(BaseNotes).map((b) => ({
    label: b.getName(),
    value: b.mapKey,
}));

const scaleTypeOptions = SCALE_TYPE_OPTIONS.map((v) => ({
    label: SCALE_TYPE_LABEL[v],
    value: v,
}));

const chordTypeOptions = CHORD_TYPE_OPTIONS.map((v) => ({
    label: CHORD_TYPE_LABEL[v as ChordTypeId],
    value: v,
}));

const tiles = computed(() => {
    const rows = referenceView.value.patternRows;
    const cols = referenceView.value.patternCols;
    const out: {index: number}[] = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            out.push({index: r * cols + c});
        }
    }
    return out;
});

function hintsAt(index: number): number[] {
    return hintMidisForReferenceSlot(
        layout.value.notes,
        referenceView.value.gridSelections[index]!,
    );
}

</script>

<template>
  <div class="reference-grids-root">
    <div
      class="reference-pattern"
      :style="{'--ref-cols': referenceView.patternCols}"
    >
      <div
        v-for="t in tiles"
        :key="t.index"
        class="reference-tile"
      >
        <div class="tile-controls">
          <SelectButton
            v-model="referenceView.gridSelections[t.index]!.kind"
            :options="kindOptions"
            option-label="label"
            option-value="value"
            size="small"
          />
          <Select
            v-if="referenceView.gridSelections[t.index]!.kind === 'scale'"
            v-model="referenceView.gridSelections[t.index]!.scaleType"
            :options="scaleTypeOptions"
            option-label="label"
            option-value="value"
            placeholder="Scale"
            class="type-select"
            size="small"
          />
          <Select
            v-else
            v-model="referenceView.gridSelections[t.index]!.chordType"
            :options="chordTypeOptions"
            option-label="label"
            option-value="value"
            placeholder="Chord"
            class="type-select"
            size="small"
          />
          <Select
            v-model="referenceView.gridSelections[t.index]!.baseNoteMapKey"
            :options="baseNoteOptions"
            option-label="label"
            option-value="value"
            placeholder="Root"
            class="root-select"
            size="small"
          />
        </div>
        <div class="tile-grid-wrap">
          <NoteGrid
            :notes="layout.notes"
            :scale="chromaticMembership"
            :note-style="layout.noteStyle"
            :headers="layout.headers"
            :columns="layout.columns"
            :note-format="layout.noteFormat"
            :hints="hintsAt(t.index)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reference-grids-root {
    height: 100%;
    min-height: 0;
    overflow: auto;
}

.reference-pattern {
    display: grid;
    grid-template-columns: repeat(var(--ref-cols, 2), minmax(0, 1fr));
    gap: 0.75rem;
    align-items: start;
    padding-bottom: 1rem;
}

.reference-tile {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
    border: 1px solid var(--p-content-border-color, rgba(255, 255, 255, 0.12));
    border-radius: var(--p-content-border-radius, 6px);
    padding: 0.5rem;
    background: var(--p-content-background, transparent);
}

.tile-controls {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.5rem 0.65rem;
    width: 100%;
}

.type-select {
    width: 10rem;
    max-width: 100%;
    flex: 0 0 auto;
}

.root-select {
    width: 6.5rem;
    max-width: 100%;
    flex: 0 0 auto;
}

.tile-grid-wrap {
    flex: 1;
    min-height: 12rem;
    max-height: min(50vh, 28rem);
    overflow: auto;
    display: flex;
    justify-content: center;
}
</style>

<script setup lang="ts">
import {Button, Select, SelectButton} from "primevue";
import {storeToRefs} from "pinia";
import {computed, ref} from "vue";
import NoteGrid from "./NoteGrid.vue";
import ReferenceTheoryDialog from "./ReferenceTheoryDialog.vue";
import {useSettingsStore} from "../store/settings";
import {noteGridLayoutFromNoteRange} from "../routine/noteGridLayout";
import {hintMidisForReferenceSlot, type ReferenceGridSlot} from "../routine/referenceGrid";
import {
    BaseNotes,
    CHROMATIC_SCALE_SET_NAME,
    SCALES,
} from "../notes/scales";
import {CHORD_TYPE_LABEL, SCALE_TYPE_LABEL} from "../notes/notes";
import {
    CHORD_TYPE_OPTIONS,
    SCALE_TYPE_OPTIONS,
    NoteRangeType,
    type ChordTypeId,
} from "../routine/types";
const {referenceView} = storeToRefs(useSettingsStore());

const theoryDialogVisible = ref(false);
const theorySourceSlot = ref<ReferenceGridSlot | null>(null);

function theoryTooltip(kind: ReferenceGridSlot["kind"]): string {
    return kind === "chord" ? "Scales with Chord" : "Chords in Scale";
}

function openTheoryDialog(slot: ReferenceGridSlot) {
    theorySourceSlot.value = {
        kind: slot.kind,
        scaleType: slot.scaleType,
        chordType: slot.chordType,
        baseNoteMapKey: slot.baseNoteMapKey,
    };
    theoryDialogVisible.value = true;
}

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

const isSingleReferenceTile = computed(() => tiles.value.length === 1);

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
      :class="{'reference-pattern--fit-content': isSingleReferenceTile}"
      :style="{'--ref-cols': referenceView.patternCols}"
    >
      <div
        v-for="t in tiles"
        :key="t.index"
        class="reference-tile"
      >
        <div
          v-if="referenceView.showTileControls"
          class="tile-controls"
        >
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
          <Button
            v-tooltip.top="theoryTooltip(referenceView.gridSelections[t.index]!.kind)"
            type="button"
            rounded
            text
            size="small"
            severity="secondary"
            class="tile-theory-btn"
            :aria-label="theoryTooltip(referenceView.gridSelections[t.index]!.kind)"
            @click="openTheoryDialog(referenceView.gridSelections[t.index]!)"
          >
            <span
              class="tile-theory-note-glyph"
              aria-hidden="true"
            >♪</span>
          </Button>
        </div>
        <div
          class="tile-grid-wrap"
          :class="{
            'tile-grid-wrap--single': isSingleReferenceTile,
            'tile-grid-wrap--octaves': referenceView.noteRange.type === NoteRangeType.Octaves,
            'tile-grid-wrap--frets': referenceView.noteRange.type === NoteRangeType.Frets,
          }"
        >
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
    <ReferenceTheoryDialog
      v-model:visible="theoryDialogVisible"
      :source-slot="theorySourceSlot"
      :layout="layout"
    />
  </div>
</template>

<style scoped>
.reference-grids-root {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: auto;
}

.reference-pattern {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(var(--ref-cols, 2), minmax(0, 1fr));
    grid-auto-rows: 1fr;
    align-items: stretch;
    gap: 0.75rem;
    padding-bottom: 1rem;
}

/** One tile: don’t stretch the pattern row to the viewport—size to content. */
.reference-pattern.reference-pattern--fit-content {
    flex: 0 0 auto;
    min-height: 0;
    grid-auto-rows: auto;
    align-items: start;
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

.tile-theory-btn {
    flex-shrink: 0;
    padding: 0;
    min-width: 2.25rem;
}

.tile-theory-note-glyph {
    font-size: 1.1rem;
    line-height: 1;
    opacity: 0.88;
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
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
}

.tile-grid-wrap--single {
    flex: 0 0 auto;
    min-height: 0;
    max-height: none;
}

.tile-grid-wrap--octaves {
    flex: 0 0 auto;
    height: 200px;
    min-height: 200px;
    max-height: 200px;
}

.tile-grid-wrap--frets {
    align-items: center;
    justify-content: center;
}

.tile-grid-wrap :deep(.note-grid.note-grid--bar) {
    flex: 1 1 auto;
    min-height: 0;
}
</style>

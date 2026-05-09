<script setup lang="ts">
import {Button, InputNumber, Select, SelectButton, Slider} from "primevue";
import {storeToRefs} from "pinia";
import {computed, ref} from "vue";
import NoteGrid from "./NoteGrid.vue";
import ReferenceTheoryDialog from "./ReferenceTheoryDialog.vue";
import {useSettingsStore} from "../store/settings";
import {maxForNoteRangeType} from "../routine";
import {noteGridLayoutFromNoteRange} from "../routine/noteGridLayout";
import {
    hintMidisForReferenceSlot,
    referenceSlotDisplayTitle,
    type ReferenceGridSlot,
} from "../routine/referenceGrid";
import {totalReferenceTileCount} from "../routine/referenceViewSettings";
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

const settingsStore = useSettingsStore();
const {referenceView} = storeToRefs(settingsStore);

const theoryDialogVisible = ref(false);
const theorySourceSlot = ref<ReferenceGridSlot | null>(null);
const theorySourceFlatIndex = ref(0);

function theoryTooltip(kind: ReferenceGridSlot["kind"]): string {
    return kind === "chord" ? "Scales with Chord" : "Chords in Scale";
}

function openTheoryDialog(slot: ReferenceGridSlot, flatIndex: number) {
    theorySourceFlatIndex.value = flatIndex;
    theorySourceSlot.value = {
        kind: slot.kind,
        scaleType: slot.scaleType,
        chordType: slot.chordType,
        baseNoteMapKey: slot.baseNoteMapKey,
    };
    theoryDialogVisible.value = true;
}

const layoutsPerTile = computed(() =>
    referenceView.value.noteRanges.map((nr) => noteGridLayoutFromNoteRange(nr)),
);

const theoryLayout = computed(() => {
    const layouts = layoutsPerTile.value;
    const i = Math.min(Math.max(0, theorySourceFlatIndex.value), layouts.length - 1);
    return layouts[i]!;
});

function makeNoteRangeOptions() {
    return [
        {name: "Notes", value: NoteRangeType.Notes},
        {name: "Frets", value: NoteRangeType.Frets},
        {name: "Octaves", value: NoteRangeType.Octaves},
    ];
}

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

const patternRowIndices = computed(() =>
    Array.from({length: referenceView.value.patternRows}, (_, i) => i),
);

function columnIndicesForRow(row: number): number[] {
    const n = referenceView.value.patternColsPerRow[row] ?? 1;
    return Array.from({length: n}, (_, i) => i);
}

function tileFlatIndex(row: number, colIdx: number): number {
    const p = referenceView.value.patternColsPerRow;
    let s = 0;
    for (let i = 0; i < row; i++) {
        s += p[i]!;
    }
    return s + colIdx;
}

const isSingleReferenceTile = computed(
    () => totalReferenceTileCount(referenceView.value.patternColsPerRow) === 1,
);

function hintsAt(flatIndex: number): number[] {
    return hintMidisForReferenceSlot(
        layoutsPerTile.value[flatIndex]!.notes,
        referenceView.value.gridSelections[flatIndex]!,
    );
}

function onRowColsInput(row: number, v: number | null) {
    settingsStore.referenceSetPatternColsForRow(row, v);
}

function onTileNoteRangeType(flatIndex: number, t: NoteRangeType) {
    settingsStore.referenceSetNoteRangeTypeForTile(flatIndex, t);
}

function onTileRangeSlider(flatIndex: number, range: number | number[]) {
    if (Array.isArray(range) && range.length >= 2) {
        settingsStore.referenceSetNoteRangeSliderForTile(flatIndex, [range[0]!, range[1]!]);
    }
}

function onTileShiftNoteRange(flatIndex: number, delta: number) {
    settingsStore.referenceShiftNoteRangeBy(flatIndex, delta);
}
</script>

<template>
  <div class="reference-grids-root">
    <div
      class="reference-pattern"
      :class="{'reference-pattern--fit-content': isSingleReferenceTile}"
    >
      <div
        v-for="rowIdx in patternRowIndices"
        :key="`ref-row-${rowIdx}`"
        class="reference-pattern-row"
      >
        <div
          v-if="referenceView.showTileControls"
          class="reference-row-toolbar"
        >
          <div class="reference-row-toolbar-group">
            <span class="reference-row-toolbar-label">Row {{ rowIdx + 1 }} · columns</span>
            <InputNumber
              :model-value="referenceView.patternColsPerRow[rowIdx]"
              :min="1"
              :max="6"
              show-buttons
              button-layout="horizontal"
              size="small"
              class="reference-row-cols-input"
              :aria-label="`Columns for row ${rowIdx + 1}`"
              @update:model-value="(v: number | null) => onRowColsInput(rowIdx, v)"
            />
          </div>
        </div>
        <div
          class="reference-row-tiles"
          :style="{'--ref-row-cols': referenceView.patternColsPerRow[rowIdx]}"
        >
          <div
            v-for="colIdx in columnIndicesForRow(rowIdx)"
            :key="`tile-${rowIdx}-${colIdx}`"
            class="reference-tile"
          >
            <div
              v-if="!referenceView.showTileControls"
              class="reference-tile-title-row"
            >
              <div class="reference-tile-title">
                {{ referenceSlotDisplayTitle(referenceView.gridSelections[tileFlatIndex(rowIdx, colIdx)]!) }}
              </div>
              <Button
                v-tooltip.top="theoryTooltip(referenceView.gridSelections[tileFlatIndex(rowIdx, colIdx)]!.kind)"
                type="button"
                rounded
                text
                size="small"
                severity="secondary"
                class="tile-theory-btn"
                :aria-label="theoryTooltip(referenceView.gridSelections[tileFlatIndex(rowIdx, colIdx)]!.kind)"
                @click="
                  openTheoryDialog(
                    referenceView.gridSelections[tileFlatIndex(rowIdx, colIdx)]!,
                    tileFlatIndex(rowIdx, colIdx),
                  )
                "
              >
                <span
                  class="tile-theory-note-glyph"
                  aria-hidden="true"
                >♪</span>
              </Button>
            </div>
            <div
              v-if="referenceView.showTileControls"
              class="tile-controls"
            >
              <SelectButton
                v-model="referenceView.gridSelections[tileFlatIndex(rowIdx, colIdx)]!.kind"
                :options="kindOptions"
                option-label="label"
                option-value="value"
                size="small"
              />
              <Select
                v-if="referenceView.gridSelections[tileFlatIndex(rowIdx, colIdx)]!.kind === 'scale'"
                v-model="referenceView.gridSelections[tileFlatIndex(rowIdx, colIdx)]!.scaleType"
                :options="scaleTypeOptions"
                option-label="label"
                option-value="value"
                placeholder="Scale"
                class="type-select"
                size="small"
              />
              <Select
                v-else
                v-model="referenceView.gridSelections[tileFlatIndex(rowIdx, colIdx)]!.chordType"
                :options="chordTypeOptions"
                option-label="label"
                option-value="value"
                placeholder="Chord"
                class="type-select"
                size="small"
              />
              <Select
                v-model="referenceView.gridSelections[tileFlatIndex(rowIdx, colIdx)]!.baseNoteMapKey"
                :options="baseNoteOptions"
                option-label="label"
                option-value="value"
                placeholder="Root"
                class="root-select"
                size="small"
              />
            </div>
            <div
              v-if="referenceView.showTileControls"
              class="tile-note-range"
            >
              <label
                class="tile-range-sublabel"
                :for="`tile-range-type-${tileFlatIndex(rowIdx, colIdx)}`"
              >Range type</label>
              <Select
                :id="`tile-range-type-${tileFlatIndex(rowIdx, colIdx)}`"
                :model-value="referenceView.noteRanges[tileFlatIndex(rowIdx, colIdx)]!.type"
                :options="makeNoteRangeOptions()"
                option-value="value"
                option-label="name"
                class="tile-range-type-select"
                size="small"
                :aria-label="`Note range type for tile ${tileFlatIndex(rowIdx, colIdx) + 1}`"
                @update:model-value="(t: NoteRangeType) =>
                  onTileNoteRangeType(tileFlatIndex(rowIdx, colIdx), t)"
              />
              <span class="tile-range-sublabel tile-range-bounds-label">Bounds</span>
              <div class="tile-range-slider-wrap">
                <Button
                  v-tooltip.top="'Decrease start and end by 1'"
                  type="button"
                  icon="pi pi-minus"
                  rounded
                  text
                  size="small"
                  severity="secondary"
                  class="tile-range-shift-btn"
                  aria-label="Shift note range down by 1"
                  @click="onTileShiftNoteRange(tileFlatIndex(rowIdx, colIdx), -1)"
                />
                <span class="range-bound">{{ referenceView.noteRanges[tileFlatIndex(rowIdx, colIdx)]!.range.start }}</span>
                <Slider
                  :model-value="[
                    referenceView.noteRanges[tileFlatIndex(rowIdx, colIdx)]!.range.start,
                    referenceView.noteRanges[tileFlatIndex(rowIdx, colIdx)]!.range.end,
                  ]"
                  :max="maxForNoteRangeType(referenceView.noteRanges[tileFlatIndex(rowIdx, colIdx)]!.type)"
                  range
                  class="tile-range-slider"
                  :aria-label="`Note range bounds for tile ${tileFlatIndex(rowIdx, colIdx) + 1}`"
                  @value-change="(r: number | number[]) =>
                    onTileRangeSlider(tileFlatIndex(rowIdx, colIdx), r)"
                />
                <span class="range-bound">{{ referenceView.noteRanges[tileFlatIndex(rowIdx, colIdx)]!.range.end }}</span>
                <Button
                  v-tooltip.top="'Increase start and end by 1'"
                  type="button"
                  icon="pi pi-plus"
                  rounded
                  text
                  size="small"
                  severity="secondary"
                  class="tile-range-shift-btn"
                  aria-label="Shift note range up by 1"
                  @click="onTileShiftNoteRange(tileFlatIndex(rowIdx, colIdx), 1)"
                />
              </div>
            </div>
            <div
              class="tile-grid-wrap"
              :class="{
                'tile-grid-wrap--single': isSingleReferenceTile,
                'tile-grid-wrap--octaves':
                  referenceView.noteRanges[tileFlatIndex(rowIdx, colIdx)]!.type === NoteRangeType.Octaves,
                'tile-grid-wrap--frets':
                  referenceView.noteRanges[tileFlatIndex(rowIdx, colIdx)]!.type === NoteRangeType.Frets,
              }"
            >
              <NoteGrid
                :notes="layoutsPerTile[tileFlatIndex(rowIdx, colIdx)]!.notes"
                :scale="chromaticMembership"
                :note-style="layoutsPerTile[tileFlatIndex(rowIdx, colIdx)]!.noteStyle"
                :headers="layoutsPerTile[tileFlatIndex(rowIdx, colIdx)]!.headers"
                :columns="layoutsPerTile[tileFlatIndex(rowIdx, colIdx)]!.columns"
                :note-format="layoutsPerTile[tileFlatIndex(rowIdx, colIdx)]!.noteFormat"
                :hints="hintsAt(tileFlatIndex(rowIdx, colIdx))"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <ReferenceTheoryDialog
      v-model:visible="theoryDialogVisible"
      :source-slot="theorySourceSlot"
      :layout="theoryLayout"
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
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-bottom: 1rem;
}

/** Single total tile: pattern doesn’t consume extra viewport height. */
.reference-pattern.reference-pattern--fit-content {
    flex: 0 0 auto;
    min-height: 0;
}

.reference-pattern-row {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    flex: 0 0 auto;
    min-height: 0;
}

.reference-row-toolbar {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 0.65rem 1rem;
}

.reference-row-toolbar-group {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem 0.5rem;
}

.range-bound {
    font-variant-numeric: tabular-nums;
    min-width: 1.35rem;
    text-align: center;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--p-text-color, inherit);
    opacity: 0.95;
}

.reference-row-toolbar-label {
    font-size: 0.8rem;
    font-weight: 600;
    opacity: 0.9;
}

.reference-row-cols-input {
    width: auto;
}

.reference-row-tiles {
    display: grid;
    grid-template-columns: repeat(var(--ref-row-cols, 2), minmax(0, 1fr));
    grid-auto-rows: auto;
    align-items: start;
    gap: 0.75rem;
    flex: 0 0 auto;
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

.reference-tile-title-row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.45rem 0.65rem;
    width: 100%;
}

.reference-tile-title {
    margin: 0;
    padding: 0 0.15rem;
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.35;
    text-align: center;
    color: var(--p-text-color, inherit);
    opacity: 0.95;
    flex: 0 1 auto;
    min-width: 0;
    max-width: 100%;
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

.tile-note-range {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.35rem;
    width: 100%;
    padding-top: 0.25rem;
    border-top: 1px solid var(--p-content-border-color, rgba(255, 255, 255, 0.1));
}

.tile-range-sublabel {
    font-size: 0.72rem;
    opacity: 0.78;
    width: 100%;
}

.tile-range-bounds-label {
    margin-top: 0.15rem;
}

.tile-range-type-select {
    width: 100%;
    min-width: 0;
}

.tile-range-slider-wrap {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.45rem 0.5rem;
    width: 100%;
    min-width: 0;
}

.tile-range-slider {
    flex: 1 1 8rem;
    min-width: 4rem;
}

.tile-range-shift-btn {
    flex-shrink: 0;
    padding: 0;
    min-width: 2.25rem;
}

.tile-grid-wrap {
    flex: 0 1 auto;
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

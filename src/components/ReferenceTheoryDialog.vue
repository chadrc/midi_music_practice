<script setup lang="ts">
import {Dialog} from "primevue";
import {computed, defineModel, ref, watch} from "vue";
import NoteGrid from "./NoteGrid.vue";
import type {ReferenceGridSlot, ReferenceTheoryListItem} from "../routine/referenceGrid";
import {hintMidisForReferenceSlot, referenceTheoryListItemsForSlot} from "../routine/referenceGrid";
import type {NoteGridLayoutFromNoteRange} from "../routine/noteGridLayout";
import {CHORD_TYPE_LABEL, SCALE_TYPE_LABEL} from "../notes/notes";
import {BaseNotes, CHROMATIC_SCALE_SET_NAME, SCALES, displayNameFromMapKey} from "../notes/scales";

const visible = defineModel<boolean>("visible", {required: true});

const props = defineProps<{
    sourceSlot: ReferenceGridSlot | null;
    layout: NoteGridLayoutFromNoteRange;
}>();

const chromaticMembership = SCALES[CHROMATIC_SCALE_SET_NAME][BaseNotes.C.mapKey];

/** Nearly full-viewport modal; root/content flex so inner layout can fill height. */
const theoryDialogRootStyle = {
    width: "min(96vw, 100%)",
    height: "min(92vh, 100%)",
    maxHeight: "92vh",
    display: "flex",
    flexDirection: "column" as const,
};

const theoryDialogContentStyle = {
    flex: "1 1 auto",
    minHeight: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column" as const,
};

const listItems = computed((): ReferenceTheoryListItem[] => {
    if (props.sourceSlot == null) {
        return [];
    }
    return referenceTheoryListItemsForSlot(props.sourceSlot);
});

const selectedIndex = ref(0);

watch(visible, (open) => {
    if (open) {
        selectedIndex.value = 0;
    }
});

watch(listItems, (items) => {
    if (selectedIndex.value >= items.length) {
        selectedIndex.value = Math.max(0, items.length - 1);
    }
});

const selectedItem = computed((): ReferenceTheoryListItem | null => {
    const items = listItems.value;
    if (items.length === 0) {
        return null;
    }
    const i = Math.min(Math.max(0, selectedIndex.value), items.length - 1);
    return items[i] ?? null;
});

const isChordsInScaleDialog = computed(
    () => props.sourceSlot != null && props.sourceSlot.kind === "scale",
);

const isScalesWithChordDialog = computed(
    () => props.sourceSlot != null && props.sourceSlot.kind === "chord",
);

const showTheoryDualGrids = computed(
    () =>
        selectedItem.value != null &&
        (isChordsInScaleDialog.value || isScalesWithChordDialog.value),
);

/** Top panel: full tile scale (Chords in Scale) or full tile chord (Scales with Chord). */
const theoryDualFirstHints = computed((): number[] => {
    const s = props.sourceSlot;
    if (s == null) {
        return [];
    }
    return hintMidisForReferenceSlot(props.layout.notes, s);
});

const theoryDualFirstCaption = computed((): string => {
    const s = props.sourceSlot;
    if (s == null) {
        return "";
    }
    const root =
        Object.values(BaseNotes).find((b) => b.mapKey === s.baseNoteMapKey)?.getName() ??
        displayNameFromMapKey(s.baseNoteMapKey);
    if (s.kind === "scale") {
        return `${root} — ${SCALE_TYPE_LABEL[s.scaleType]}`;
    }
    return `${root} — ${CHORD_TYPE_LABEL[s.chordType]}`;
});

const theoryDualSecondHints = computed((): number[] => {
    const item = selectedItem.value;
    if (item == null) {
        return [];
    }
    return hintMidisForReferenceSlot(props.layout.notes, item.highlightSlot);
});

const theoryDualSecondCaption = computed((): string => selectedItem.value?.label ?? "");

const dialogHeader = computed(() => {
    if (props.sourceSlot == null) {
        return "";
    }
    return props.sourceSlot.kind === "chord"
        ? "Scales with Chord"
        : "Chords in Scale";
});

function itemKey(item: ReferenceTheoryListItem, index: number): string {
    const g = item.highlightSlot;
    return `${index}-${g.kind}-${g.baseNoteMapKey}-${g.scaleType}-${g.chordType}`;
}

function selectItem(index: number) {
    selectedIndex.value = index;
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="dialogHeader"
    dismissable-mask
    class="reference-theory-dialog"
    :style="theoryDialogRootStyle"
    :content-style="theoryDialogContentStyle"
  >
    <div
      v-if="sourceSlot"
      class="theory-dialog-body"
    >
      <p
        v-if="listItems.length === 0"
        class="theory-empty"
      >
        No matching scales or chords for this selection.
      </p>
      <div
        v-else
        class="theory-dialog-layout"
      >
        <aside class="theory-list-panel">
          <ul
            class="theory-list"
            role="listbox"
            :aria-label="dialogHeader"
          >
            <li
              v-for="(item, i) in listItems"
              :id="`theory-item-${i}`"
              :key="itemKey(item, i)"
              role="option"
              :aria-selected="i === selectedIndex"
              class="theory-list-item"
              :class="{'theory-list-item--active': i === selectedIndex}"
              tabindex="0"
              @click="selectItem(i)"
              @keydown.enter.prevent="selectItem(i)"
              @keydown.space.prevent="selectItem(i)"
            >
              {{ item.label }}
            </li>
          </ul>
        </aside>
        <div
          class="theory-grid-panel"
          :class="{
            'theory-grid-panel--bar': layout.noteStyle === 'bar',
            'theory-grid-panel--circle': layout.noteStyle === 'circle',
            'theory-grid-panel--dual': showTheoryDualGrids,
          }"
        >
          <div
            v-if="showTheoryDualGrids"
            class="theory-dual-grid"
          >
            <div class="theory-grid-block">
              <p class="theory-grid-caption">
                {{ theoryDualFirstCaption }}
              </p>
              <div class="theory-grid-wrap">
                <NoteGrid
                  :notes="layout.notes"
                  :scale="chromaticMembership"
                  :note-style="layout.noteStyle"
                  :headers="layout.headers"
                  :columns="layout.columns"
                  :note-format="layout.noteFormat"
                  :hints="theoryDualFirstHints"
                />
              </div>
            </div>
            <div class="theory-grid-block">
              <p class="theory-grid-caption">
                {{ theoryDualSecondCaption }}
              </p>
              <div class="theory-grid-wrap">
                <NoteGrid
                  :notes="layout.notes"
                  :scale="chromaticMembership"
                  :note-style="layout.noteStyle"
                  :headers="layout.headers"
                  :columns="layout.columns"
                  :note-format="layout.noteFormat"
                  :hints="theoryDualSecondHints"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.theory-dialog-body {
    margin: -0.25rem 0 0;
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.theory-empty {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.8;
}

.theory-dialog-layout {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    gap: 1rem;
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
}

.theory-list-panel {
    flex: 0 0 min(13rem, 32vw);
    max-width: min(16rem, 38vw);
    min-width: 10rem;
    border: 1px solid var(--p-content-border-color, rgba(255, 255, 255, 0.12));
    border-radius: var(--p-content-border-radius, 8px);
    background: var(--p-content-hover-background, rgba(255, 255, 255, 0.02));
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.theory-list {
    list-style: none;
    margin: 0;
    padding: 0.35rem 0;
    overflow: auto;
    flex: 1;
    min-height: 0;
}

.theory-list-item {
    padding: 0.4rem 0.65rem;
    font-size: 0.82rem;
    line-height: 1.35;
    cursor: pointer;
    border-left: 3px solid transparent;
}

.theory-list-item:hover {
    background: var(--p-content-hover-background, rgba(255, 255, 255, 0.06));
}

.theory-list-item--active {
    background: var(--p-highlight-background, rgba(59, 130, 246, 0.18));
    border-left-color: var(--p-primary-color, #3b82f6);
}

.theory-grid-panel {
    flex: 1 1 auto;
    min-width: 0;
    min-height: 0;
    overflow: auto;
    display: flex;
    justify-content: center;
    align-items: flex-start;
}

.theory-grid-panel--bar {
    align-items: stretch;
}

.theory-grid-panel--circle {
    align-items: center;
    justify-content: center;
}

.theory-grid-panel--circle .theory-grid-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
}

.theory-grid-panel--circle .theory-grid-caption {
    width: 100%;
    text-align: center;
}

.theory-grid-panel--circle .theory-grid-block {
    align-items: center;
}

.theory-grid-panel--dual {
    flex-direction: column;
    align-items: stretch;
}

.theory-grid-panel--dual.theory-grid-panel--circle {
    align-items: center;
}

.theory-dual-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
}

.theory-grid-block {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    flex: 1 1 0;
    min-height: 0;
    min-width: 0;
}

.theory-grid-panel--dual:not(.theory-grid-panel--bar) .theory-grid-block {
    flex: 0 0 auto;
}

.theory-grid-caption {
    font-size: 0.8rem;
    font-weight: 600;
    opacity: 0.9;
    flex-shrink: 0;
}

.theory-grid-panel--bar .theory-grid-wrap {
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
}

.theory-grid-panel--bar.theory-grid-panel--dual .theory-grid-block .theory-grid-wrap {
    flex: 1 1 auto;
    min-height: 8rem;
}

.theory-grid-panel--bar .theory-grid-wrap :deep(.note-grid.note-grid--bar) {
    flex: 1 1 auto;
    min-height: 0;
}

@media (max-width: 40rem) {
    .theory-dialog-layout {
        flex-direction: column;
    }

    .theory-list-panel {
        flex: 0 0 auto;
        max-width: none;
        min-width: 0;
        max-height: min(28vh, 14rem);
    }
}
</style>

<script setup lang="ts">
import {Dialog} from "primevue";
import {computed, defineModel, ref, watch} from "vue";
import NoteGrid from "./NoteGrid.vue";
import type {ReferenceGridSlot, ReferenceTheoryListItem} from "../routine/referenceGrid";
import {hintMidisForReferenceSlot, referenceTheoryListItemsForSlot} from "../routine/referenceGrid";
import type {NoteGridLayoutFromNoteRange} from "../routine/noteGridLayout";
import {BaseNotes, CHROMATIC_SCALE_SET_NAME, SCALES} from "../notes/scales";

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

function hintsFor(gridSlot: ReferenceGridSlot): number[] {
    return hintMidisForReferenceSlot(props.layout.notes, gridSlot);
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
        <div class="theory-grid-panel">
          <div
            v-if="selectedItem"
            class="theory-grid-wrap"
          >
            <NoteGrid
              :notes="layout.notes"
              :scale="chromaticMembership"
              :note-style="layout.noteStyle"
              :headers="layout.headers"
              :columns="layout.columns"
              :note-format="layout.noteFormat"
              :hints="hintsFor(selectedItem.highlightSlot)"
            />
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

.theory-grid-wrap {
    display: flex;
    justify-content: center;
    padding: 0.25rem 0;
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

<script setup lang="ts">
import {Button, InputNumber, InputText, ToggleSwitch} from "primevue";
import {computed, onUnmounted, ref, watch} from "vue";
import {useRoutineStore} from "../store/routineEdit";
import ParentTypeSelect from "../routine/components/ParentTypeSelect.vue";
import SettingsEditField from "../routine/components/SettingsEditField.vue";
import {PracticeType} from "../routine/types";
import {defaultUserRoutineNoteRange} from "../routine";
import BPMSelect from "../routine/components/BPMSelect.vue";
import RoutinePartPracticeEditor from "../routine/components/RoutinePartPracticeEditor.vue";
import RoutinePartNoteRangeEditor from "../routine/components/RoutinePartNoteRangeEditor.vue";
import {exists} from "../utilities";

const routineEditStore = useRoutineStore();

const partListUlRef = ref<HTMLElement | null>(null);

const dragSourceIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);
/** Ignore the next row click after a pointer reorder (avoids jumping selection on release). */
const suppressNextPartRowClick = ref(false);

/** Movement past this distance (px) commits a reorder vs a simple click on the handle. */
const REORDER_MOVE_THRESHOLD_PX = 3;

let reorderPointerId: number | null = null;
let reorderFromIndex: number | null = null;
let reorderStartX = 0;
let reorderStartY = 0;
let reorderDidMove = false;
let reorderHandleEl: HTMLElement | null = null;

const selectedPart = computed(() => {
    const e = routineEditStore.currentEdit;
    if (!e) {
        return null;
    }
    return e.parts[routineEditStore.selectedPartIndex] ?? null;
});

watch(
    () => routineEditStore.currentRoutine,
    () => {
        routineEditStore.selectPart(0);
    },
);

function isChordOrScalePractice(p: {type?: PracticeType} | null): boolean {
    return p != null && (p.type === PracticeType.Chords || p.type === PracticeType.Scales);
}

function dropIndexFromPoint(clientX: number, clientY: number): number | null {
    const root = partListUlRef.value;
    if (!root || !routineEditStore.currentEdit) {
        return null;
    }
    const stack = document.elementsFromPoint(clientX, clientY);
    for (const el of stack) {
        if (!(el instanceof Element)) {
            continue;
        }
        if (el.closest(".part-list") !== root) {
            continue;
        }
        const item = el.closest(".part-list-item");
        if (item) {
            const items = root.querySelectorAll(".part-list-item");
            const idx = Array.prototype.indexOf.call(items, item);
            if (idx >= 0) {
                return idx;
            }
        }
    }
    return null;
}

function detachReorderListeners() {
    window.removeEventListener("pointermove", onReorderPointerMove);
    window.removeEventListener("pointerup", onReorderPointerUp);
    window.removeEventListener("pointercancel", onReorderPointerUp);
}

function onReorderPointerMove(e: PointerEvent) {
    if (reorderPointerId !== e.pointerId || reorderFromIndex === null) {
        return;
    }
    const dx = e.clientX - reorderStartX;
    const dy = e.clientY - reorderStartY;
    if (dx * dx + dy * dy >= REORDER_MOVE_THRESHOLD_PX * REORDER_MOVE_THRESHOLD_PX) {
        reorderDidMove = true;
    }
    if (reorderDidMove) {
        dragOverIndex.value = dropIndexFromPoint(e.clientX, e.clientY);
    }
}

function onReorderPointerUp(e: PointerEvent) {
    if (reorderPointerId !== e.pointerId) {
        return;
    }
    detachReorderListeners();
    if (reorderHandleEl) {
        try {
            reorderHandleEl.releasePointerCapture(e.pointerId);
        } catch {
            /* already released */
        }
    }
    if (reorderDidMove && reorderFromIndex !== null && dragOverIndex.value !== null) {
        const from = reorderFromIndex;
        const to = dragOverIndex.value;
        if (from !== to) {
            routineEditStore.movePart(from, to);
        }
        suppressNextPartRowClick.value = true;
        window.setTimeout(() => {
            suppressNextPartRowClick.value = false;
        }, 0);
    }
    dragSourceIndex.value = null;
    dragOverIndex.value = null;
    reorderPointerId = null;
    reorderFromIndex = null;
    reorderDidMove = false;
    reorderHandleEl = null;
}

function onPartReorderHandlePointerDown(e: PointerEvent, index: number) {
    if (e.button !== 0) {
        return;
    }
    reorderPointerId = e.pointerId;
    reorderFromIndex = index;
    reorderStartX = e.clientX;
    reorderStartY = e.clientY;
    reorderDidMove = false;
    reorderHandleEl = e.currentTarget as HTMLElement;
    dragSourceIndex.value = index;
    dragOverIndex.value = null;
    reorderHandleEl.setPointerCapture(e.pointerId);
    window.addEventListener("pointermove", onReorderPointerMove);
    window.addEventListener("pointerup", onReorderPointerUp);
    window.addEventListener("pointercancel", onReorderPointerUp);
}

onUnmounted(() => {
    detachReorderListeners();
    if (reorderHandleEl != null && reorderPointerId != null) {
        try {
            reorderHandleEl.releasePointerCapture(reorderPointerId);
        } catch {
            /* already released */
        }
    }
    reorderPointerId = null;
    reorderFromIndex = null;
    reorderDidMove = false;
    reorderHandleEl = null;
    dragSourceIndex.value = null;
    dragOverIndex.value = null;
});

function onPartRowClick(index: number) {
    if (suppressNextPartRowClick.value) {
        return;
    }
    routineEditStore.selectPart(index);
}
</script>

<template>
  <section
    v-if="exists(routineEditStore.currentEdit)"
    class="routine-settings"
  >
    <SettingsEditField
      v-model="routineEditStore.currentEdit.name"
      label="Routine Name"
      :can-set="false"
      :component="InputText"
    />
  </section>
  <section
    v-if="exists(routineEditStore.currentEdit)"
    class="title-divider"
  >
    <hr>
    <span>Parts</span>
    <hr>
  </section>
  <section
    v-if="exists(routineEditStore.currentEdit)"
    class="parts-list-section"
  >
    <div class="part-list-wrap">
      <div class="part-list-row">
        <ul
          ref="partListUlRef"
          class="part-list"
          :class="{'part-list--drag-active': dragSourceIndex !== null}"
        >
          <li
            v-for="(item, index) in routineEditStore.currentEdit.parts"
            :key="index"
            class="part-list-item"
            :class="{
              'part-list-item--selected': index === routineEditStore.selectedPartIndex,
              'part-list-item--dragging': dragSourceIndex === index,
              'part-list-item--drop-target': dragOverIndex === index,
            }"
            @click="onPartRowClick(index)"
          >
            <span
              class="part-drag-hint pi pi-bars"
              aria-label="Drag to reorder"
              @pointerdown="onPartReorderHandlePointerDown($event, index)"
            />
            <span class="part-list-label">{{ item.name || `Part ${index + 1}` }}</span>
            <Button
              type="button"
              icon="pi pi-trash"
              rounded
              text
              severity="danger"
              size="small"
              class="part-delete-button"
              :aria-label="`Remove ${item.name || `part ${index + 1}`}`"
              draggable="false"
              @dragstart.stop.prevent
              @click.stop="routineEditStore.removeStep(index)"
            />
          </li>
        </ul>
        <div class="part-list-actions">
          <Button
            type="button"
            icon="pi pi-copy"
            rounded
            size="small"
            severity="secondary"
            aria-label="Clone part"
            class="part-action-button"
            draggable="false"
            @dragstart.prevent
            @click="routineEditStore.clonePartAndSelect"
          />
          <Button
            type="button"
            icon="pi pi-plus"
            rounded
            size="small"
            severity="secondary"
            aria-label="Add part"
            class="part-action-button"
            draggable="false"
            @dragstart.prevent
            @click="routineEditStore.addPartAndSelect"
          />
        </div>
      </div>
    </div>
  </section>
  <section
    v-if="exists(selectedPart)"
    class="part-editor-shell"
  >
    <div class="part-editor-split">
      <div class="part-editor-column">
        <h3 class="part-editor-heading">
          Part
        </h3>
        <div class="settings-edit">
          <SettingsEditField
            v-model="selectedPart.name"
            label="Part Name"
            :can-set="false"
            :component="InputText"
          />
          <SettingsEditField
            v-model="selectedPart.parentSettings"
            label="Parent"
            :can-set="false"
            :component="ParentTypeSelect"
          />
          <SettingsEditField
            v-model="selectedPart.seed"
            label="Fixed Seed"
            :set-value="Math.round(Math.random() * 1000)"
            :component="InputNumber"
            :component-props="{min: 0, showButtons: true}"
          />
          <SettingsEditField
            v-model="selectedPart.noteRange"
            label="Note / fret span"
            :set-value="defaultUserRoutineNoteRange()"
            :component="RoutinePartNoteRangeEditor"
          />
          <SettingsEditField
            v-model="selectedPart.repeatCount"
            label="Repeat Count"
            :can-set="false"
            :component="InputNumber"
            :component-props="{min: 0, showButtons: true}"
          />
          <SettingsEditField
            v-model="selectedPart.cloneRepeat"
            label="Clone Repeat"
            :can-set="false"
            :component="ToggleSwitch"
          />
          <SettingsEditField
            v-model="selectedPart.targetBPM"
            label="BPM"
            :set-value="120"
            :component="BPMSelect"
          />
          <SettingsEditField
            v-model="selectedPart.requireOctave"
            label="Require Octave"
            :set-value="false"
            :component="ToggleSwitch"
          />
          <SettingsEditField
            v-model="selectedPart.minSuccessVelocity"
            label="Minimum Velocity"
            :set-value="20"
            :component="InputNumber"
            :component-props="{min: 0, max: 127, showButtons: true}"
          />
          <SettingsEditField
            v-model="selectedPart.promptCount"
            label="Prompt Count"
            :set-value="8"
            :component="InputNumber"
            :component-props="{min: 0, showButtons: true}"
          />
          <template v-if="isChordOrScalePractice(selectedPart.practice)">
            <div class="part-free-play-subsection">
              <h4 class="part-subsection-heading">
                Free play
              </h4>
              <p class="part-subsection-hint">
                Blank prompts; any note in the chord or scale set counts. The limit below applies when free play is on.
              </p>
              <div class="settings-edit-field">
                <span>Enable free play:</span>
                <ToggleSwitch
                  :model-value="selectedPart.freePlayInSet === true"
                  @update:model-value="(v: boolean) => { selectedPart.freePlayInSet = v; }"
                />
              </div>
              <div class="settings-edit-field">
                <span>Max same pitch in a row (empty = no limit):</span>
                <InputNumber
                  :model-value="selectedPart.maxConsecutiveSamePitchSuccess ?? undefined"
                  :min="1"
                  :max="99"
                  show-buttons
                  placeholder="—"
                  @update:model-value="
                    (v: number | null) => {
                      selectedPart.maxConsecutiveSamePitchSuccess = v == null ? null : v;
                    }
                  "
                />
              </div>
            </div>
          </template>
        </div>
      </div>
      <div class="part-editor-column">
        <h3 class="part-editor-heading">
          Practice
        </h3>
        <div class="settings-edit">
          <SettingsEditField
            v-model="selectedPart.practice"
            :can-set="false"
            :component="RoutinePartPracticeEditor"
            :component-props="{noteRange: selectedPart.noteRange}"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.routine-settings {
    padding: 0 1rem;
}

.title-divider {
    display: flex;
    align-items: center;
}

.title-divider > span {
    padding: 0.5rem 1rem;
}

.title-divider > hr {
    flex: 1;
}

.parts-list-section {
    padding: 0 1rem 1rem;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.part-list-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 100%;
}

.part-list-row {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    max-width: 100%;
}

.part-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: stretch;
    gap: 0.5rem;
    flex: 0 1 auto;
    max-width: calc(100% - 6rem);
    min-width: 0;
}

/* Let children of *other* rows ignore pointer events so the <li> receives dragover/drop.
   Do not apply to the source row: pointer-events:none on the drag handle aborts the drag in Chromium/Electron. */
.part-list--drag-active .part-list-item:not(.part-list-item--dragging) :deep(*) {
    pointer-events: none;
}

.part-list-item {
    flex: 0 0 auto;
    width: 11rem;
    min-height: 2.85rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.4rem;
    padding: 0.45rem 0.6rem;
    border: 1px solid var(--p-content-border-color, rgba(255, 255, 255, 0.12));
    border-radius: var(--p-content-border-radius, 8px);
    cursor: pointer;
    user-select: none;
}

.part-list-item:hover {
    background: var(--p-content-hover-background, rgba(255, 255, 255, 0.04));
}

.part-list-item--selected {
    background: var(--p-highlight-background, rgba(59, 130, 246, 0.2));
}

.part-list-item--dragging {
    opacity: 0.65;
}

.part-list-item--drop-target {
    outline: 2px solid var(--p-primary-color, #3b82f6);
    outline-offset: 1px;
    background: var(--p-highlight-background, rgba(59, 130, 246, 0.18));
}

.part-drag-hint {
    color: var(--p-text-muted-color, rgba(255, 255, 255, 0.45));
    cursor: grab;
    font-size: 0.85rem;
    flex-shrink: 0;
    touch-action: none;
}

.part-list-item:active .part-drag-hint {
    cursor: grabbing;
}

.part-list-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.9rem;
}

.part-delete-button {
    flex-shrink: 0;
    margin: -0.25rem -0.35rem -0.25rem 0;
}

.part-list-actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
}

.part-action-button {
    flex-shrink: 0;
    width: 2.5rem;
    height: 2.5rem;
}

.part-editor-shell {
    padding: 0 1rem 1.5rem;
}

.part-editor-split {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 1.5rem;
    align-items: start;
}

@media (max-width: 52rem) {
    .part-editor-split {
        grid-template-columns: 1fr;
    }
}

.part-editor-heading {
    margin: 0 0 0.65rem;
    font-size: 1rem;
    font-weight: 600;
    opacity: 0.92;
}

.part-free-play-subsection {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    margin-top: 0.35rem;
    padding: 0.75rem 0.85rem;
    border: 1px solid var(--p-content-border-color, rgba(255, 255, 255, 0.12));
    border-radius: var(--p-content-border-radius, 8px);
    background: var(--p-content-hover-background, rgba(255, 255, 255, 0.03));
}

.part-subsection-heading {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    opacity: 0.9;
}

.part-subsection-hint {
    margin: -0.35rem 0 0;
    font-size: 0.8rem;
    line-height: 1.35;
    opacity: 0.72;
}

.part-free-play-subsection .settings-edit-field {
    margin: 0;
}

.settings-edit {
    padding: 0;
}

.settings-edit > .settings-edit-field,
.settings-edit > :deep(.settings-edit-field) {
    margin: 1rem 0;
}

</style>

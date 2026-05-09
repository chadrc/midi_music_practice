<script setup lang="ts">
import {Button, InputNumber, InputText, Popover, Select, ToggleButton} from "primevue";
import {ref, computed} from "vue";
import {storeToRefs} from "pinia";
import {useSettingsStore} from "../store/settings";

const settingsStore = useSettingsStore();
const {referenceView} = storeToRefs(settingsStore);
const popoverRef = ref<InstanceType<typeof Popover> | null>(null);

function togglePopover(event: Event) {
    popoverRef.value?.toggle(event);
}

function onPatternRows(v: number | null) {
    settingsStore.referenceSetPatternRows(v);
}

const presetNameInput = ref("");
const selectedPresetId = ref<string | null>(null);

const presetSelectOptions = computed(() =>
    settingsStore.referencePresets.map((p) => ({label: p.name, value: p.id})),
);

function loadSelectedPreset() {
    if (selectedPresetId.value != null) {
        settingsStore.referenceLoadPreset(selectedPresetId.value);
    }
}

function saveNewPreset() {
    const id = settingsStore.referenceSavePreset(presetNameInput.value);
    if (id != null) {
        presetNameInput.value = "";
        selectedPresetId.value = id;
    }
}

function deleteSelectedPreset() {
    if (selectedPresetId.value != null) {
        settingsStore.referenceDeletePreset(selectedPresetId.value);
        selectedPresetId.value = null;
    }
}
</script>

<template>
  <div class="reference-toolbar">
    <ToggleButton
      v-model="referenceView.showTileControls"
      on-label="Hide tile controls"
      off-label="Show tile controls"
      size="small"
      class="tile-controls-toggle"
    />
    <Button
      type="button"
      label="Panel layout"
      icon="pi pi-th-large"
      size="small"
      severity="secondary"
      @click="togglePopover"
    />
    <Popover
      ref="popoverRef"
      class="reference-settings-popover"
    >
      <div class="popover-panel">
        <div class="popover-field">
          <span class="field-label">Panel rows</span>
          <div class="pattern-stack">
            <div class="pattern-part">
              <span class="sublabel">Rows</span>
              <InputNumber
                :model-value="referenceView.patternRows"
                :min="1"
                :max="6"
                show-buttons
                button-layout="horizontal"
                @update:model-value="onPatternRows"
              />
            </div>
          </div>
          <p class="pattern-hint">
            With tile controls visible, set columns per row above each row, and note range (type + bounds) on each tile.
          </p>
        </div>
      </div>
    </Popover>
    <div class="preset-bar">
      <span class="preset-toolbar-label">Presets</span>
      <Select
        v-model="selectedPresetId"
        :options="presetSelectOptions"
        option-label="label"
        option-value="value"
        placeholder="Select"
        class="preset-select"
        show-clear
      />
      <Button
        type="button"
        label="Load"
        size="small"
        :disabled="selectedPresetId == null"
        @click="loadSelectedPreset"
      />
      <Button
        type="button"
        label="Delete"
        size="small"
        severity="danger"
        outlined
        :disabled="selectedPresetId == null"
        @click="deleteSelectedPreset"
      />
      <InputText
        v-model="presetNameInput"
        placeholder="New preset name"
        class="preset-name-input"
        @keyup.enter="saveNewPreset"
      />
      <Button
        type="button"
        label="Save"
        size="small"
        :disabled="presetNameInput.trim() === ''"
        @click="saveNewPreset"
      />
    </div>
  </div>
</template>

<style scoped>
.reference-toolbar {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 0.75rem;
}

.tile-controls-toggle {
    flex-shrink: 0;
}

.popover-panel {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
    padding: 0.35rem 0.15rem;
    min-width: 15rem;
    max-width: 22rem;
}

.popover-field {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.45rem;
}

.field-label {
    font-size: 0.8rem;
    font-weight: 600;
    opacity: 0.92;
}

.sublabel {
    font-size: 0.72rem;
    opacity: 0.75;
}

.pattern-stack {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
}

.pattern-part {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.pattern-hint {
    margin: 0;
    font-size: 0.72rem;
    line-height: 1.35;
    opacity: 0.72;
}

.preset-bar {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem 0.5rem;
    margin-left: 0.35rem;
    padding-left: 0.75rem;
    border-left: 1px solid var(--p-content-border-color, rgba(255, 255, 255, 0.12));
}

.preset-toolbar-label {
    font-size: 0.8rem;
    font-weight: 600;
    opacity: 0.92;
    white-space: nowrap;
}

.preset-select {
    min-width: 7.5rem;
    width: 10rem;
    max-width: 14rem;
}

.preset-name-input {
    width: 9rem;
    min-width: 6rem;
}
</style>

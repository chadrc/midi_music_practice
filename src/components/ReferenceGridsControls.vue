<script setup lang="ts">
import {Button, InputNumber, InputText, Popover, Select, Slider, ToggleButton} from "primevue";
import {ref, computed} from "vue";
import {storeToRefs} from "pinia";
import {useSettingsStore} from "../store/settings";
import {NoteRangeType} from "../routine/types";

const settingsStore = useSettingsStore();
const {referenceView} = storeToRefs(settingsStore);
const popoverRef = ref<InstanceType<typeof Popover> | null>(null);

function togglePopover(event: Event) {
    popoverRef.value?.toggle(event);
}

function makeNoteRangeOptions() {
    return [
        {name: "Notes", value: NoteRangeType.Notes},
        {name: "Frets", value: NoteRangeType.Frets},
        {name: "Octaves", value: NoteRangeType.Octaves},
    ];
}

function onPatternRows(v: number | null) {
    settingsStore.referenceSetPatternRows(v);
}

function onPatternCols(v: number | null) {
    settingsStore.referenceSetPatternCols(v);
}

function onNoteRangeType(t: NoteRangeType) {
    settingsStore.referenceSetNoteRangeType(t);
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

function onRangeSlider(range: number | number[]) {
    if (Array.isArray(range) && range.length >= 2) {
        settingsStore.referenceSetNoteRangeSlider([range[0]!, range[1]!]);
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
      label="Layout & range"
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
          <span class="field-label">Panel grid</span>
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
            <div class="pattern-part">
              <span class="sublabel">Columns</span>
              <InputNumber
                :model-value="referenceView.patternCols"
                :min="1"
                :max="6"
                show-buttons
                button-layout="horizontal"
                @update:model-value="onPatternCols"
              />
            </div>
          </div>
        </div>
        <div class="popover-field">
          <label
            class="field-label"
            for="reference-range-type"
          >Range type</label>
          <Select
            id="reference-range-type"
            :model-value="referenceView.noteRange.type"
            :options="makeNoteRangeOptions()"
            option-value="value"
            option-label="name"
            class="range-type-select"
            @update:model-value="onNoteRangeType"
          />
        </div>
        <div class="popover-field">
          <span class="field-label">Note range</span>
          <div class="range-slider-wrap">
            <span class="range-bound">{{ settingsStore.referenceNoteRangeSliderValues[0] }}</span>
            <Slider
              :model-value="settingsStore.referenceNoteRangeSliderValues"
              :max="settingsStore.referenceNoteRangeMax"
              range
              class="range-slider"
              @value-change="onRangeSlider"
            />
            <span class="range-bound">{{ settingsStore.referenceNoteRangeSliderValues[1] }}</span>
          </div>
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

.range-type-select {
    width: 100%;
}

.range-slider-wrap {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.65rem;
}

.range-bound {
    font-variant-numeric: tabular-nums;
    min-width: 1.5rem;
    text-align: center;
    font-size: 0.85rem;
}

.range-slider {
    flex: 1;
    min-width: 0;
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

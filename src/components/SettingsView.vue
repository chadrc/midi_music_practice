<script setup lang="ts">

import {ref} from "vue";
import {useGlobalStore} from "../store/globals";
import {useMidiStore} from "../store/midi";
import {useRoutineStore} from "../store/routineEdit";
import {useSettingsStore} from "../store/settings";
import {
    buildAppSettingsExportPayload,
    parseAppSettingsImportData,
    stringifyAppSettingsExport,
} from "../settings/appSettingsBundle";
import {Button, Checkbox, DataTable, Column, Message} from "primevue";

const globalStore = useGlobalStore();
const midiStore = useMidiStore();
const settingsStore = useSettingsStore();
const routineStore = useRoutineStore();

const importInputRef = ref<HTMLInputElement | null>(null);
const importMessage = ref<{severity: "success" | "error"; text: string} | null>(null);

function exportAllSettings() {
    importMessage.value = null;
    const payload = buildAppSettingsExportPayload(
        JSON.parse(JSON.stringify(settingsStore.$state)) as Record<string, unknown>,
        JSON.parse(JSON.stringify(routineStore.routines)) as unknown[],
    );
    const blob = new Blob([stringifyAppSettingsExport(payload)], {type: "application/json"});
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = `midi-music-practice-settings.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function openImportPicker() {
    importMessage.value = null;
    importInputRef.value?.click();
}

function onImportFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (!file) {
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const text = String(reader.result ?? "");
            const parsed = JSON.parse(text) as unknown;
            const result = parseAppSettingsImportData(parsed);
            if (!result.ok) {
                importMessage.value = {severity: "error", text: result.error};
                return;
            }
            const ok = window.confirm(
                "Replace all settings and routines with this file? This cannot be undone.",
            );
            if (!ok) {
                return;
            }
            settingsStore.applyImportedSettingsSnapshot(result.settings);
            routineStore.applyImportedRoutines(result.routines);
            importMessage.value = {severity: "success", text: "Settings and routines imported."};
        } catch {
            importMessage.value = {severity: "error", text: "Could not read JSON file."};
        }
    };
    reader.readAsText(file);
}

function isReceiving(id: string) {
  let device = midiStore.ioStates.get(id);
  if (device === null || device === undefined) return false;

  return device.receiving;
}

function isAutoReceiving(id: string) {
  return settingsStore.audio.autoReceiveInstruments.includes(id);
}
</script>

<template>
  <section class="settings-block backup-block">
    <h3 class="block-title">
      Backup
    </h3>
    <p class="hint">
      Export saves everything in this dialog plus practice routines and reference presets to one JSON file. Import restores that data and overwrites the current session.
    </p>
    <div class="backup-actions">
      <Button
        label="Export all settings"
        size="small"
        @click="exportAllSettings"
      />
      <Button
        label="Import from file…"
        size="small"
        severity="secondary"
        @click="openImportPicker"
      />
      <input
        ref="importInputRef"
        type="file"
        accept="application/json,.json"
        class="sr-only"
        @change="onImportFileChange"
      >
    </div>
    <Message
      v-if="importMessage"
      :severity="importMessage.severity"
      :closable="false"
      class="import-feedback"
    >
      {{ importMessage.text }}
    </Message>
  </section>

  <section>
    <span>Instrument Audio Enabled: </span>
    <Checkbox
      v-model="settingsStore.audio.instrumentAudioEnabled"
      binary
    />
  </section>
  <Button
    size="small"
    @click="midiStore.requestAccess(settingsStore.audio.autoReceiveInstruments)"
  >
    Reload MIDI Devices
  </Button>

  <DataTable :value="midiStore.inputs">
    <Column
      field="name"
      header="Name"
    />
    <Column
      field="manufacturer"
      header="Manufacturer"
    />
    <Column
      field="receiving"
      header="Receiving"
    >
      <template #body="slotProps">
        <Button
          :severity="isReceiving(slotProps.data.id) ? 'danger' : 'info'"
          size="small"
          @click="midiStore.toggleReceiving(slotProps.data.id)"
        >
          {{ isReceiving(slotProps.data.id) ? "Disable" : "Enable" }}
        </Button>
      </template>
    </Column>
    <Column header="Auto Receive">
      <template #body="slotProps">
        <Button
          :severity="isAutoReceiving(slotProps.data.id) ? 'danger' : 'info'"
          size="small"
          @click="settingsStore.toggleAutoReceiveInstrument(slotProps.data.id)"
        >
          {{ isAutoReceiving(slotProps.data.id) ? "Disable" : "Enable" }}
        </Button>
      </template>
    </Column>
  </DataTable>
  <footer class="settings-version">
    Version {{ globalStore.appVersion || "…" }}
  </footer>
</template>

<style scoped>
.settings-block {
  margin-bottom: 1.25rem;
}

.block-title {
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
}

.hint {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  line-height: 1.4;
  opacity: 0.9;
}

.backup-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.import-feedback {
  margin-top: 0.75rem;
}

.settings-version {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--p-content-border-color, rgba(0, 0, 0, 0.12));
  font-size: 0.8rem;
  line-height: 1.4;
  color: var(--p-text-muted-color, rgba(255, 255, 255, 0.5));
}
</style>
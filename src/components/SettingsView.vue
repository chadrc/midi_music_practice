<script setup lang="ts">

import {useMidiStore} from "../store/midi";
import {useSettingsStore} from "../store/settings";
import {Button, Checkbox, DataTable, Column} from "primevue";

const midiStore = useMidiStore();
const settingsStore = useSettingsStore();

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
</template>

<style scoped>

</style>
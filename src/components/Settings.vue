<script setup lang="ts">

import NoteTestGrid from "./NoteTestGrid.vue";
import {useMidiStore} from "../store/midi";
import {useSettingsStore} from "../store/settings";
import {onMounted} from "vue";
import {Button, Panel, Checkbox, DataTable, Column} from "primevue";

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

onMounted(() => {
  midiStore.requestAccess(settingsStore.audio.autoReceiveInstruments);
})
</script>

<template>
  <section>
    <span>Instrument Audio Enabled: </span>
    <Checkbox v-model="settingsStore.audio.instrumentAudioEnabled" binary/>
  </section>
  <Button @click="midiStore.requestAccess(settingsStore.audio.autoReceiveInstruments)"
          size="small">
    Reload MIDI Devices
  </Button>

  <DataTable :value="midiStore.inputs">
    <Column field="name" header="Name"/>
    <Column field="manufacturer" header="Manufacturer"/>
    <Column field="receiving" header="Receiving">
      <template #body="slotProps">
        <Button @click="midiStore.toggleReceiving(slotProps.data.id)"
                :severity="isReceiving(slotProps.data.id) ? 'danger' : 'info'"
                size="small">
          {{ isReceiving(slotProps.data.id) ? "Disable" : "Enable" }}
        </Button>
      </template>
    </Column>
    <Column header="Auto Receive">
      <template #body="slotProps">
        <Button @click="settingsStore.toggleAutoReceiveInstrument(slotProps.data.id)"
                :severity="isAutoReceiving(slotProps.data.id) ? 'danger' : 'info'"
                size="small">
          {{ isAutoReceiving(slotProps.data.id) ? "Disable" : "Enable" }}
        </Button>
      </template>
    </Column>
  </DataTable>
  <Panel header="Note Grid">
    <NoteTestGrid/>
  </Panel>
</template>

<style scoped>

</style>
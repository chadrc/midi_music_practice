<script setup lang="ts">
import {useMidiStore} from "./store/midi";

const midiStore = useMidiStore();

function getIsReceiving(id: string) {
  let device = midiStore.ioStates.get(id);
  if (device === null || device === undefined) return false;

  return device.receiving;
}

</script>

<template>
  <h1>MIDI Music Practice</h1>
  <button @click="midiStore.requestAccess()">
    Load MIDI Devices
  </button>
  <table>
    <tr>
      <th>Name</th>
      <th>Manufacturer</th>
      <th>Receiving</th>
      <th>Sending</th>
    </tr>
    <tr
        v-for="input in midiStore.inputs"
        :key="input.id"
    >
      <td>{{ input.name }}</td>
      <td>{{ input.manufacturer }}</td>
      <td>
        <input type="checkbox"
               :value="getIsReceiving(input.id)"
               @click="midiStore.toggleReceiving(input.id)">
      </td>
      <td>
        <input type="checkbox"
               :value="false">
      </td>
    </tr>
  </table>
</template>

<style scoped>

</style>
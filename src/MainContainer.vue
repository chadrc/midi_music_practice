<script setup lang="ts">
import {useMidiStore} from "./store/midi";
import NoteTestGrid from "./components/NoteTestGrid.vue";
import FretBoard from "./components/FretBoard.vue";
import {Tabs, TabList, Tab, TabPanels, TabPanel} from "primevue";
import {useSettingsStore} from "./store/settings";

const midiStore = useMidiStore();
const settingsStore = useSettingsStore();

function isReceiving(id: string) {
  let device = midiStore.ioStates.get(id);
  if (device === null || device === undefined) return false;

  return device.receiving;
}

</script>

<template>
  <Tabs value="practice">
    <TabList>
      <Tab value="settings">Settings</Tab>
      <Tab value="practice">Practice</Tab>
    </TabList>
    <TabPanels>
      <TabPanel value="settings">
        <h1>MIDI Music Practice</h1>
        <section>
          <span>Instrument Audio Enabled: </span>
          <input type="checkbox" v-model="settingsStore.audio.instrumentAudioEnabled">
        </section>
        <button @click="midiStore.requestAccess()">
          Load MIDI Devices
        </button>
        <table>
          <thead>
          <tr>
            <th>Name</th>
            <th>Manufacturer</th>
            <th>Receiving</th>
            <!--      <th>Sending</th>-->
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="input in midiStore.inputs"
              :key="input.id"
          >
            <td>{{ input.name }}</td>
            <td>{{ input.manufacturer }}</td>
            <td>
              <input type="checkbox"
                     :checked="isReceiving(input.id)"
                     @click="midiStore.toggleReceiving(input.id)">
            </td>
            <!--      <td>-->
            <!--        <input type="checkbox"-->
            <!--               :value="false">-->
            <!--      </td>-->
          </tr>
          </tbody>
        </table>

        <NoteTestGrid/>
      </TabPanel>
      <TabPanel value="practice">
        <FretBoard/>
      </TabPanel>
    </TabPanels>
  </Tabs>


</template>

<style>
@import "./variables.css";
</style>
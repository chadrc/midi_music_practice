<script setup lang="ts">
import FretBoard from "./components/FretBoard.vue";
import {Tabs, TabList, Tab, TabPanels, TabPanel} from "primevue";
import Settings from "./components/Settings.vue";
import RNBOPatch from "./components/RNBOPatch.vue";

</script>

<template>
  <Tabs value="practice">
    <TabList>
      <Tab value="practice">
        Practice
      </Tab>
      <Tab value="instruments">
        Instruments
      </Tab>
      <Tab value="settings">
        Settings
      </Tab>
    </TabList>
    <TabPanels>
      <TabPanel value="settings">
        <Settings />
      </TabPanel>
      <TabPanel value="practice">
        <FretBoard />
      </TabPanel>
      <TabPanel value="instruments">
        <Suspense>
          <RNBOPatch />
          <template #fallback>
            Loading Instrument...
          </template>
        </Suspense>
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<style>
@import "./variables.css";
</style>
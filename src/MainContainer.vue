<script setup lang="ts">
import FretBoard from "./components/FretBoard.vue";
import {Tabs, TabList, Tab, TabPanels, TabPanel} from "primevue";
import Settings from "./components/Settings.vue";

</script>

<template>
  <Tabs value="practice">
    <TabList>
      <Tab value="settings">
        Settings
      </Tab>
      <Tab value="practice">
        Practice
      </Tab>
    </TabList>
    <TabPanels>
      <TabPanel value="settings">
        <Settings />
      </TabPanel>
      <TabPanel value="practice">
        <FretBoard />
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<style>
@import "./variables.css";
</style>
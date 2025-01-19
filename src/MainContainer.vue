<script setup lang="ts">
import PracticeView from "./components/PracticeView.vue";
import {onMounted} from "vue";
import {useMidiStore} from "./store/midi";
import {useSettingsStore} from "./store/settings";

const midiStore = useMidiStore();
const settingsStore = useSettingsStore();

onMounted(() => {
  midiStore.requestAccess(settingsStore.audio.autoReceiveInstruments);
})
</script>

<template>
  <PracticeView />
</template>

<style>
@import "./variables.css";
@import "primeicons/primeicons.css";
</style>
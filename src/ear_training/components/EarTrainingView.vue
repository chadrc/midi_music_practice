<script setup lang="ts">
import {Button} from "primevue";
import {useInstrumentStore} from "../../store/instruments";
import {BaseNotes} from "../../notes/scales";

const instrumentStore = useInstrumentStore()

function playNote() {
  const stop = instrumentStore.playNote(BaseNotes.C + 12 * 4, 100);

  window.setTimeout(stop, 500);
}

</script>

<template>
  <h1>Ear Training</h1>
  <Button
    label="Play"
    severity="info"
    size="small"
    @click="playNote"
  />
</template>

<style scoped>

</style>
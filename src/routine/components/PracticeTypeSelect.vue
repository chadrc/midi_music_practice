<script setup lang="ts">
import {Select} from "primevue";
import {PracticeType} from "../types";

const model = defineModel<PracticeType>();

const options = [
    {name: "Notes", value: PracticeType.Notes},
    {name: "Chords", value: PracticeType.Chords},
    {name: "Scales", value: PracticeType.Scales},
];
</script>

<template>
  <Select
    v-model="model"
    :options="options"
    option-label="name"
    option-value="value"
  />
</template>

<style scoped>

</style>

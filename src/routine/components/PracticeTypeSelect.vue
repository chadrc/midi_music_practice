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
    class="practice-type-select"
    :options="options"
    option-label="name"
    option-value="value"
  />
</template>

<style scoped>
.practice-type-select {
    width: 100%;
}
</style>

<script setup lang="ts">
import {Select} from "primevue";
import {PracticeType} from "../types";

const model = defineModel<PracticeType>();

const options = [
  {
    name: "Generated",
    value: PracticeType.Generated,
  },
  {
    name: "Composed",
    value: PracticeType.Composed,
  }
]
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
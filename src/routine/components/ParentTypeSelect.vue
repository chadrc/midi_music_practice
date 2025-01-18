<script setup lang="ts">
import {Select} from "primevue";
import {ParentType} from "../types";

const model = defineModel<ParentType>();

const options = [
  {
    name: "Settings",
    value: ParentType.Settings,
  },
  {
    name: "First",
    value: ParentType.First,
  },
  {
    name: "Previous",
    value: ParentType.Previous,
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
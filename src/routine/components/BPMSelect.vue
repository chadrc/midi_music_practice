<script setup lang="ts">
import {Select} from "primevue";

const model = defineModel<number>()

function makeBPMOptions() {
  const options = [];
  for (let i = 5; i <= 200; i += 5) {
    options.push(i);
  }
  return options;
}
</script>

<template>
  <Select
    v-model="model"
    :options="makeBPMOptions()"
  />
</template>

<style scoped>

</style>
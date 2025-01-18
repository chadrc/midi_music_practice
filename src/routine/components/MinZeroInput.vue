<script setup lang="ts">
import {InputNumber} from "primevue";

const model = defineModel<number>();
</script>

<template>
  <InputNumber
    v-model="model"
    :min="0"
  />
</template>

<style scoped>

</style>
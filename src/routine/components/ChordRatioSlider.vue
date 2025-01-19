<script setup lang="ts">
import {Slider} from "primevue";

const props = withDefaults(defineProps<{
  max?: number;
}>(), {
  max: Number.MAX_SAFE_INTEGER,
});

const model = defineModel<number>();
</script>

<template>
  <Slider
    v-model="model"
    :max="props.max"
    class="note-range-slider"
  />
  <span>
    {{ model }}
  </span>
</template>

<style scoped>
.note-range-slider {
  width: 10rem;
  margin-left: 1rem;
  margin-right: 1rem;
}
</style>
<script setup lang="ts">
import {Slider} from "primevue";
import {computed} from "vue";

const model = defineModel<{
  start: number;
  end: number;
}>();

const props = withDefaults(defineProps<{
  min?: number;
  max?: number;
}>(), {
  min: 0,
  max: 100,
})

const internalModel = computed(() => [model.value.start, model.value.end])

function updateRange(value: number[]) {
  model.value.start = value[0];
  model.value.end = value[1];
}
</script>

<template>
  <div class="note-range-slider-wrapper">
    <span>{{ model.start }}</span>
    <Slider
      :model-value="internalModel"
      :max="props.max"
      :min="props.min"
      range
      class="note-range-slider"
      @update:model-value="updateRange"
    />
    <span>{{ model.end }}</span>
  </div>
</template>

<style scoped>
.note-range-slider-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 1rem;
  margin-right: 1rem;
}

.note-range-slider {
  width: 10rem;
  margin-left: 1rem;
  margin-right: 1rem;
}
</style>
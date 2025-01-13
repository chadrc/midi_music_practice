<script setup lang="ts">

import {CascadeSelect} from "primevue";
import {
  CHROMATIC_SCALE, MAJOR_PENTATONIC_SCALE_SET_NAME,
  MAJOR_SCALE_SET_NAME, MINOR_PENTATONIC_SCALE_SET_NAME, MINOR_SCALE_SET_NAME,
  NoteScale, SCALES
} from "../notes/scales";
import {exists} from "../utilities";

const props = defineProps({
  value: NoteScale,
  disabled: Boolean,
})
const emit = defineEmits(['scaleSelected'])

function makeScaleOptions() {
  function transformScaleName(name: string) {
    return name
        .replace("Flat", "♭")
        .replace("Sharp", "#")
  }

  function makeScaleOption(
      name: string,
      scales: { [key: string]: NoteScale },
      nameFn: (k: string) => string
  ) {
    return {
      name: name,
      scales: Object.entries(scales).map(([k, v]) => ({"name": nameFn(transformScaleName(k)), "scale": v})),
    }
  }

  return [
    makeScaleOption("Major", SCALES[MAJOR_SCALE_SET_NAME], (k) => `${k} Maj.`),
    makeScaleOption("Minor", SCALES[MINOR_SCALE_SET_NAME], (k) => `${k} Min.`),
    makeScaleOption("Major Pentatonic", SCALES[MAJOR_PENTATONIC_SCALE_SET_NAME], (k) => `${k} Maj. Pent.`),
    makeScaleOption("Minor Pentatonic", SCALES[MINOR_PENTATONIC_SCALE_SET_NAME], (k) => `${k} Min. Pent.`),
  ]
}

const scaleOptions = makeScaleOptions()

function updateScale(value: { name: string, scale: NoteScale }) {
  let scale = CHROMATIC_SCALE
  if (exists(value)) {
    scale = value.scale;
  }

  emit("scaleSelected", scale);
}
</script>

<template>
  <CascadeSelect
      class="scale-select"
      :disabled="props.disabled"
      :value="props.value"
      :options="scaleOptions"
      show-clear
      option-group-label="name"
      option-label="name"
      :option-group-children="['scales']"
      placeholder="Chromatic"
      @value-change="updateScale"
  />
</template>

<style scoped>
.scale-select {
  width: 12rem;
}
</style>
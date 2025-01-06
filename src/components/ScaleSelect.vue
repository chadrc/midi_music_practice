<script setup lang="ts">

import {CascadeSelect} from "primevue";
import {
  CHROMATIC_SCALE,
  MAJOR_PENTATONIC_SCALES,
  MAJOR_SCALES,
  MINOR_PENTATONIC_SCALES,
  MINOR_SCALES,
  NoteScale
} from "../notes/scales";
import {exists} from "../utilities";

const props = defineProps({
  value: NoteScale,
  disabled: Boolean,
})
const emit = defineEmits(['scaleSelected'])

function makeScaleOptions() {
  function transformScaleName(name: string) {
    return name.replace("Flat", "♭").replace("Sharp", "#")
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
    makeScaleOption("Major", MAJOR_SCALES, (k) => `${k} Maj.`),
    makeScaleOption("Minor", MINOR_SCALES, (k) => `${k} Min.`),
    makeScaleOption("Major Pentatonic", MAJOR_PENTATONIC_SCALES, (k) => `${k} Maj. Pent.`),
    makeScaleOption("Minor Pentatonic", MINOR_PENTATONIC_SCALES, (k) => `${k} Min. Pent.`),
  ]
}

const scaleOptions = makeScaleOptions()

function updateScale(value: { name: string, scale: NoteScale }) {
  console.log('scale update')
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
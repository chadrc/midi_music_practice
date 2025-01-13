<script setup lang="ts">

import {CascadeSelect} from "primevue";
import {
  CHROMATIC_SCALE, CHROMATIC_SCALE_SET_NAME, MAJOR_PENTATONIC_SCALE_SET_NAME,
  MAJOR_SCALE_SET_NAME, MINOR_PENTATONIC_SCALE_SET_NAME, MINOR_SCALE_SET_NAME,
  NoteScale, SCALES
} from "../notes/scales";
import {exists} from "../utilities";

const props = defineProps({
  value: NoteScale,
  disabled: Boolean,
})
const emit = defineEmits(['scaleSelected'])

export interface ScaleOption {
  name: string,
  scale: NoteScale,
  scaleSet: string
}

function makeScaleOptions() {
  function transformScaleName(name: string) {
    return name
        .replace("Flat", "♭")
        .replace("Sharp", "#")
  }

  function makeScaleOption(
      name: string,
      scaleSetName: string,
      nameFn: (k: string) => string
  ) {
    let scales = SCALES[scaleSetName];
    return {
      name: name,
      scales: Object.entries(scales).map(([k, v]) => ({
        name: nameFn(transformScaleName(k)),
        scale: v,
        scaleSet: scaleSetName,
      })),
    }
  }

  return [
    makeScaleOption("Major", MAJOR_SCALE_SET_NAME, (k) => `${k} Maj.`),
    makeScaleOption("Minor", MINOR_SCALE_SET_NAME, (k) => `${k} Min.`),
    makeScaleOption("Major Pentatonic", MAJOR_PENTATONIC_SCALE_SET_NAME, (k) => `${k} Maj. Pent.`),
    makeScaleOption("Minor Pentatonic", MINOR_PENTATONIC_SCALE_SET_NAME, (k) => `${k} Min. Pent.`),
  ]
}

const scaleOptions = makeScaleOptions()

function updateScale(value: ScaleOption) {
  if (exists(value)) {
    emit("scaleSelected", value);
  } else {
    emit("scaleSelected", {
      name: "Chromatic",
      scale: CHROMATIC_SCALE,
      scaleSet: CHROMATIC_SCALE_SET_NAME,
    });
  }
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
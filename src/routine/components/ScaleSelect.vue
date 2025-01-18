<script setup lang="ts">

import {CascadeSelect} from "primevue";
import {
  BaseNotes,
  CHROMATIC_SCALE_SET_NAME, MAJOR_PENTATONIC_SCALE_SET_NAME,
  MAJOR_SCALE_SET_NAME, MINOR_PENTATONIC_SCALE_SET_NAME, MINOR_SCALE_SET_NAME,
  SCALES
} from "../../notes/scales";
import {exists} from "../../utilities";
import {computed} from "vue";

export interface ScaleOption {
  name: string,
  setName: string,
  baseNote: string,
}

export interface ScaleSelectModel {
  setName: string,
  baseNote: string,
}

const model = defineModel<ScaleSelectModel>()

const props = withDefaults(defineProps<{
  disabled?: boolean,
}>(), {
  disabled: false,
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
      scaleSetName: string,
      nameFn: (k: string) => string
  ) {
    let scales = SCALES[scaleSetName];
    return {
      name: name,
      setName: scaleSetName,
      scales: Object.entries(scales).map(([k, v]) => ({
        name: nameFn(transformScaleName(k)),
        setName: scaleSetName,
        baseNote: BaseNotes[v.fundamental],
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

const internalValue = computed(() => {
  let set = scaleOptions.find((v) => v.setName === model.value.setName);
  if (!exists(set)) {
    return null;
  }
  return set.scales.find((v) => v.baseNote === model.value.baseNote);
})

function updateScale(value: ScaleOption) {
  if (exists(value)) {
    model.value = {
      setName: value.setName,
      baseNote: value.baseNote,
    }
    emit("scaleSelected", {
      setName: value.setName,
      baseNote: value.baseNote,
    });
  } else {
    let chromaticScale = SCALES[CHROMATIC_SCALE_SET_NAME][BaseNotes[BaseNotes.C]]
    model.value = {
      setName: CHROMATIC_SCALE_SET_NAME,
      baseNote: BaseNotes[chromaticScale.fundamental],
    }
    emit("scaleSelected", {
      setName: CHROMATIC_SCALE_SET_NAME,
      baseNote: BaseNotes[chromaticScale.fundamental],
    });
  }
}
</script>

<template>
  <CascadeSelect
    class="scale-select"
    :disabled="props.disabled"
    :model-value="internalValue"
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
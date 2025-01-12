<script setup lang="ts">

import BasicSynthPatcher from "../../instruments/basic_synth/basic_synth.export.json"
import {Parameter, ParameterType as RNBOParameterType} from "@rnbo/js";
import {Select, Knob} from "primevue"
import {ref} from "vue";
import {useInstrumentStore} from "../store/instruments";

const instrumentStore = useInstrumentStore()

await instrumentStore.loadDevice(BasicSynthPatcher);

const paramValues = ref<{ [key: string]: any }>({})

for (let parameter of instrumentStore.currentDevice.parameters) {
  paramValues.value[parameter.id] = parameter.initialValue;
}

function makeEnumOptions(parameter: Parameter) {
  return parameter.enumValues.entries().map(([index, name]) => ({
    index,
    name
  })).toArray();
}

function updateDevice(parameter: Parameter, value: any) {
  parameter.value = value;
}

</script>

<template>
  <div v-for="parameter in instrumentStore.currentDevice.parameters">
    <div v-if="parameter.type === RNBOParameterType.Enum">
      <Select v-model="paramValues[parameter.id]"
              @update:model-value="(value) => updateDevice(parameter, value)"
              :options="makeEnumOptions(parameter)"
              optionLabel="name"
              optionValue="index"
      />
    </div>
    <div v-else-if="parameter.type == RNBOParameterType.Number">
      number
    </div>
    <div v-else>
      <span> Unknown parameter type {{ parameter.type }} for {{ parameter.name }}</span>
    </div>
  </div>
</template>

<style scoped>

</style>
<script setup lang="ts">

import BasicSynthPatcher from "../../instruments/basic_synth/basic_synth.export.json"
import {Parameter, ParameterType as RNBOParameterType} from "@rnbo/js";
import {Select, Knob, Fieldset} from "primevue"
import {useInstrumentStore} from "../store/instruments";
import {exists} from "../utilities";

const instrumentStore = useInstrumentStore()

await instrumentStore.loadDevice(BasicSynthPatcher);

function makeEnumOptions(parameter: Parameter) {
  return parameter.enumValues.entries().map(([index, name]) => ({
    index,
    name
  })).toArray();
}

function updateDevice(parameter: Parameter, value: any) {
  parameter.value = value;
}

const sections = [
  {
    title: "Oscillator",
    parameters: [
      "poly/oscillator/mode",
      "poly/envelope/attack",
      "poly/envelope/decay",
      "poly/envelope/sustain",
      "poly/envelope/release"
    ]
  },
  {
    title: "Filter",
    parameters: ["filterType", "filterCutoff", "filterQ"]
  },
  {
    title: "Reverb",
    parameters: ["reverbMix", "reverbTime"]
  },
]

function getDeviceParameters(ids: string[]): Parameter[] {
  let parameters: Parameter[] = [];
  for (let id of ids) {
    let found = instrumentStore.currentDevice.parameters.find((p) => p.id === id);
    if (exists(found)) {
      parameters.push(found);
    }
  }

  return parameters;
}

function clampToTwoDecimals(value: number): string {
  let v = Math.round(value * 100);

  return (v / 100).toString();
}

function passThrough(value: number) {
  return value.toString()
}

const options = {
  "poly/envelope/attack": {
    "step": 1,
    "template": passThrough
  },
  "poly/envelope/decay": {
    "step": 1,
    "template": passThrough
  },
  "poly/envelope/sustain": {
    "step": .01,
    "template": clampToTwoDecimals
  },
  "poly/envelope/release": {
    "step": 1,
    "template": passThrough
  },
  "filterCutoff": {
    "step": 1,
    "template": passThrough
  },
  "filterQ": {
    "step": .01,
    "template": clampToTwoDecimals
  },
  "reverbMix": {
    "step": .01,
    "template": clampToTwoDecimals
  },
  "reverbTime": {
    "step": .1,
    "template": clampToTwoDecimals
  },
}

</script>

<template>
  <Fieldset v-for="section in sections"
            :legend="section.title">
    <div class="rnbo-parameter-group">
      <div v-for="parameter in getDeviceParameters(section.parameters)"
           class="rnbo-parameter-wrapper">
        <div v-if="parameter.type === RNBOParameterType.Enum"
             class="rnbo-enum-parameter"
        >
          <span>{{ parameter.displayName }}</span>
          <Select v-model="instrumentStore.paramValues[parameter.id]"
                  @update:model-value="(value) => updateDevice(parameter, value)"
                  :options="makeEnumOptions(parameter)"
                  optionLabel="name"
                  optionValue="index"
          />
        </div>
        <div v-else-if="parameter.type == RNBOParameterType.Number"
             class="rnbo-number-parameter"
        >
          <Knob v-model="instrumentStore.paramValues[parameter.id]"
                @update:model-value="(value) => updateDevice(parameter, value)"
                :min="parameter.min"
                :max="parameter.max"
                :step="options[parameter.id].step"
                :value-template="options[parameter.id].template"
                :size="75"
          />
          <span>{{ parameter.displayName }}</span>
        </div>
        <div v-else>
          <span> Unknown parameter type {{ parameter.type }} for {{ parameter.name }}</span>
        </div>
      </div>
    </div>
  </Fieldset>
</template>

<style scoped>
.rnbo-parameter-group {
  display: flex;
  align-items: center;
}

.rnbo-parameter-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.rnbo-enum-parameter {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}

.rnbo-enum-parameter > span {
  margin-bottom: 1rem;
}

.rnbo-number-parameter {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
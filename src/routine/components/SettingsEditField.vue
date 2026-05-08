<script setup lang="ts">
import {exists} from "../../utilities";
import {Button} from "primevue";

const props = withDefaults(defineProps<{
  /** When empty, no label row is shown (e.g. section heading already describes the field). */
  label?: string,
  component: object,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  componentProps?: any,
  canSet?: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue?: any,
}>(), {
  label: "",
  componentProps: {},
  canSet: true,
  setValue: null,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const model = defineModel<any>();

function handleSet() {
  model.value = props.setValue;
}

function setNull() {
  model.value = null;
}
</script>

<template>
  <div
    class="settings-edit-field"
    :class="{'settings-edit-field--no-label': !props.label}"
  >
    <span v-if="props.label">{{ props.label }}:</span>
    <component
      :is="props.component"
      v-if="exists(model)"
      v-model="model"
      v-bind="props.componentProps"
    />
    <Button
      v-if="exists(model) && props.canSet"
      class="set-null-button"
      rounded
      @click="setNull"
    >
      Unset
    </Button>
    <Button
      v-if="!exists(model) && props.canSet"
      rounded
      @click="handleSet"
    >
      Set
    </Button>
  </div>
</template>

<style scoped>
.settings-edit-field {
  display: flex;
  align-items: center;
}

.settings-edit-field--no-label {
  align-items: stretch;
}

.settings-edit-field > span {
  margin-right: 1rem;
}

.settings-edit-field > .set-null-button {
  margin-left: 1rem;
}
</style>
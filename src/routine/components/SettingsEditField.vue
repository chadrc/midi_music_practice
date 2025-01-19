<script setup lang="ts">
import {exists} from "../../utilities";
import {Button} from "primevue";

const props = withDefaults(defineProps<{
  label: string,
  component: object,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  componentProps?: any,
  canSet?: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue?: any,
}>(), {
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
  <div class="settings-edit-field">
    <span>{{ props.label }}:</span>
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

.settings-edit-field > span {
  margin-right: 1rem;
}

.settings-edit-field > .set-null-button {
  margin-left: 1rem;
}
</style>
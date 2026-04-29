<script setup lang="ts">
import {computed} from "vue";
import {PracticeType, type UserRoutinePractice} from "../types";
import PracticeTypeSelect from "./PracticeTypeSelect.vue";
import PracticeItemsEditor from "./PracticeItemsEditor.vue";
import {defaultPracticeForType} from "..";

const model = defineModel<UserRoutinePractice | null>();

const practiceTypeChoice = computed({
    get: () => model.value?.type ?? PracticeType.Notes,
    set(t: PracticeType) {
        model.value = defaultPracticeForType(t);
    },
});
</script>

<template>
  <div
    v-if="model"
    class="routine-part-practice-editor"
  >
    <PracticeTypeSelect v-model="practiceTypeChoice" />
    <PracticeItemsEditor
      v-if="model.type === PracticeType.Chords"
      kind="chords"
      v-model="model.items"
    />
    <PracticeItemsEditor
      v-else-if="model.type === PracticeType.Scales"
      kind="scales"
      v-model="model.items"
    />
  </div>
</template>

<style scoped>
.routine-part-practice-editor {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>

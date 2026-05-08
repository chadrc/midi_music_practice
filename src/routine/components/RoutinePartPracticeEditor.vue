<script setup lang="ts">
import {computed} from "vue";
import {PracticeType, type UserRoutinePractice} from "../types";
import PracticeTypeSelect from "./PracticeTypeSelect.vue";
import PracticeItemsEditor from "./PracticeItemsEditor.vue";
import {defaultPracticeForType} from "..";

const model = defineModel<UserRoutinePractice>({required: true});

function coercePracticeType(t: PracticeType | string): PracticeType {
    if (typeof t === "string") {
        return Number.parseInt(t, 10) as PracticeType;
    }
    return t;
}

const practiceTypeChoice = computed({
    get: () => model.value.type,
    set(t: PracticeType | string) {
        model.value = defaultPracticeForType(coercePracticeType(t));
    },
});
</script>

<template>
  <div class="routine-part-practice-editor">
    <div class="practice-type-row">
      <PracticeTypeSelect v-model="practiceTypeChoice" />
    </div>
    <PracticeItemsEditor
      v-if="model.type === PracticeType.Chords"
      v-model="model"
      kind="chords"
    />
    <PracticeItemsEditor
      v-else-if="model.type === PracticeType.Scales"
      v-model="model"
      kind="scales"
    />
  </div>
</template>

<style scoped>
.routine-part-practice-editor {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.practice-type-row {
  width: 100%;
}
</style>

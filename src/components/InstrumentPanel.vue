<script setup lang="ts">
import {Select, Slider, Tab, TabList, TabPanel, TabPanels, Tabs, ToggleButton} from "primevue";
import PracticeTypeSelect from "../routine/components/PracticeTypeSelect.vue";
import PracticeItemsEditor from "../routine/components/PracticeItemsEditor.vue";
import RNBOPatch from "./RNBOPatch.vue";
import NoteGrid from "./NoteGrid.vue";
import {useSettingsStore} from "../store/settings";
import {NoteRangeType, PracticeType} from "../routine/types";
import {maxForNoteRangeType, setNoteRangeType, noteScaleFromPractice, defaultPracticeForType} from "../routine";
import {computed} from "vue";
import {usePracticeStore} from "../store/practice";
import {exists} from "../utilities";
import {generateNotesForRange} from "../routine";

const settingsStore = useSettingsStore();
const practiceStore = usePracticeStore();

const editingDisabled = computed(() => settingsStore.editingDisabled);
const currentSettings = computed(() => settingsStore.currentSettings);

function makeNoteRangeOptions() {
  return [
    {
      name: "Notes",
      value: NoteRangeType.Notes
    },
    {
      name: "Frets",
      value: NoteRangeType.Frets
    },
    {
      name: "Octaves",
      value: NoteRangeType.Octaves
    }
  ]
}

const currentNotes = computed(() =>
    generateNotesForRange(settingsStore.currentSettings)
);

const currentPromptHints = computed(() => {
  const prompt = practiceStore.activePrompts[practiceStore.currentPrompt];
  if (exists(prompt)) {
    return prompt.prompt.notes;
  }

  return [];
})

const noteRangeValues = computed(() => {
  const r = currentSettings.value.noteRange.range;
  return [r.start, r.end];
})

const noteRangeMax = computed(() => maxForNoteRangeType(currentSettings.value.noteRange.type))

const gridStyle = computed(() => {
  switch (currentSettings.value.noteRange.type) {
    case NoteRangeType.Notes:
      return "box"
    case NoteRangeType.Frets:
      return "circle"
    case NoteRangeType.Octaves:
      return "bar"
    default:
      return "box";
  }
})

const gridColumns = computed(() => {
  switch (currentSettings.value.noteRange.type) {
    case NoteRangeType.Notes:
      return 12
    case NoteRangeType.Frets: {
      const {start, end} = currentSettings.value.noteRange.range;
      return end - start + 1
    }
    case NoteRangeType.Octaves:
      return settingsStore.selectedNotes.length
    default:
      return 1;
  }
})

const gridHeaders = computed(() => {
  switch (currentSettings.value.noteRange.type) {
    case NoteRangeType.Notes:
      return []
    case NoteRangeType.Frets: {
      const {start, end} = currentSettings.value.noteRange.range;
      const headers = []
      for (let i = start; i <= end; ++i) {
        headers.push(i.toString())
      }

      return headers
    }
    case NoteRangeType.Octaves:
      return []
    default:
      return [];
  }
})

const gridNoteFormat = computed(() => {
  switch (currentSettings.value.noteRange.type) {
    case NoteRangeType.Notes:
      return "letter-octave"
    case NoteRangeType.Frets:
      return "letter-octave"
    case NoteRangeType.Octaves:
      return "letter"
    default:
      return "letter";
  }
})

const selectedScale = computed(() =>
    noteScaleFromPractice(currentSettings.value.practice),
);

const showPracticeItems = computed(() => {
  const t = currentSettings.value.practice.type;
  return t === PracticeType.Chords || t === PracticeType.Scales;
});

function onPracticeTypeChange(t: PracticeType) {
  if (currentSettings.value.practice.type === t) {
    return;
  }
  currentSettings.value.practice = defaultPracticeForType(t);
}

function updateNoteRange(range: number[]) {
  const r = currentSettings.value.noteRange.range;
  r.start = range[0];
  r.end = range[1];
}
</script>

<template>
  <Tabs value="instrument">
    <TabList class="centered">
      <Tab value="instrument">
        Instrument
      </Tab>
      <Tab value="patch">
        Patch
      </Tab>
      <Tab value="options">
        Options
      </Tab>
    </TabList>
    <TabPanels>
      <TabPanel
        value="instrument"
        class="instrument-panel"
      >
        <div class="instrument-options">
          <div class="instrument-option">
            <PracticeTypeSelect
              :model-value="currentSettings.practice.type"
              :disabled="editingDisabled"
              @update:model-value="onPracticeTypeChange"
            />
          </div>
          <div class="instrument-option">
            <ToggleButton
              v-model="settingsStore.practice.matchPracticeRoutine"
              on-label="Matching"
              off-label="Not Matching"
            />
          </div>
          <div
            v-if="showPracticeItems"
            class="instrument-option practice-items-panel"
          >
            <PracticeItemsEditor
              v-if="currentSettings.practice.type === PracticeType.Chords"
              kind="chords"
              v-model="currentSettings.practice.items"
            />
            <PracticeItemsEditor
              v-else-if="currentSettings.practice.type === PracticeType.Scales"
              kind="scales"
              v-model="currentSettings.practice.items"
            />
          </div>
          <div class="instrument-option">
            <ToggleButton
              v-model="currentSettings.requireOctave"
              on-label="Octave On"
              off-label="Octave Off"
              :disabled="editingDisabled"
            />
          </div>
          <div class="instrument-option">
            <Select
              :model-value="currentSettings.noteRange.type"
              :options="makeNoteRangeOptions()"
              option-value="value"
              option-label="name"
              :disabled="editingDisabled"
              @update:model-value="(t: NoteRangeType) => setNoteRangeType(currentSettings.noteRange, t)"
            />
          </div>
          <div class="instrument-option">
            <div class="note-range-slider-wrapper">
              <span>{{ noteRangeValues[0] }}</span>
              <Slider
                :model-value="noteRangeValues"
                :max="noteRangeMax"
                range
                class="note-range-slider"
                :disabled="editingDisabled"
                @value-change="updateNoteRange"
              />
              <span>{{ noteRangeValues[1] }}</span>
            </div>
          </div>
        </div>
        <div class="instrument-display">
          <NoteGrid
            :notes="currentNotes"
            :scale="selectedScale"
            :note-style="gridStyle"
            :headers="gridHeaders"
            :columns="gridColumns"
            :note-format="gridNoteFormat"
            :hints="currentPromptHints"
          />
        </div>
      </TabPanel>
      <TabPanel value="patch">
        <Suspense>
          <RNBOPatch />
          <template #fallback>
            Loading Instrument...
          </template>
        </Suspense>
      </TabPanel>
      <TabPanel value="options">
        <div class="option-control">
          <span>Min Velocity for Success</span>
          <Slider
            v-model="currentSettings.minSuccessVelocity"
            class="min-success-slider"
            :max="127"
          />
          <span>{{ currentSettings.minSuccessVelocity }}</span>
        </div>
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<style>
.p-tablist.centered .p-tablist-tab-list {
  justify-content: center;
  align-items: center;
}

.instrument-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>

<style scoped>
.p-tabs {
  height: 100%;
}

.instrument-display {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: scroll;
}

.instrument-display::-webkit-scrollbar {
  display: none;
}

.instrument-options {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.instrument-option {
  margin-right: 0.5rem;
}

.note-range-slider {
  width: 10rem;
  margin-left: 1rem;
  margin-right: 1rem;
}

.note-range-slider-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 1rem;
  margin-right: 1rem;
}

.chord-ratio-slider-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.option-control {
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.min-success-slider {
  width: 10rem;
  margin-left: 1rem;
  margin-right: 1rem;
}
</style>
<script setup lang="ts">
import {Select, Slider, Tab, TabList, TabPanel, TabPanels, Tabs, ToggleButton} from "primevue";
import PracticeTypeSelect from "../routine/components/PracticeTypeSelect.vue";
import PracticeItemsEditor from "../routine/components/PracticeItemsEditor.vue";
import RNBOPatch from "./RNBOPatch.vue";
import NoteGrid from "./NoteGrid.vue";
import {useSettingsStore} from "../store/settings";
import {NoteRangeType, PracticeType, isFreePlaySetPrompt} from "../routine/types";
import {
  maxForNoteRangeType,
  setNoteRangeType,
  practiceScaleMembership,
  defaultPracticeForType,
  noteGridLayoutFromNoteRange,
} from "../routine";
import {computed} from "vue";
import {usePracticeStore} from "../store/practice";
import {exists} from "../utilities";

const settingsStore = useSettingsStore();
const practiceStore = usePracticeStore();

const editingDisabled = computed(() => settingsStore.editingDisabled);
const currentSettings = computed(() => settingsStore.currentSettings);

/** Grid span matches part note/fret range (all practice types). */
const activeNoteRange = computed(() => currentSettings.value.noteRange);

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

const gridLayout = computed(() => noteGridLayoutFromNoteRange(activeNoteRange.value));

const currentNotes = computed(() => gridLayout.value.notes);

const currentPromptHints = computed(() => {
  const pd = practiceStore.activePrompts[practiceStore.currentPrompt];
  if (!exists(pd)) {
    return [];
  }
  if (isFreePlaySetPrompt(pd.prompt)) {
    return [];
  }
  const midis = pd.prompt.notes;
  if (!midis.length) {
    return [];
  }
  if (settingsStore.currentSettings.requireOctave) {
    return midis;
  }
  const pcSet = new Set(midis.map((n) => ((n % 12) + 12) % 12));
  return currentNotes.value.filter((n) => pcSet.has(((n % 12) + 12) % 12));
});

/** Chord voicing / scale degrees for the active prompt (white outline on the grid). */
const currentEnsembleHints = computed(() => {
  if (!practiceStore.practicing) {
    return [];
  }
  const pd = practiceStore.activePrompts[practiceStore.currentPrompt];
  if (!exists(pd)) {
    return [];
  }
  const p = pd.prompt;
  const pcs = p.ensemblePitchClasses;
  const midis = p.ensembleMidi ?? [];
  if (!pcs?.length) {
    return midis;
  }
  if (settingsStore.currentSettings.requireOctave) {
    return midis;
  }
  const pcSet = new Set(pcs);
  return currentNotes.value.filter((n) => pcSet.has(((n % 12) + 12) % 12));
});

const noteRangeValues = computed(() => {
  const r = activeNoteRange.value.range;
  return [r.start, r.end];
})

const noteRangeMax = computed(() => maxForNoteRangeType(activeNoteRange.value.type))

const gridStyle = computed(() => gridLayout.value.noteStyle);

const gridColumns = computed(() => gridLayout.value.columns);

const gridHeaders = computed(() => gridLayout.value.headers);

const gridNoteFormat = computed(() => gridLayout.value.noteFormat);

const selectedScale = computed(() =>
    practiceScaleMembership(currentSettings.value.practice),
);

const staffKeySignatureForNotation = computed({
  get() {
    return settingsStore.practiceUi.staffAccidentals === "keySignature";
  },
  set(v: boolean) {
    settingsStore.practiceUi.staffAccidentals = v ? "keySignature" : "eachNote";
  },
});

const showPracticeItems = computed(() => {
  const t = currentSettings.value.practice.type;
  return t === PracticeType.Chords || t === PracticeType.Scales;
});

function coercePracticeType(t: PracticeType | string): PracticeType {
    if (typeof t === "string") {
        return Number.parseInt(t, 10) as PracticeType;
    }
    return t;
}

function onPracticeTypeChange(t: PracticeType | string) {
    const type = coercePracticeType(t);
    if (currentSettings.value.practice.type === type) {
        return;
    }
    currentSettings.value.practice = defaultPracticeForType(type);
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
              v-model="currentSettings.practice"
              kind="chords"
            />
            <PracticeItemsEditor
              v-else-if="currentSettings.practice.type === PracticeType.Scales"
              v-model="currentSettings.practice"
              kind="scales"
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
        <div
          class="instrument-display"
          :class="{'instrument-display--stretch': gridStyle === 'bar'}"
        >
          <NoteGrid
            :notes="currentNotes"
            :scale="selectedScale"
            :note-style="gridStyle"
            :headers="gridHeaders"
            :columns="gridColumns"
            :note-format="gridNoteFormat"
            :hints="currentPromptHints"
            :ensemble-hints="currentEnsembleHints"
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
        <div class="options-tab-stack">
          <div class="option-control">
            <span>Min Velocity for Success</span>
            <Slider
              v-model="currentSettings.minSuccessVelocity"
              class="min-success-slider"
              :max="127"
            />
            <span>{{ currentSettings.minSuccessVelocity }}</span>
          </div>
          <div class="option-control staff-accidentals-row">
            <span>Staff accidentals</span>
            <ToggleButton
              v-model="staffKeySignatureForNotation"
              on-label="Key signature"
              off-label="Next to notes"
            />
          </div>
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
  min-height: 0;
}

.instrument-display--stretch {
  align-items: stretch;
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

.options-tab-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.staff-accidentals-row .p-togglebutton {
  margin-left: 1rem;
}

.min-success-slider {
  width: 10rem;
  margin-left: 1rem;
  margin-right: 1rem;
}
</style>
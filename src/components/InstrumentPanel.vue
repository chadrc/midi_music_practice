<script setup lang="ts">
import {Select, Slider, Tab, TabList, TabPanel, TabPanels, Tabs, ToggleButton} from "primevue";
import ScaleSelect from "../routine/components/ScaleSelect.vue";
import RNBOPatch from "./RNBOPatch.vue";
import NoteGrid from "./NoteGrid.vue";
import {usePracticeStore} from "../store/practice";
import {useSettingsStore} from "../store/settings";
import {NoteRangeType} from "../routine/types";
import {computed} from "vue";
import {SCALES} from "../notes/scales";

const practiceStore = usePracticeStore()
const settingsStore = useSettingsStore()

const editingDisabled = computed(() => practiceStore.practicing)
const currentSettings = computed(() => settingsStore.userRoutine);

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

const noteRangeValues = computed(() => {
  const settings = currentSettings.value;
  switch (currentSettings.value.noteRangeType) {
    case NoteRangeType.Notes:
      return [settings.noteRange.start, settings.noteRange.end];
    case NoteRangeType.Frets:
      return [settings.fretRange.start, settings.fretRange.end];
    case NoteRangeType.Octaves:
      return [settings.octaveRange.start, settings.octaveRange.end];
    default:
      return [0, 0];
  }
})

const noteRangeMax = computed(() => {
  switch (currentSettings.value.noteRangeType) {
    case NoteRangeType.Notes:
      return 127;
    case NoteRangeType.Frets:
      return 22;
    case NoteRangeType.Octaves:
      return 12;
    default:
      return 0;
  }
})

const gridStyle = computed(() => {
  switch (currentSettings.value.noteRangeType) {
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
  switch (currentSettings.value.noteRangeType) {
    case NoteRangeType.Notes:
      return 12
    case NoteRangeType.Frets: {
      const {start, end} = currentSettings.value.fretRange;
      return end - start + 1
    }
    case NoteRangeType.Octaves:
      return settingsStore.selectedNotes.length
    default:
      return 0;
  }
})

const gridHeaders = computed(() => {
  switch (currentSettings.value.noteRangeType) {
    case NoteRangeType.Notes:
      return []
    case NoteRangeType.Frets: {
      const {start, end} = currentSettings.value.fretRange;
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
  switch (currentSettings.value.noteRangeType) {
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

const selectedScale = computed(() => {
  let {setName, baseNote} = currentSettings.value.scale;
  return SCALES[setName][baseNote];
})

function updateNoteRange(range: number[]) {
  let s = currentSettings.value;
  switch (s.noteRangeType) {
    case NoteRangeType.Notes:
      s.noteRange.start = range[0]
      s.noteRange.end = range[1]
      break;
    case NoteRangeType.Frets:
      s.fretRange.start = range[0]
      s.fretRange.end = range[1]
      break;
    case NoteRangeType.Octaves:
      s.octaveRange.start = range[0]
      s.octaveRange.end = range[1]
      break;
  }
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
            <div class="chord-ratio-slider-wrapper">
              <span>Chords Per Set: {{ currentSettings.chordRatio }}</span>
              <Slider
                v-model="currentSettings.chordRatio"
                :max="settingsStore.chordRatioMax"
                class="note-range-slider"
                :disabled="editingDisabled"
              />
            </div>
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
            <ScaleSelect
              v-model="currentSettings.scale"
              :disabled="editingDisabled"
            />
          </div>
          <div class="instrument-option">
            <Select
              v-model="currentSettings.noteRangeType"
              :options="makeNoteRangeOptions()"
              option-value="value"
              option-label="name"
              :disabled="editingDisabled"
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
            :notes="settingsStore.selectedNotes"
            :scale="selectedScale"
            :note-style="gridStyle"
            :headers="gridHeaders"
            :columns="gridColumns"
            :note-format="gridNoteFormat"
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
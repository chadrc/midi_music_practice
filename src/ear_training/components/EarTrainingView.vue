<script setup lang="ts">
import {Button, ToggleButton} from "primevue";
import {useInstrumentStore} from "../../store/instruments";
import {ref} from "vue";
import {NumberGenerator} from "../../common/NumberGenerator";
import NumberRange from "../../common/NumberRange";
import {formatMidiNote, LETTER_NOTES} from "../../notes";

const instrumentStore = useInstrumentStore()
const generator = new NumberGenerator()
const minNote = 24
const maxNote = 108
const numberOfOctaves = Math.floor((maxNote - minNote) / 12)

const currentNote = ref(0)
const selectedNote = ref(null)
const selectedOctave = ref(null)
const answered = ref(false)
const noteCorrect = ref(null)
const octaveCorrect = ref(null)
const octaveLock = ref(false)
const noteLock = ref(false)

function setNote() {
  let note = generator.rangeI(0, 12)
  if (noteLock.value) {
    note = selectedNote.value
  }

  let octave = generator.rangeI(2, 9)
  if (octaveLock.value) {
    octave = selectedOctave.value + 2
  }

  currentNote.value = octave * 12 + note
  console.log(note, octave, currentNote.value)
}

function playNote() {
  instrumentStore.playNote(currentNote.value, 100, 500);
}

function selectNote(note: number) {
  selectedNote.value = note;
}

function selectOctave(octave: number) {
  selectedOctave.value = octave;
}

function submit() {
  let octave = Math.floor((currentNote.value) / 12) - 1
  let note = (currentNote.value) % 12

  let octaveAnswer = (selectedOctave.value + 1)

  if (selectedNote.value === note) {
    noteCorrect.value = true
  }

  if (octaveAnswer === octave) {
    octaveCorrect.value = true
  }

  answered.value = true

  // console.log("Octave Answer: ", octave);
  // console.log("Octave Guess: ", octaveAnswer)
  // console.log("Note Guess: ", note)
  // console.log("Note Answer: ", currentNote.value)
}

function next() {
  answered.value = false
  noteCorrect.value = null
  octaveCorrect.value = null
  if (!noteLock.value) {
    selectedNote.value = null
  }

  if (!octaveLock.value) {
    selectedOctave.value = null
  }
  setNote()
}

function lockOctave(value: boolean) {
  if (value) {
    selectedOctave.value = generator.rangeI(0, 7)
  } else {
    selectedOctave.value = null
  }

  setNote()
}

function lockNote(value: boolean) {
  if (value) {
    selectedNote.value = generator.rangeI(0, 12)
  } else {
    selectedNote.value = null
  }

  setNote()
}

setNote()

</script>

<template>
  <section>
    <div
      class="prompt-card"
      @click="playNote"
    >
      <span
        class="prompt-text"
      >
        <span>{{ answered ? formatMidiNote(currentNote) : "?" }}</span>
      </span>
    </div>
  </section>
  <section>
    <ToggleButton
      v-model="octaveLock"
      on-label="Single Octave"
      off-label="Any Octave"
      @update:model-value="lockOctave"
    />
    <ToggleButton
      v-model="noteLock"
      on-label="Single Note"
      off-label="Any Note"
      @update:model-value="lockNote"
    />
  </section>
  <section class="options">
    <div class="option-row">
      <div
        v-for="n in new NumberRange(0, numberOfOctaves)"
        :key="n"
        class="option-cell"
        :class="{selected: selectedOctave === n, disabled: octaveLock}"
        @click="selectOctave(n)"
      >
        {{ n + 1 }}
      </div>
    </div>
    <div class="option-row">
      <div
        v-for="n in new NumberRange(0, 12)"
        :key="n"
        class="option-cell"
        :class="{selected: selectedNote === n, disabled: noteLock}"
        @click="selectNote(n)"
      >
        {{ LETTER_NOTES[n] }}
      </div>
    </div>
  </section>
  <section>
    <Button
      v-if="answered"
      label="Next"
      @click="next"
    />
    <Button
      v-else
      label="Submit"
      @click="submit"
    />
  </section>
  <section
    v-if="answered"
    class="answers"
  >
    <div>
      Octave {{ octaveCorrect ? "Correct" : "Wrong" }}
    </div>
    <div>
      Note {{ noteCorrect ? "Correct" : "Wrong" }}
    </div>
  </section>
</template>

<style scoped>

section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
}

.options, .answers {
  flex-direction: column;
}

.option-row {
  display: flex;
  flex-direction: row;
  margin-top: 1rem;
}

.option-cell {
  cursor: pointer;
  display: flex;
  width: var(--note-test-grid-cell-size);
  height: var(--note-test-grid-cell-size);
  justify-content: center;
  align-items: center;
  background-color: var(--p-neutral-800);;
  transition: opacity 0.2s;
}

.option-cell.disabled {
  opacity: .25;
}

.option-cell.selected {
  opacity: 1;
  background-color: var(--p-neutral-600);
}

.option-cell:hover {
  background-color: var(--p-neutral-400);
}

.prompt-card {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  aspect-ratio: 1;
  border-radius: 50%;
  font-size: 2rem;
  background-color: var(--p-neutral-800);
  cursor: pointer;
}

.prompt-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
}
</style>
<script setup lang="ts">
import {Button} from "primevue";
import {useInstrumentStore} from "../../store/instruments";
import {BaseNotes, CHROMATIC_SCALE_SET_NAME, SCALES} from "../../notes/scales";
import {computed, ref} from "vue";
import {NumberGenerator} from "../../common/NumberGenerator";
import NoteGrid from "../../components/NoteGrid.vue";
import NumberRange from "../../common/NumberRange";

const instrumentStore = useInstrumentStore()
const generator = new NumberGenerator()
const minNote = 24
const maxNote = 108
const scale = SCALES[CHROMATIC_SCALE_SET_NAME][BaseNotes.C]

const currentNote = ref(0)

const currentOctave = computed(() => Math.floor(currentNote.value / 12) - 2)
const octaveNotes = computed(() => {
  let start = currentOctave.value * 12
  let range = new NumberRange(start, start + 12)
  let notes = []
  for (let n of range) {
    notes.push(n);
  }

  return notes;
})

function setNote() {
  currentNote.value = generator.rangeI(minNote, maxNote)
}

function playNote() {
  instrumentStore.playNote(BaseNotes.C + 12 * 4, 100, 500);
}

setNote()

</script>

<template>
  <h1>Ear Training</h1>
  <Button
    label="Play"
    severity="info"
    size="small"
    @click="playNote"
  />
  <NoteGrid
    :notes="octaveNotes"
    :scale="scale"
    :headers="[]"
    :columns="12"
    note-format="letter"
    :hints="[]"
  />
</template>

<style scoped>

</style>
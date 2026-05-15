<script setup lang="ts">
import {onUnmounted, ref, watch} from "vue";

const props = defineProps<{
    /** Target beats per minute from practice / routine settings (one beat = one dot step). */
    bpm: number;
}>();

/** Current beat index within the 4-beat bar: 0 … 3. */
const currentBeat = ref(0);

let intervalId: ReturnType<typeof setInterval> | null = null;

function clearTicker(): void {
    if (intervalId != null) {
        window.clearInterval(intervalId);
        intervalId = null;
    }
}

watch(
    () => props.bpm,
    (bpm) => {
        clearTicker();
        currentBeat.value = 0;
        if (!Number.isFinite(bpm) || bpm < 1) {
            return;
        }
        const ms = 60000 / bpm;
        intervalId = window.setInterval(() => {
            currentBeat.value = (currentBeat.value + 1) % 4;
        }, ms);
    },
    {immediate: true},
);

onUnmounted(() => {
    clearTicker();
});
</script>

<template>
  <div
    class="practice-metronome-bar"
    aria-hidden="true"
  >
    <div
      class="practice-metronome-dots"
      role="presentation"
    >
      <span
        v-for="beat in 4"
        :key="beat"
        class="practice-metronome-dot"
        :class="{
          'practice-metronome-dot--large': beat === 4,
          'practice-metronome-dot--pulse': currentBeat === beat - 1,
        }"
      />
    </div>
  </div>
</template>

<style scoped>
.practice-metronome-bar {
  width: 100%;
  flex-shrink: 0;
  padding: 0.55rem 1rem 0.65rem;
  box-sizing: border-box;
  border-top: 1px solid var(--p-content-border-color, rgba(255, 255, 255, 0.1));
  background: var(--p-content-background, transparent);
}

.practice-metronome-dots {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
  gap: 0.85rem;
}

.practice-metronome-dot {
  flex-shrink: 0;
  border-radius: 50%;
  width: 7px;
  height: 7px;
  background: var(--p-text-muted-color, rgba(255, 255, 255, 0.45));
  opacity: 0.45;
  transition:
    opacity 0.07s ease,
    transform 0.07s ease,
    background 0.07s ease,
    box-shadow 0.07s ease;
}

.practice-metronome-dot--large {
  width: 12px;
  height: 12px;
}

.practice-metronome-dot--pulse {
  opacity: 1;
  background: var(--p-primary-color, #3b82f6);
  transform: scale(1.15);
}
</style>

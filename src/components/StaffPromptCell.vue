<script setup lang="ts">
import {Factory, Formatter} from "vexflow";
import type {EasyScore, Voice} from "vexflow";
import {onMounted, onUnmounted, ref, useId, watch} from "vue";
import {
  buildChordEasyScoreLine,
  mapPromptNotesToStaffMidis,
  splitGrandStaffMidis,
} from "../notation/staffFromMidi";
import {minStaveWidthPx, STAFF_NOTATION_METER} from "../notation/staffLayout";

const props = defineProps<{
  noteMidis: number[];
  requireOctave: boolean;
}>();

const hostRef = ref<HTMLElement | null>(null);
const domId = useId().replace(/[^a-zA-Z0-9_-]/g, "-");

let resizeObserver: ResizeObserver | null = null;

function trebleQuarterRests(score: EasyScore, count: number) {
  const t = [];
  for (let i = 0; i < count; i++) {
    t.push(...score.notes("B4/q/r"));
  }
  return t;
}

function bassQuarterRests(score: EasyScore, count: number) {
  const t = [];
  for (let i = 0; i < count; i++) {
    t.push(...score.notes("D3/q/r", {clef: "bass"}));
  }
  return t;
}

/** One 4/4 measure: target on its beat(s) as beat 1, remaining beats quarter rests. */
function buildVoicesForStaffCell(
  score: EasyScore,
  grand: boolean,
  mapped: number[],
): Voice[] {
  score.set({time: STAFF_NOTATION_METER});
  if (!grand) {
    const line = buildChordEasyScoreLine(mapped);
    const tickables = [...score.notes(line), ...trebleQuarterRests(score, 3)];
    return [score.voice(tickables, {time: STAFF_NOTATION_METER})];
  }

  const {treble, bass} = splitGrandStaffMidis(mapped);
  const hasT = treble.length > 0;
  const hasB = bass.length > 0;

  const trebleTick = hasT
    ? [...score.notes(buildChordEasyScoreLine(treble)), ...trebleQuarterRests(score, 3)]
    : trebleQuarterRests(score, 4);
  const bassTick = hasB
    ? [...score.notes(buildChordEasyScoreLine(bass), {clef: "bass"}), ...bassQuarterRests(score, 3)]
    : bassQuarterRests(score, 4);

  return [
    score.voice(trebleTick, {time: STAFF_NOTATION_METER}),
    score.voice(bassTick, {time: STAFF_NOTATION_METER}),
  ];
}

function measureStaveWidthPx(score: EasyScore, voices: Voice[]): number {
  const formatter = new Formatter();
  formatter.joinVoices(voices);
  const minTickWidth = formatter.preCalculateMinTotalWidth(voices);
  return minStaveWidthPx(minTickWidth);
}

function measureStaveWidthInProbe(grand: boolean, mapped: number[]): number {
  const probe = document.createElement("div");
  probe.id = `${domId}-measure-${Date.now().toString(36)}`;
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText =
    "position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none";
  document.body.appendChild(probe);
  try {
    const probeFactory = new Factory({
      renderer: {elementId: probe.id, width: 800, height: 400},
    });
    const measureScore = probeFactory.EasyScore();
    const voices = buildVoicesForStaffCell(measureScore, grand, mapped);
    return measureStaveWidthPx(measureScore, voices);
  } finally {
    document.body.removeChild(probe);
  }
}

function draw() {
  const el = hostRef.value;
  if (!el) {
    return;
  }
  el.innerHTML = "";
  if (!el.id) {
    el.id = domId;
  }

  const mapped = mapPromptNotesToStaffMidis(props.noteMidis, props.requireOctave);
  if (mapped.length === 0) {
    return;
  }

  const containerWidth = Math.max(140, Math.floor(el.getBoundingClientRect().width) || 180);
  const grand = props.requireOctave;
  const height = grand ? 170 : 95;

  const staveWidthPx = measureStaveWidthInProbe(grand, mapped);

  const systemX = 8;
  const rendererWidth = Math.max(containerWidth, systemX + staveWidthPx + 12);

  const vf = new Factory({
    renderer: {elementId: el.id, width: rendererWidth, height},
  });
  const score = vf.EasyScore();
  const voices = buildVoicesForStaffCell(score, grand, mapped);

  const system = vf.System({
    spaceBetweenStaves: 9,
    x: systemX,
    y: 8,
    width: staveWidthPx,
    autoWidth: false,
    noJustification: false,
  });

  if (!grand) {
    system
      .addStave({voices: [voices[0]!]})
      .addClef("treble")
      .addTimeSignature(STAFF_NOTATION_METER);
  } else {
    system
      .addStave({voices: [voices[0]!]})
      .addClef("treble")
      .addTimeSignature(STAFF_NOTATION_METER);
    system.addStave({voices: [voices[1]!]}).addClef("bass");
    system.addConnector("brace");
    system.addConnector("singleRight");
  }

  vf.draw();

  const svg = el.querySelector("svg");
  if (svg) {
    try {
      const bb = svg.getBBox();
      if (bb.width > 0 && bb.height > 0) {
        const pad = 10;
        svg.setAttribute(
          "viewBox",
          `${bb.x - pad} ${bb.y - pad} ${bb.width + pad * 2} ${bb.height + pad * 2}`,
        );
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        svg.removeAttribute("width");
        svg.removeAttribute("height");
        svg.style.width = "100%";
        svg.style.height = "auto";
        svg.style.maxHeight = "100%";
      }
    } catch {
      /* SVGLocatable getBBox can fail before first paint in some environments */
    }
  }
}

onMounted(() => {
  draw();
  const el = hostRef.value;
  if (el && typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => draw());
    resizeObserver.observe(el);
  }
});

onUnmounted(() => resizeObserver?.disconnect());

watch(
  () => `${props.requireOctave}:${props.noteMidis.join(",")}`,
  draw,
);
</script>

<template>
  <div class="staff-prompt-shell">
    <div
      ref="hostRef"
      class="staff-prompt-mount"
    />
  </div>
</template>

<style scoped>
.staff-prompt-shell {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
}

.staff-prompt-mount {
  width: 80%;
  max-width: 80%;
  height: 80%;
  max-height: 80%;
  min-width: 96px;
  min-height: 72px;
  background: #ffffff;
  border-radius: 0.5rem;
  padding: 0.35rem 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
}
</style>

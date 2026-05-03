<script setup lang="ts">
import {Factory, Formatter} from "vexflow";
import type {EasyScore, Voice} from "vexflow";
import {onMounted, onUnmounted, ref, useId, watch} from "vue";
import {
  buildChordEasyScoreLine,
  mapPromptNotesToStaffMidis,
  splitGrandStaffMidis,
  type StaffChordSpellingMode,
} from "../notation/staffFromMidi";
import {normalizeVexKey} from "../notation/staffKeySpelling";
import {minStaveWidthPx, STAFF_NOTATION_METER} from "../notation/staffLayout";
import type {StaffAccidentalsMode} from "../store/settings";

const props = defineProps<{
  noteMidis: number[];
  requireOctave: boolean;
  staffAccidentals: StaffAccidentalsMode;
  vexKey: string;
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

function chordSpelling(): StaffChordSpellingMode {
  if (props.staffAccidentals === "keySignature") {
    return {mode: "keySignature", vexKey: props.vexKey};
  }
  return {mode: "eachNote"};
}

/** One 4/4 measure: target on its beat(s) as beat 1, remaining beats quarter rests. */
function buildVoicesForStaffCell(
  score: EasyScore,
  grand: boolean,
  mapped: number[],
  spelling: StaffChordSpellingMode,
): Voice[] {
  score.set({time: STAFF_NOTATION_METER});
  if (!grand) {
    const line = buildChordEasyScoreLine(mapped, spelling);
    const tickables = [...score.notes(line), ...trebleQuarterRests(score, 3)];
    return [score.voice(tickables, {time: STAFF_NOTATION_METER})];
  }

  const {treble, bass} = splitGrandStaffMidis(mapped);
  const hasT = treble.length > 0;
  const hasB = bass.length > 0;

  const trebleTick = hasT
    ? [...score.notes(buildChordEasyScoreLine(treble, spelling)), ...trebleQuarterRests(score, 3)]
    : trebleQuarterRests(score, 4);
  const bassTick = hasB
    ? [...score.notes(buildChordEasyScoreLine(bass, spelling), {clef: "bass"}), ...bassQuarterRests(score, 3)]
    : bassQuarterRests(score, 4);

  return [
    score.voice(trebleTick, {time: STAFF_NOTATION_METER}),
    score.voice(bassTick, {time: STAFF_NOTATION_METER}),
  ];
}

function measureStaveWidthPx(score: EasyScore, voices: Voice[], withKeySignature: boolean): number {
  const formatter = new Formatter();
  formatter.joinVoices(voices);
  const minTickWidth = formatter.preCalculateMinTotalWidth(voices);
  return minStaveWidthPx(minTickWidth, {withKeySignature});
}

function measureStaveWidthInProbe(grand: boolean, mapped: number[], spelling: StaffChordSpellingMode): number {
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
    const voices = buildVoicesForStaffCell(measureScore, grand, mapped, spelling);
    const withKs = spelling.mode === "keySignature";
    return measureStaveWidthPx(measureScore, voices, withKs);
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
  const spelling = chordSpelling();

  const staveWidthPx = measureStaveWidthInProbe(grand, mapped, spelling);

  const systemX = 8;
  const rendererWidth = Math.max(containerWidth, systemX + staveWidthPx + 12);

  const vf = new Factory({
    renderer: {elementId: el.id, width: rendererWidth, height},
  });
  const score = vf.EasyScore();
  const voices = buildVoicesForStaffCell(score, grand, mapped, spelling);

  const system = vf.System({
    spaceBetweenStaves: 9,
    x: systemX,
    y: 8,
    width: staveWidthPx,
    autoWidth: false,
    noJustification: false,
  });

  const useKs = props.staffAccidentals === "keySignature";
  const keySpec = normalizeVexKey(props.vexKey);

  if (!grand) {
    const st = system.addStave({voices: [voices[0]!]}).addClef("treble");
    if (useKs) {
      st.addKeySignature(keySpec);
    }
    st.addTimeSignature(STAFF_NOTATION_METER);
  } else {
    const trebleSt = system.addStave({voices: [voices[0]!]}).addClef("treble");
    if (useKs) {
      trebleSt.addKeySignature(keySpec);
    }
    trebleSt.addTimeSignature(STAFF_NOTATION_METER);
    const bassSt = system.addStave({voices: [voices[1]!]}).addClef("bass");
    if (useKs) {
      bassSt.addKeySignature(keySpec);
    }
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
        const padLeftExtra = useKs ? 48 : 0;
        svg.setAttribute(
          "viewBox",
          `${bb.x - pad - padLeftExtra} ${bb.y - pad} ${bb.width + pad * 2 + padLeftExtra} ${bb.height + pad * 2}`,
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
  () =>
    `${props.requireOctave}:${props.noteMidis.join(",")}:${props.staffAccidentals}:${props.vexKey}`,
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
  overflow: visible;
}

.staff-prompt-mount :deep(svg) {
  overflow: visible;
}
</style>

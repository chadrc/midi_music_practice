<script setup lang="ts">
import {EasyScore, Factory, Formatter, Stave} from "vexflow";
import {onMounted, onUnmounted, ref, useId, watch} from "vue";
import {
  buildChordEasyScoreLine,
  mapPromptNotesToStaffMidis,
  splitGrandStaffMidis,
} from "../notation/staffFromMidi";

/** Extra width so the five staff lines extend past the last note / stem (not SVG viewBox padding). */
const STAVE_RIGHT_OF_NOTES_PX = 28;
/**
 * Approximates (noteStartX - system.x): clef + padding before first tickable.
 * Tuned so minimal staves don’t clip the treble clef.
 */
const STAVE_LEFT_OF_NOTES_RESERVE_PX = 52;

const props = defineProps<{
  noteMidis: number[];
  requireOctave: boolean;
}>();

const hostRef = ref<HTMLElement | null>(null);
const domId = useId().replace(/[^a-zA-Z0-9_-]/g, "-");

let resizeObserver: ResizeObserver | null = null;

/**
 * Same basis as VexFlow {@link System.format} autoWidth branch:
 * `preCalculateMinTotalWidth + Stave.rightPadding + (startX - x)`, plus {@link STAVE_RIGHT_OF_NOTES_PX}.
 */
function measureStaveWidthPx(
  score: EasyScore,
  grand: boolean,
  trebleLine: string,
  bassLine: string,
): number {
  const formatter = new Formatter();
  const voices = grand
    ? [
        score.voice(score.notes(trebleLine)),
        score.voice(score.notes(bassLine, {clef: "bass"})),
      ]
    : [score.voice(score.notes(trebleLine))];
  formatter.joinVoices(voices);
  const minTickWidth = formatter.preCalculateMinTotalWidth(voices);
  return Math.ceil(
    minTickWidth +
      Stave.rightPadding +
      STAVE_LEFT_OF_NOTES_RESERVE_PX +
      STAVE_RIGHT_OF_NOTES_PX,
  );
}

/** Measure with a throwaway Factory so we never attach two renderers to the visible host. */
function measureStaveWidthInProbe(
  grand: boolean,
  trebleLine: string,
  bassLine: string,
): number {
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
    measureScore.set({time: "1/4"});
    return measureStaveWidthPx(measureScore, grand, trebleLine, grand ? bassLine : "");
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

  let trebleLine: string;
  let bassLine: string;
  if (!grand) {
    trebleLine = buildChordEasyScoreLine(mapped);
    bassLine = "";
  } else {
    const {treble, bass} = splitGrandStaffMidis(mapped);
    trebleLine = treble.length > 0 ? buildChordEasyScoreLine(treble) : "B4/q/r";
    bassLine = bass.length > 0 ? buildChordEasyScoreLine(bass) : "D3/q/r";
  }

  const staveWidthPx = measureStaveWidthInProbe(grand, trebleLine, bassLine);

  const systemX = 8;
  const rendererWidth = Math.max(containerWidth, systemX + staveWidthPx + 12);

  const vf = new Factory({
    renderer: {elementId: el.id, width: rendererWidth, height},
  });
  const score = vf.EasyScore();
  score.set({time: "1/4"});

  const system = vf.System({
    spaceBetweenStaves: 9,
    x: systemX,
    y: 8,
    width: staveWidthPx,
    autoWidth: false,
    noJustification: true,
  });

  if (!grand) {
    system.addStave({voices: [score.voice(score.notes(trebleLine))]}).addClef("treble");
  } else {
    system
      .addStave({voices: [score.voice(score.notes(trebleLine))]})
      .addClef("treble");
    system
      .addStave({voices: [score.voice(score.notes(bassLine, {clef: "bass"}))]})
      .addClef("bass");
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
        svg.style.maxHeight = grand ? "168px" : "92px";
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
  <div
    ref="hostRef"
    class="staff-prompt-host"
  />
</template>

<style scoped>
.staff-prompt-host {
  width: 100%;
  min-width: 120px;
  min-height: 88px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
}
</style>

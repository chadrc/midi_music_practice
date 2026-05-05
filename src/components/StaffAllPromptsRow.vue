<script setup lang="ts">
import {Factory, Formatter} from "vexflow";
import type {EasyScore, Note} from "vexflow";
import {onMounted, onUnmounted, ref, useId, watch} from "vue";
import type {PromptData} from "../store/practice";
import {
  buildChordEasyScoreLine,
  mapPromptNotesToStaffMidis,
  type StaffChordSpellingMode,
} from "../notation/staffFromMidi";
import {normalizeVexKey} from "../notation/staffKeySpelling";
import {minStaveWidthPx, STAFF_NOTATION_METER} from "../notation/staffLayout";
import type {StaffAccidentalsMode} from "../store/settings";

const props = defineProps<{
  prompts: PromptData[];
  requireOctave: boolean;
  staffAccidentals: StaffAccidentalsMode;
  vexKey: string;
  /** When true, each beat is a rest until completed; then shows the played pitch. */
  freePlay?: boolean;
}>();

const hostRef = ref<HTMLElement | null>(null);
const domId = useId().replace(/[^a-zA-Z0-9_-]/g, "-");

let resizeObserver: ResizeObserver | null = null;

function applyPromptStyle(prompt: PromptData, noteElements: {setStyle: (s: object) => void}[]) {
  for (const note of noteElements) {
    if (prompt.success) {
      note.setStyle({fillStyle: "#64748b", strokeStyle: "#64748b"});
    } else if (prompt.current) {
      note.setStyle({fillStyle: "#0f172a", strokeStyle: "#38bdf8"});
    }
  }
}

function chordSpelling(): StaffChordSpellingMode {
  if (props.staffAccidentals === "keySignature") {
    return {mode: "keySignature", vexKey: props.vexKey};
  }
  return {mode: "eachNote"};
}

/** One or more 4/4 measures: prompts as quarter beats, trailing rests, barlines after each full measure except the last. */
function buildCombinedVoice(
  score: EasyScore,
  vf: Factory,
  prompts: PromptData[],
  requireOctave: boolean,
  spelling: StaffChordSpellingMode,
  freePlay: boolean,
) {
  const n = prompts.length;
  if (n === 0) {
    return null;
  }
  const totalBeats = Math.ceil(n / 4) * 4;
  const restCount = totalBeats - n;

  score.set({time: STAFF_NOTATION_METER});

  const tickables: Note[] = [];
  for (let i = 0; i < n; i++) {
    const pd = prompts[i]!;
    if (freePlay) {
      if (pd.success && pd.freePlayResolvedMidi != null) {
        const midis = mapPromptNotesToStaffMidis([pd.freePlayResolvedMidi], requireOctave);
        const line = buildChordEasyScoreLine(midis, spelling);
        const ns = score.notes(line);
        applyPromptStyle(pd, ns);
        tickables.push(...ns);
      } else {
        tickables.push(...score.notes("B4/q/r"));
      }
    } else {
      const midis = mapPromptNotesToStaffMidis(pd.prompt.notes, requireOctave);
      const line = buildChordEasyScoreLine(midis, spelling);
      const ns = score.notes(line);
      applyPromptStyle(pd, ns);
      tickables.push(...ns);
    }
    if ((i + 1) % 4 === 0 && i + 1 < n) {
      tickables.push(vf.BarNote({type: "single"}));
    }
  }
  for (let r = 0; r < restCount; r++) {
    tickables.push(...score.notes("B4/q/r"));
  }

  return score.voice(tickables, {time: `${totalBeats}/4`});
}

function measureCombinedWidthPxInProbe(
  prompts: PromptData[],
  requireOctave: boolean,
  spelling: StaffChordSpellingMode,
  freePlay: boolean,
): number {
  const probe = document.createElement("div");
  probe.id = `${domId}-measure-${Date.now().toString(36)}`;
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText =
    "position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none";
  document.body.appendChild(probe);
  try {
    const probeFactory = new Factory({
      renderer: {elementId: probe.id, width: 1200, height: 400},
    });
    const score = probeFactory.EasyScore();
    const voice = buildCombinedVoice(score, probeFactory, prompts, requireOctave, spelling, freePlay);
    if (!voice) {
      return 120;
    }
    const formatter = new Formatter();
    formatter.joinVoices([voice]);
    const minTickWidth = formatter.preCalculateMinTotalWidth([voice]);
    const withKs = spelling.mode === "keySignature";
    return minStaveWidthPx(minTickWidth, {withKeySignature: withKs});
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

  const prompts = props.prompts;
  if (prompts.length === 0) {
    return;
  }

  const containerWidth = Math.max(140, Math.floor(el.getBoundingClientRect().width) || 180);
  const height = 100;

  const spelling = chordSpelling();
  const freePlay = props.freePlay === true;

  const staveWidthPx = measureCombinedWidthPxInProbe(prompts, props.requireOctave, spelling, freePlay);

  const systemX = 8;
  const rendererWidth = Math.max(containerWidth, systemX + staveWidthPx + 12);

  const vf = new Factory({
    renderer: {elementId: el.id, width: rendererWidth, height},
  });
  const score = vf.EasyScore();
  const voice = buildCombinedVoice(score, vf, prompts, props.requireOctave, spelling, freePlay);
  if (!voice) {
    return;
  }

  const system = vf.System({
    spaceBetweenStaves: 9,
    x: systemX,
    y: 10,
    width: staveWidthPx,
    autoWidth: false,
    noJustification: false,
  });

  const useKs = props.staffAccidentals === "keySignature";
  const keySpec = normalizeVexKey(props.vexKey);

  const st = system.addStave({voices: [voice]}).addClef("treble");
  if (useKs) {
    st.addKeySignature(keySpec);
  }
  st.addTimeSignature(STAFF_NOTATION_METER);

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
      /* getBBox can fail before first paint */
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
    `${props.freePlay === true}:${props.requireOctave}:${props.staffAccidentals}:${props.vexKey}:${
      props.prompts
        .map(
          (p) =>
            `${p.prompt.index}:${p.current}:${p.success}:${p.freePlayResolvedMidi ?? ""}:${p.prompt.notes.join(",")}`,
        )
        .join("|")
    }`,
  draw,
);
</script>

<template>
  <div class="staff-all-prompts-shell">
    <div
      ref="hostRef"
      class="staff-all-prompts-mount"
    />
  </div>
</template>

<style scoped>
.staff-all-prompts-shell {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
}

.staff-all-prompts-mount {
  width: 80%;
  max-width: 80%;
  height: 80%;
  max-height: 80%;
  min-height: 88px;
  background: #ffffff;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  overflow: visible;
}

.staff-all-prompts-mount :deep(svg) {
  overflow: visible;
}
</style>

import {formatMidiNote} from "../notes";

export const GRAND_STAFF_SPLIT_MIDI = 60;

/** Middle C (C4) octave anchor when octave need not match the target MIDI. */
export function effectiveMidiForStaff(midi: number, requireOctave: boolean): number {
    if (requireOctave) {
        return midi;
    }
    const pc = ((midi % 12) + 12) % 12;
    return 60 + pc;
}

/**
 * EasyScore pitch like `C#5` (sharp-side spelling from {@link formatMidiNote}).
 */
export function midiToEasyScorePitch(midi: number): string {
    const label = formatMidiNote(midi, false);
    const ma = /^([A-G])([#b]?)(-?\d+)$/.exec(label);
    if (!ma) {
        throw new Error(`Unexpected MIDI label for ${midi}: ${label}`);
    }
    return `${ma[1]!}${ma[2]!}${ma[3]!}`;
}

/** Quarter-note chord or single note; first pitch carries `/q`. */
export function buildChordEasyScoreLine(midis: number[]): string {
    const sorted = [...new Set(midis)].sort((a, b) => b - a);
    if (sorted.length === 0) {
        return "B4/w/r";
    }
    const pitches = sorted.map(midiToEasyScorePitch);
    if (pitches.length === 1) {
        return `${pitches[0]}/q`;
    }
    const [first, ...rest] = pitches;
    return `${first}/q, ${rest.join(", ")}`;
}

export function mapPromptNotesToStaffMidis(
    noteMidis: number[],
    requireOctave: boolean,
): number[] {
    return [...new Set(noteMidis.map((m) => effectiveMidiForStaff(m, requireOctave)))];
}

export function splitGrandStaffMidis(midis: number[]): {treble: number[]; bass: number[]} {
    const treble: number[] = [];
    const bass: number[] = [];
    for (const m of midis) {
        if (m >= GRAND_STAFF_SPLIT_MIDI) {
            treble.push(m);
        } else {
            bass.push(m);
        }
    }
    return {treble, bass};
}

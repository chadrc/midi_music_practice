import {expect, test} from "vitest";
import {
    midiMatchesPromptSet,
    normPitchClass,
    samePitchRunBlocksSuccess,
    type PromptPitchSet,
} from "../../src/practice/freePlaySetMatch";

function p(partial: Partial<PromptPitchSet> & Pick<PromptPitchSet, "notes">): PromptPitchSet {
    return {
        notes: partial.notes,
        ensembleMidi: partial.ensembleMidi,
        ensemblePitchClasses: partial.ensemblePitchClasses,
    };
}

test("normPitchClass", () => {
    expect(normPitchClass(60)).toBe(0);
    expect(normPitchClass(-1)).toBe(11);
});

test("midiMatchesPromptSet uses ensemble when requireOctave", () => {
    const prompt = p({
        notes: [60],
        ensembleMidi: [60, 64, 67],
        ensemblePitchClasses: [0, 4, 7],
    });
    expect(midiMatchesPromptSet(64, prompt, true)).toBe(true);
    expect(midiMatchesPromptSet(65, prompt, true)).toBe(false);
});

test("midiMatchesPromptSet uses pitch classes when not requireOctave", () => {
    const prompt = p({
        notes: [60],
        ensembleMidi: [60, 64, 67],
        ensemblePitchClasses: [0, 4, 7],
    });
    expect(midiMatchesPromptSet(72, prompt, false)).toBe(true);
    expect(midiMatchesPromptSet(73, prompt, false)).toBe(false);
});

test("midiMatchesPromptSet falls back to notes", () => {
    const prompt = p({notes: [60, 64]});
    expect(midiMatchesPromptSet(64, prompt, true)).toBe(true);
    expect(midiMatchesPromptSet(76, prompt, false)).toBe(true);
});

test("samePitchRunBlocksSuccess", () => {
    expect(samePitchRunBlocksSuccess(0, null, 0, 1)).toBe(false);
    expect(samePitchRunBlocksSuccess(0, 0, 0, 1)).toBe(false);
    expect(samePitchRunBlocksSuccess(0, 0, 1, 1)).toBe(true);
    expect(samePitchRunBlocksSuccess(0, 0, 1, null)).toBe(false);
    expect(samePitchRunBlocksSuccess(2, 0, 1, 1)).toBe(false);
});

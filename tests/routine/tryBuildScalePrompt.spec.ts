import {expect, test} from "vitest";
import {tryBuildScalePrompt} from "../../src/routine";
import {scientificOctaveFromMidi} from "../../src/notes";
import {MAJOR_SCALE_SET_NAME} from "../../src/notes/scales";
import {NumberGenerator} from "../../src/common/NumberGenerator";
import {minimalBakedPart} from "./fixtures";

test("builds single-note scale prompt for fixed seed", () => {
    const p = tryBuildScalePrompt(
        MAJOR_SCALE_SET_NAME,
        "C",
        minimalBakedPart({seed: 1}),
        new NumberGenerator(12349),
        0,
        3,
    );
    expect(p).to.deep.equal({
        index: 0,
        notes: [55],
        color: "teal",
        displays: [{kind: "note", note: "G3"}],
    });
});

test("every note stays in partOctave across many sequential scale prompts", () => {
    const partOctave = 4;
    const settings = minimalBakedPart({seed: 1});
    const gen = new NumberGenerator(0.42);
    const k = 32;
    for (let i = 0; i < k; i++) {
        const prompt = tryBuildScalePrompt(
            MAJOR_SCALE_SET_NAME,
            "C",
            settings,
            gen,
            i,
            partOctave,
        );
        expect(prompt).not.toEqual(null);
        expect(scientificOctaveFromMidi(prompt!.notes[0]!)).toBe(partOctave);
    }
});

test("sequential scale prompts with one generator and fixed partOctave", () => {
    const settings = minimalBakedPart({seed: 1});
    const gen = new NumberGenerator(777);
    const partOctave = 2;
    const prompts = [0, 1, 2, 3].map((i) =>
        tryBuildScalePrompt(MAJOR_SCALE_SET_NAME, "C", settings, gen, i, partOctave),
    );
    expect(prompts.every((p) => p !== null)).toBe(true);
    expect(prompts).to.deep.equal([
        {
            index: 0,
            notes: [43],
            color: "cyan",
            displays: [{kind: "note", note: "G2"}],
        },
        {
            index: 1,
            notes: [45],
            color: "yellow",
            displays: [{kind: "note", note: "A2"}],
        },
        {
            index: 2,
            notes: [36],
            color: "blue",
            displays: [{kind: "note", note: "C2"}],
        },
        {
            index: 3,
            notes: [43],
            color: "red",
            displays: [{kind: "note", note: "G2"}],
        },
    ]);
});

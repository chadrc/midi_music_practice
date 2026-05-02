import {expect, test} from "vitest";
import {chordFromSpec, midiVoicingForChordAtFundamental, tryBuildChordPrompt} from "../../src/routine";
import {MAJOR_CHORDS_SET_NAME} from "../../src/notes/chords";
import {NumberGenerator} from "../../src/common/NumberGenerator";
import {minimalBakedPart} from "./fixtures";

test("builds single-note chord prompt for fixed seed", () => {
    const p = tryBuildChordPrompt(
        MAJOR_CHORDS_SET_NAME,
        "C",
        minimalBakedPart({seed: 1}),
        new NumberGenerator(12348),
        0,
        2,
    );
    expect(p).to.deep.equal({
        index: 0,
        notes: [36],
        color: "sky",
        displays: [{kind: "note", note: "C2"}],
        ensembleMidi: [36, 40, 43],
        ensemblePitchClasses: [0, 4, 7],
    });
});

test("returns null for invalid map key", () => {
    expect(
        tryBuildChordPrompt(
            MAJOR_CHORDS_SET_NAME,
            "NotAKey",
            minimalBakedPart(),
            new NumberGenerator(0.6),
            0,
            2,
        ),
    ).to.deep.equal(null);
});

test("each prompt note is a tone from the octave-locked voicing across many chord prompts", () => {
    const partOctave = 2;
    const chord = chordFromSpec({chordType: MAJOR_CHORDS_SET_NAME, baseNote: "C"});
    const fundamental = 36;
    expect(midiVoicingForChordAtFundamental(chord, fundamental)).to.deep.equal([36, 40, 43]);
    const voicing = new Set(midiVoicingForChordAtFundamental(chord, fundamental));
    const settings = minimalBakedPart({seed: 1});
    const gen = new NumberGenerator(0.77);
    const k = 28;
    for (let i = 0; i < k; i++) {
        const prompt = tryBuildChordPrompt(
            MAJOR_CHORDS_SET_NAME,
            "C",
            settings,
            gen,
            i,
            partOctave,
        );
        expect(prompt).not.toEqual(null);
        expect(voicing.has(prompt!.notes[0]!)).toBe(true);
    }
});

test("sequential chord prompts with one generator and fixed partOctave", () => {
    const settings = minimalBakedPart({seed: 1});
    const gen = new NumberGenerator(888);
    const partOctave = 2;
    const prompts = [0, 1, 2, 3].map((i) =>
        tryBuildChordPrompt(MAJOR_CHORDS_SET_NAME, "C", settings, gen, i, partOctave),
    );
    expect(prompts.every((p) => p !== null)).toBe(true);
    expect(prompts).to.deep.equal([
        {
            index: 0,
            notes: [36],
            color: "cyan",
            displays: [{kind: "note", note: "C2"}],
            ensembleMidi: [36, 40, 43],
            ensemblePitchClasses: [0, 4, 7],
        },
        {
            index: 1,
            notes: [40],
            color: "rose",
            displays: [{kind: "note", note: "E2"}],
            ensembleMidi: [36, 40, 43],
            ensemblePitchClasses: [0, 4, 7],
        },
        {
            index: 2,
            notes: [40],
            color: "amber",
            displays: [{kind: "note", note: "E2"}],
            ensembleMidi: [36, 40, 43],
            ensemblePitchClasses: [0, 4, 7],
        },
        {
            index: 3,
            notes: [43],
            color: "slate",
            displays: [{kind: "note", note: "G2"}],
            ensembleMidi: [36, 40, 43],
            ensemblePitchClasses: [0, 4, 7],
        },
    ]);
});

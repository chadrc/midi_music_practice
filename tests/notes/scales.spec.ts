import {expect, test} from "vitest";
import {
    BaseNotes,
    Chord,
    IONIAN_MODE_PATTERN,
    MAJOR_CHORD_PATTERN,
    MINOR_PENTATONIC_DEGREES,
    NoteScale,
} from "../../src/notes/scales";

test('created with specified pattern', () => {
    const scale = new NoteScale(BaseNotes.C, IONIAN_MODE_PATTERN)

    expect(scale.notes).toStrictEqual([
        BaseNotes.C.pitchClass,
        BaseNotes.D.pitchClass,
        BaseNotes.E.pitchClass,
        BaseNotes.F.pitchClass,
        BaseNotes.G.pitchClass,
        BaseNotes.A.pitchClass,
        BaseNotes.B.pitchClass,
    ]);
})

test('going beyond lowest octave normalizes to lowest', () => {
    const scale = new NoteScale(BaseNotes.B, IONIAN_MODE_PATTERN)

    expect(scale.notes).toStrictEqual([
        BaseNotes.B.pitchClass,
        BaseNotes.CSharp.pitchClass,
        BaseNotes.DSharp.pitchClass,
        BaseNotes.E.pitchClass,
        BaseNotes.FSharp.pitchClass,
        BaseNotes.GSharp.pitchClass,
        BaseNotes.ASharp.pitchClass,
    ]);
})

test('scale contains note', () => {
    const scale = new NoteScale(BaseNotes.C, IONIAN_MODE_PATTERN)

    expect(scale.contains(12)).toBe(true);
})

test('scale does not contain note', () => {
    const scale = new NoteScale(BaseNotes.C, IONIAN_MODE_PATTERN)

    expect(scale.contains(25)).toBe(false);
})

test('scale does not contain negative note', () => {
    const scale = new NoteScale(BaseNotes.C, IONIAN_MODE_PATTERN)

    expect(scale.contains(-2)).toBe(false);
})

test('scale does not contain out of bound note', () => {
    const scale = new NoteScale(BaseNotes.C, IONIAN_MODE_PATTERN)

    expect(scale.contains(132)).toBe(false);
})

test('C major triad is in C major scale', () => {
    const scale = new NoteScale(BaseNotes.C, IONIAN_MODE_PATTERN)
    const cMajor = new Chord(BaseNotes.C, MAJOR_CHORD_PATTERN)
    expect(scale.containsChord(cMajor)).toBe(true);
})

test('D major triad is not in C major scale', () => {
    const scale = new NoteScale(BaseNotes.C, IONIAN_MODE_PATTERN)
    const dMajor = new Chord(BaseNotes.D, MAJOR_CHORD_PATTERN)
    expect(scale.containsChord(dMajor)).toBe(false);
})

test('getName: letter vs enharmonic', () => {
    expect(BaseNotes.C.getName()).toBe("C");
    expect(BaseNotes.CSharp.getName()).toBe("C#/D♭");
    expect(BaseNotes.DFlat.getName()).toBe("D♭/C#");
    expect(BaseNotes.BFlat.getName()).toBe("B♭/A#");
});

test('enharmonic spellings share pitch class; NoteScale keeps chosen root', () => {
    expect(BaseNotes.CSharp.pitchClass).toBe(BaseNotes.DFlat.pitchClass);
    const sharpRoot = new NoteScale(BaseNotes.ASharp, MINOR_PENTATONIC_DEGREES);
    const flatRoot = new NoteScale(BaseNotes.BFlat, MINOR_PENTATONIC_DEGREES);
    expect(sharpRoot.notes).toStrictEqual(flatRoot.notes);
    expect(sharpRoot.fundamental).toBe(BaseNotes.ASharp);
    expect(flatRoot.fundamental).toBe(BaseNotes.BFlat);
});
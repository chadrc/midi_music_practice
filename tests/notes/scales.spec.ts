import {expect, test} from "vitest";
import {BaseNotes, NoteScale} from "../../src/notes/scales";

test('created with specified pattern', () => {
    const scale = new NoteScale(BaseNotes.C, [2, 2, 1, 2, 2, 2])

    expect(scale.notes).toStrictEqual([
        BaseNotes.C,
        BaseNotes.D,
        BaseNotes.E,
        BaseNotes.F,
        BaseNotes.G,
        BaseNotes.A,
        BaseNotes.B,
    ]);
})

test('going beyond lowest octave normalizes to lowest', () => {
    const scale = new NoteScale(BaseNotes.B, [2, 2, 1, 2, 2, 2])

    expect(scale.notes).toStrictEqual([
        BaseNotes.B,
        BaseNotes.CSharp,
        BaseNotes.DSharp,
        BaseNotes.E,
        BaseNotes.FSharp,
        BaseNotes.GSharp,
        BaseNotes.ASharp,
    ]);
})

test('scale contains note', () => {
    const scale = new NoteScale(BaseNotes.C, [2, 2, 1, 2, 2, 2])

    expect(scale.contains(12)).toBe(true);
})

test('scale does not contain note', () => {
    const scale = new NoteScale(BaseNotes.C, [2, 2, 1, 2, 2, 2])

    expect(scale.contains(25)).toBe(false);
})

test('scale does not contain negative note', () => {
    const scale = new NoteScale(BaseNotes.C, [2, 2, 1, 2, 2, 2])

    expect(scale.contains(-2)).toBe(false);
})

test('scale does not contain out of bound note', () => {
    const scale = new NoteScale(BaseNotes.C, [2, 2, 1, 2, 2, 2])

    expect(scale.contains(132)).toBe(false);
})
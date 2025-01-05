import {expect, test} from "vitest";
import {BaseNotes, NoteScale} from "../../src/notes/scales";

test('scale contains note', () => {
    const scale = new NoteScale(BaseNotes.C, [2, 2, 1, 2, 2, 2])

    expect(scale.contains(12)).toBe(true);
})

test('scale does not contain note', () => {
    const scale = new NoteScale(BaseNotes.C, [2, 2, 1, 2, 2, 2])

    expect(scale.contains(25)).toBe(false);
})
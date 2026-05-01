import {expect, test} from "vitest";
import {estimateRangeWhenChangingType} from "../../src/routine";
import {NoteRangeType} from "../../src/routine/types";

test("maps proportionally and clamps when switching range mode", () => {
    expect(
        estimateRangeWhenChangingType(NoteRangeType.Notes, {start: 0, end: 127}, NoteRangeType.Frets),
    ).to.deep.equal({start: 0, end: 22});
});

test("orders start before end after remap", () => {
    expect(
        estimateRangeWhenChangingType(NoteRangeType.Frets, {start: 20, end: 5}, NoteRangeType.Notes),
    ).to.deep.equal({start: 29, end: 115});
});

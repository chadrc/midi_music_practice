import {expect, test} from "vitest";
import {pickPoolIndex} from "../../src/routine";
import {PracticePoolMode} from "../../src/routine/types";
import {NumberGenerator} from "../../src/common/NumberGenerator";

test("Up mode wraps prompt index modulo pool length", () => {
    const g = new NumberGenerator(0);
    expect(pickPoolIndex(PracticePoolMode.Up, 3, 0, g)).to.equal(0);
    expect(pickPoolIndex(PracticePoolMode.Up, 3, 4, g)).to.equal(1);
});

test("Up-Down pool index matches Up (used for Random-mode scale type picks)", () => {
    const g = new NumberGenerator(0);
    expect(pickPoolIndex(PracticePoolMode.UpDown, 3, 0, g)).to.equal(0);
    expect(pickPoolIndex(PracticePoolMode.UpDown, 3, 4, g)).to.equal(1);
});

test("Down mode reverses pool order with wrap", () => {
    expect(pickPoolIndex(PracticePoolMode.Down, 3, 0, new NumberGenerator(0))).to.equal(2);
});

test("Random mode samples via generator", () => {
    expect(pickPoolIndex(PracticePoolMode.Random, 5, 0, new NumberGenerator(0.42))).to.equal(0);
});

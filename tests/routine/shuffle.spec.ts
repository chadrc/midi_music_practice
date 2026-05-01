import {expect, test} from "vitest";
import {shuffle} from "../../src/routine";
import {NumberGenerator} from "../../src/common/NumberGenerator";

test("permutes array in place with deterministic seed (full result)", () => {
    const gen = new NumberGenerator(0.5);
    const a = [1, 2, 3, 4, 5];
    shuffle(a, gen);
    expect(a).to.deep.equal([1, 4, 2, 5, 3]);
});

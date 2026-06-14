import {expect, test} from "vitest";
import {bpmFromPromptSuccesses} from "../../src/store/practice";

const MINUTE = 60_000;

test("bpmFromPromptSuccesses is null without successes or timings", () => {
    expect(bpmFromPromptSuccesses(0, 100, 160_100)).to.equal(null);
    expect(bpmFromPromptSuccesses(4, null, 200)).to.equal(null);
    expect(bpmFromPromptSuccesses(4, 100, null)).to.equal(null);
});

test("bpmFromPromptSuccesses is null when window is zero or inverted", () => {
    expect(bpmFromPromptSuccesses(1, 100, 100)).to.equal(null);
    expect(bpmFromPromptSuccesses(3, 200, 100)).to.equal(null);
});

test("bpmFromPromptSuccesses rounds prompt-throughput to whole BPM", () => {
    expect(bpmFromPromptSuccesses(8, 0, MINUTE)).to.equal(8);
    expect(bpmFromPromptSuccesses(1, 0, MINUTE)).to.equal(1);
});

import {expect, test} from "vitest";
import {rotateScaleSegmentOrdered} from "../../src/routine";

test("empty segment stays empty", () => {
    expect(rotateScaleSegmentOrdered([], 3)).to.deep.equal([]);
});

test("rotate wraps ascending degrees; negatives clamp to zero; large positives wrap modulo length", () => {
    const seg = [60, 62, 64, 65, 67, 69, 71];
    expect(rotateScaleSegmentOrdered(seg, 0)).to.deep.equal(seg);
    expect(rotateScaleSegmentOrdered(seg, 2)).to.deep.equal([64, 65, 67, 69, 71, 60, 62]);
    expect(rotateScaleSegmentOrdered(seg, -99)).to.deep.equal(seg);
    expect(rotateScaleSegmentOrdered(seg, 8)).to.deep.equal([62, 64, 65, 67, 69, 71, 60]);
    expect(rotateScaleSegmentOrdered(seg, 999)).to.deep.equal([69, 71, 60, 62, 64, 65, 67]);
});

test("matches descending traversal order after reverse", () => {
    const desc = [71, 69, 67, 65, 64, 62, 60];
    expect(rotateScaleSegmentOrdered(desc, 2)).to.deep.equal([67, 65, 64, 62, 60, 71, 69]);
});

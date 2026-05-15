import {expect, test} from "vitest";
import {averageVelocityFromTotals} from "../../src/store/practice";

test("averageVelocityFromTotals rounds to one decimal", () => {
    expect(averageVelocityFromTotals(100, 4)).to.equal(25);
    expect(averageVelocityFromTotals(100, 3)).to.equal(33.3);
});

test("averageVelocityFromTotals returns null with no strikes", () => {
    expect(averageVelocityFromTotals(0, 0)).to.equal(null);
});

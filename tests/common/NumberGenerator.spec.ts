import {expect, test} from "vitest";
import {NumberGenerator} from "../../src/common/NumberGenerator";

test('Seed between 1 and 0 gets transformed to be non fractional', () => {
    const gen1 = new NumberGenerator(Math.random());

    expect(gen1.seed).to.be.greaterThan(1);
});

test('Non-whole number seed get rounded', () => {
    const gen1 = new NumberGenerator(15.5);

    expect(gen1.seed).to.be.equal(16);
});

test('Two generators generate different values', () => {
    const gen1 = new NumberGenerator();
    const gen2 = new NumberGenerator();

    expect(gen1.next()).to.not.equal(gen2.next());
});

test('Two generators with same seed generate same value', () => {
    const gen1 = new NumberGenerator(100);
    const gen2 = new NumberGenerator(100);

    expect(gen1.next()).to.equal(gen2.next());
});

test('One generator that is reset generates same value', () => {
    const gen1 = new NumberGenerator(100);
    const val1 = gen1.next();
    gen1.reset();
    expect(val1).to.equal(gen1.next());
});

test('Range returns number between given numbers', () => {
    const gen1 = new NumberGenerator(100);
    const val1 = gen1.range(10.5, 25.12234);

    expect(val1).to.be.lessThanOrEqual(25.12234);
    expect(val1).to.be.greaterThanOrEqual(10.5);
});

test('RangeI returns integer between given numbers', () => {
    const gen1 = new NumberGenerator(100);
    const val1 = gen1.rangeI(10, 25);
    const parts = val1.toString().split(".");

    expect(val1).to.be.lessThanOrEqual(25);
    expect(val1).to.be.greaterThanOrEqual(10);
    expect(parts[1]).toBeUndefined();
});
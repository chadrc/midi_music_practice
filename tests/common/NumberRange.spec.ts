import {expect, test} from "vitest";
import NumberRange, {shiftNumberRangeWithinMax} from "../../src/common/NumberRange";

test('Create forward Range', () => {
    const range = new NumberRange(0, 127);

    expect(range.start).toEqual(0);
    expect(range.end).toEqual(127);
    expect(range.length).toEqual(127);
})

test('Create reverse Range', () => {
    const range = new NumberRange(0, -127);

    expect(range.start).toEqual(0);
    expect(range.end).toEqual(-127);
    expect(range.length).toEqual(127);
})

test('Create with nulls default to 0', () => {
    const range = new NumberRange(null, null);

    expect(range.start).toEqual(0);
    expect(range.end).toEqual(0);
    expect(range.length).toEqual(0);
})

test('Create with undefined default to 0', () => {
    const range = new NumberRange(undefined, undefined);

    expect(range.start).toEqual(0);
    expect(range.end).toEqual(0);
    expect(range.length).toEqual(0);
})

test('Iteration works', () => {
    const range = new NumberRange(4, 9);

    const [v1, v2, v3, v4, v5, v6] = range;

    expect(v1).toEqual(4);
    expect(v2).toEqual(5);
    expect(v3).toEqual(6);
    expect(v4).toEqual(7);
    expect(v5).toEqual(8);
    expect(v6).toBeUndefined();
})

test('Reverse iteration works', () => {
    const range = new NumberRange(4, 0);

    const [v1, v2, v3, v4, v5] = range;

    expect(v1).toEqual(4);
    expect(v2).toEqual(3);
    expect(v3).toEqual(2);
    expect(v4).toEqual(1);
    expect(v5).toBeUndefined();
})

test('toJSON only results in start and end properties', () => {
    const range = new NumberRange(0, 5);

    const result = JSON.stringify(range);

    expect(result).toEqual('{"start":0,"end":5}');
})

test('parse reads start and end properties', () => {
    const result = NumberRange.parse('{"start":0,"end":5}');

    expect(result).toEqual(new NumberRange(0, 5));
})

test('from reads start and end properties', () => {
    const result = NumberRange.from({start:0,end:5});

    expect(result).toEqual(new NumberRange(0, 5));
})

test("shiftNumberRangeWithinMax shifts and clamps", () => {
    expect(shiftNumberRangeWithinMax({start: 5, end: 10}, 3, 127)).to.deep.equal({start: 8, end: 13});
    expect(shiftNumberRangeWithinMax({start: 0, end: 5}, -3, 127)).to.deep.equal({start: 0, end: 5});
    expect(shiftNumberRangeWithinMax({start: 125, end: 127}, 2, 127)).to.deep.equal({start: 125, end: 127});
    expect(shiftNumberRangeWithinMax({start: 120, end: 126}, 5, 127)).to.deep.equal({start: 121, end: 127});
    expect(shiftNumberRangeWithinMax({start: 10, end: 5}, 2, 127)).to.deep.equal({start: 7, end: 12});
    expect(shiftNumberRangeWithinMax({start: 3, end: 3}, 1, 8)).to.deep.equal({start: 4, end: 4});
});
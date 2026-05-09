import {exists} from "../utilities";

export interface NumberRangeLike {
    start: number;
    end: number;
}

/**
 * Shifts both ends of `range` by `delta`, then clamps the interval into [0, max].
 * Preserves inclusive width when possible; may shrink when hitting an edge.
 * Order is normalized so start ≤ end in the result.
 */
export function shiftNumberRangeWithinMax(
    range: NumberRangeLike,
    delta: number,
    max: number,
): NumberRangeLike {
    let lo = Math.min(range.start, range.end);
    let hi = Math.max(range.start, range.end);
    lo += delta;
    hi += delta;
    if (lo < 0) {
        const fix = -lo;
        lo += fix;
        hi += fix;
    }
    if (hi > max) {
        const fix = hi - max;
        lo -= fix;
        hi -= fix;
    }
    lo = Math.max(0, Math.min(max, lo));
    hi = Math.max(0, Math.min(max, hi));
    if (lo > hi) {
        [lo, hi] = [hi, lo];
    }
    return {start: lo, end: hi};
}

export default class NumberRange {
    public start: number;
    public end: number;

    constructor(start: number, end: number) {
        if (exists(start)) {
            this.start = start;
        } else {
            this.start = 0;
        }

        if (exists(end)) {
            this.end = end;
        } else {
            this.end = 0;
        }
    }

    get length() {
        return Math.abs(this.end - this.start);
    }

    *[Symbol.iterator]() {
        let direction = 1;
        if (this.start >= this.end) {
            direction = -1;
        }
        for (let i=0; i<this.length; i++) {
            yield this.start + (direction * i);
        }
    }

    static parse(json: string) {
        const parsed = JSON.parse(json);
        return NumberRange.from(parsed);
    }

    static from(other: NumberRangeLike): NumberRange {
        return new NumberRange(other.start, other.end);
    }
}
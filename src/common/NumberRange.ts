import {exists} from "../utilities";

export interface NumberRangeLike {
    start: number;
    end: number;
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
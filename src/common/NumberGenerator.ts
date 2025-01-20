const NUMBER_BIT_LENGTH = Math.ceil(Math.log2(Number.MAX_SAFE_INTEGER));

export class NumberGenerator {
    private state: number;
    constructor(private readonly seed: number = (Math.random() * Number.MAX_SAFE_INTEGER)) {
        this.state = seed;
    }

    reset() {
        this.state = this.seed;
    }

    next(): number {
        let num = 0;

        for (let i = 0; i < NUMBER_BIT_LENGTH; i++) {
            const output = this.state & 1;
            num = (num << 1) | output;

            const bit = (this.state ^ (this.state >> 1) ^ (this.state >> 2) ^ (this.state >> 3) ^ (this.state >> 5)) & 1;
            this.state = (this.state >> 1) | (bit << NUMBER_BIT_LENGTH);
        }

        return num / Number.MAX_SAFE_INTEGER;
    }

    range(min: number, max: number): number {
        const roll = this.next();
        return (roll * (max - min)) + min;
    }

    rangeI(min: number, max: number): number {
        return Math.round(this.range(min, max));
    }
}
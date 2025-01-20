const MAX_BIT_LENGTH = Math.ceil(Math.log2(Number.MAX_SAFE_INTEGER));

export class NumberGenerator {
    private state: number;
    readonly seed: number;
    readonly bitLength: number;
    readonly maxNumber: number;

    constructor(
        seed: number = (Math.random() * Number.MAX_SAFE_INTEGER),
        bitLength: number = 32,
    ) {
        this.bitLength = Math.max(1, Math.min(Math.round(bitLength), MAX_BIT_LENGTH));
        this.maxNumber = Math.pow(2, this.bitLength);

        // ensure seed is whole number
        if (seed > -1 && seed < 1) {
            // given a fractional value, likely from Math.random()
            seed = seed * this.maxNumber;
        }

        // ensure whole number
        this.seed = Math.round(seed);
        this.state = seed;
    }

    reset() {
        this.state = this.seed;
    }

    next(): number {
        let num = 0;

        for (let i = 0; i < this.bitLength; i++) {
            const output = this.state & 1;
            num = (num << 1) | output;

            const bit = (this.state ^ (this.state >> 1) ^ (this.state >> 2) ^ (this.state >> 3) ^ (this.state >> 5)) & 1;
            this.state = (this.state >> 1) | (bit << (this.bitLength - 1));
        }

        return num / this.maxNumber;
    }

    range(min: number, max: number): number {
        const roll = this.next();
        const dif = max - min;
        const base = roll * dif;
        return base + min;
    }

    rangeI(min: number, max: number): number {
        const roll = this.range(min, max);
        return Math.round(roll);
    }

    static bit8(seed: number = (Math.random() * Number.MAX_SAFE_INTEGER)): NumberGenerator {
        return new NumberGenerator(seed, 8);
    }

    static bit16(seed: number = (Math.random() * Number.MAX_SAFE_INTEGER)): NumberGenerator {
        return new NumberGenerator(seed, 16);
    }

    static bit32(seed: number = (Math.random() * Number.MAX_SAFE_INTEGER)): NumberGenerator {
        return new NumberGenerator(seed, 32);
    }

    static bitMax(seed: number = (Math.random() * Number.MAX_SAFE_INTEGER)): NumberGenerator {
        return new NumberGenerator(seed, MAX_BIT_LENGTH);
    }
}
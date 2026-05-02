const MAX_BIT_LENGTH = Math.ceil(Math.log2(Number.MAX_SAFE_INTEGER));

export class NumberGenerator {
  private state: number;
  readonly seed: number;
  readonly bitLength: number;
  readonly maxNumber: number;

  constructor(seed: number = Math.random(), bitLength: number = 32) {
    this.bitLength = Math.max(
      1,
      Math.min(Math.round(bitLength), MAX_BIT_LENGTH),
    );
    // working with signed values but only going to work in positive range
    // so minus one from bit length to half
    this.maxNumber = Math.pow(2, this.bitLength);

    // a number from Math.random() will be between -1 and 1
    // we need an integer, so we scale it up
    if (seed > -1 && seed < 1) {
      seed = seed * this.maxNumber;
    }

    // ensure seed is within bit length range
    // dropping with bitwise, because just clamping would result in same seed for all values over maxNumber
    if (seed > this.maxNumber) {
      seed = seed | this.maxNumber;
    }

    // abs because just clamp would result in same seed for values below 0
    // round to ensure whole numbers
    // min/max to prevent all 0 or 1 bits
    this.seed = Math.max(
      1,
      Math.min(Math.round(Math.abs(seed)), this.maxNumber - 1),
    );
    this.state = this.seed;
  }

  reset() {
    this.state = this.seed;
  }

  next(): number {
    let num = 0n;

    for (let i = 0; i < this.bitLength; i++) {
      const output = this.state & 1;
      num = (num << 1n) | BigInt(output);

      const bit =
        (this.state ^
          (this.state >>> 1) ^
          (this.state >>> 2) ^
          (this.state >>> 3) ^
          (this.state >>> 5)) &
        1;
      this.state = Math.abs((this.state >>> 1) | (bit << (this.bitLength - 1)));
    }

    const denom = this.maxNumber - 1;
    return denom > 0 ? Number(num) / denom : 0;
  }

  range(min: number, max: number): number {
    const roll = this.next();
    const dif = max - min;
    const base = roll * dif;
    return base + min;
  }

  rangeI(min: number, max: number): number {
    const roll = this.range(min, max);
    return Math.round(Math.abs(roll));
  }

  /**
   * Uniform integer in the half-open interval [min, max) — the upper bound is **exclusive**, so
   * `max` is never a result. E.g. `rangeExclusiveI(0, a.length)` is always a valid index when `a.length > 0`.
   * Implemented with `Math.floor` on the same [min, max) float range as `range`, so the distribution is
   * not biased by `Math.round` straddling the end (unlike `rangeI` for array length–style bounds).
   */
  rangeExclusiveI(min: number, maxExclusive: number): number {
    if (maxExclusive <= min) {
      throw new RangeError(
        `rangeExclusiveI: maxExclusive (${maxExclusive}) must be > min (${min})`,
      );
    }
    return Math.floor(this.range(min, maxExclusive));
  }

  static bit8(
    seed: number = Math.random() * Number.MAX_SAFE_INTEGER,
  ): NumberGenerator {
    return new NumberGenerator(seed, 8);
  }

  static bit16(
    seed: number = Math.random() * Number.MAX_SAFE_INTEGER,
  ): NumberGenerator {
    return new NumberGenerator(seed, 16);
  }

  static bit32(
    seed: number = Math.random() * Number.MAX_SAFE_INTEGER,
  ): NumberGenerator {
    return new NumberGenerator(seed, 32);
  }

  static bitMax(
    seed: number = Math.random() * Number.MAX_SAFE_INTEGER,
  ): NumberGenerator {
    return new NumberGenerator(seed, MAX_BIT_LENGTH);
  }
}


export function exists(x: any) {
    return x !== undefined && x !== null;
}

export function arrayOf(count: number, value: any) {
    return Array.from({length: count}, (_1, _2) => value);
}
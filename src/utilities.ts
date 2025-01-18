
export function exists(x: any) {
    return x !== undefined && x !== null;
}

export function arrayOf(count: number, value: any) {
    return Array.from({length: count}, (_1, _2) => value);
}

export function clone<T>(obj: T) {
    return JSON.parse(JSON.stringify(obj));
}
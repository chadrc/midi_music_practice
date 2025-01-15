import {MINOR_CHORDS_SET_NAME} from "./notes/scales";

export function exists(x: any) {
    return x !== undefined && x !== null;
}

export function arrayOf(count: number, value: any) {
    return Array.from({length: 11}, (_1, _2) => MINOR_CHORDS_SET_NAME);
}
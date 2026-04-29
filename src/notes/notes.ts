import type {ChordTypeId, ScaleTypeId} from "../routine/types";
import {
    DIMINISHED_CHORDS_SET_NAME,
    MAJOR_CHORDS_SET_NAME,
    MINOR_CHORDS_SET_NAME,
} from "./chords";
import {
    CHROMATIC_SCALE_SET_NAME,
    DORIAN_SCALE_SET_NAME,
    LOCRIAN_SCALE_SET_NAME,
    LYDIAN_SCALE_SET_NAME,
    MAJOR_PENTATONIC_SCALE_SET_NAME,
    MAJOR_SCALE_SET_NAME,
    MIXOLYDIAN_SCALE_SET_NAME,
    MINOR_PENTATONIC_SCALE_SET_NAME,
    MINOR_SCALE_SET_NAME,
    PHRYGIAN_SCALE_SET_NAME,
} from "./scales";

export const CHORD_TYPE_LABEL: Record<ChordTypeId, string> = {
    [MAJOR_CHORDS_SET_NAME]: "Major",
    [MINOR_CHORDS_SET_NAME]: "Minor",
    [DIMINISHED_CHORDS_SET_NAME]: "Diminished",
};

export const SCALE_TYPE_LABEL: Record<ScaleTypeId, string> = {
    [CHROMATIC_SCALE_SET_NAME]: "Chromatic",
    [MAJOR_SCALE_SET_NAME]: "Major (Ionian)",
    [DORIAN_SCALE_SET_NAME]: "Dorian",
    [PHRYGIAN_SCALE_SET_NAME]: "Phrygian",
    [LYDIAN_SCALE_SET_NAME]: "Lydian",
    [MIXOLYDIAN_SCALE_SET_NAME]: "Mixolydian",
    [MINOR_SCALE_SET_NAME]: "Minor (Aeolian)",
    [LOCRIAN_SCALE_SET_NAME]: "Locrian",
    [MAJOR_PENTATONIC_SCALE_SET_NAME]: "Major pentatonic",
    [MINOR_PENTATONIC_SCALE_SET_NAME]: "Minor pentatonic",
};

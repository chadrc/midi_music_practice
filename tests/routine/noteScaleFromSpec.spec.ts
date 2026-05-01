import {expect, test} from "vitest";
import {noteScaleFromSpec} from "../../src/routine";
import {MAJOR_SCALE_SET_NAME} from "../../src/notes/scales";

test("major scale on C returns expected pitch classes and map key", () => {
    const scale = noteScaleFromSpec({scaleType: MAJOR_SCALE_SET_NAME, baseNote: "C"});
    expect({notes: [...scale.notes], mapKey: scale.fundamental.mapKey}).to.deep.equal({
        notes: [0, 2, 4, 5, 7, 9, 11],
        mapKey: "C",
    });
});

test("default spec is chromatic on C", () => {
    const scale = noteScaleFromSpec({});
    expect({notes: [...scale.notes], mapKey: scale.fundamental.mapKey}).to.deep.equal({
        notes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        mapKey: "C",
    });
});

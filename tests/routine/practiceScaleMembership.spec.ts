import {expect, test} from "vitest";
import {practiceScaleMembership} from "../../src/routine";
import {CHROMATIC_SCALE_SET_NAME, MAJOR_SCALE_SET_NAME} from "../../src/notes/scales";
import {PracticePoolMode, PracticeType} from "../../src/routine/types";

test("scale union membership across sample MIDI values", () => {
    const m = practiceScaleMembership({
        type: PracticeType.Scales,
        baseNote: "C",
        scaleTypes: [MAJOR_SCALE_SET_NAME, CHROMATIC_SCALE_SET_NAME],
        mode: PracticePoolMode.Random,
    });
    const sample = [59, 60, 61, 62, 63, 64, 65, 66] as const;
    expect(Object.fromEntries(sample.map((n) => [String(n), m.contains(n)]))).to.deep.equal({
        "59": true,
        "60": true,
        "61": true,
        "62": true,
        "63": true,
        "64": true,
        "65": true,
        "66": true,
    });
});

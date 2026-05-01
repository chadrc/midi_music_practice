import type {BakedRoutinePartSettings} from "../../src/routine/types";
import {ParentType, PracticeType} from "../../src/routine/types";
import {defaultPracticeForType} from "../../src/routine";

export function minimalBakedPart(
    overrides: Partial<BakedRoutinePartSettings> = {},
): BakedRoutinePartSettings {
    return {
        name: "part",
        seed: 42,
        targetBPM: 120,
        practice: defaultPracticeForType(PracticeType.Notes),
        requireOctave: true,
        minSuccessVelocity: 64,
        promptCount: 4,
        repeatCount: 0,
        cloneRepeat: false,
        parentSettings: ParentType.Settings,
        ...overrides,
    };
}

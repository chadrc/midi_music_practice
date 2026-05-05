/** Pitch-set fields used for “any note in the set” matching (standard and free-play prompts). */
export type PromptPitchSet = {
    notes: number[];
    ensembleMidi?: number[];
    ensemblePitchClasses?: number[];
};

export function normPitchClass(midi: number): number {
    return ((midi % 12) + 12) % 12;
}

/** Whether `playedMidi` is a member of the prompt’s chord/scale set (voicing or pitch classes). */
export function midiMatchesPromptSet(
    playedMidi: number,
    prompt: PromptPitchSet,
    requireOctave: boolean,
): boolean {
    if (requireOctave) {
        const mids = prompt.ensembleMidi;
        if (mids != null && mids.length > 0) {
            return mids.some((m) => m === playedMidi);
        }
        return prompt.notes.some((n) => n === playedMidi);
    }
    const pcs = prompt.ensemblePitchClasses;
    const p = normPitchClass(playedMidi);
    if (pcs != null && pcs.length > 0) {
        return pcs.includes(p);
    }
    return prompt.notes.some((n) => normPitchClass(n) === p);
}

/**
 * When limiting consecutive successes on the same pitch class: block if this hit would exceed the cap.
 * `consecutiveSamePitchCount` is the current run length on `lastAcceptedPc` after prior accepted hits.
 */
export function samePitchRunBlocksSuccess(
    playedPc: number,
    lastAcceptedPc: number | null,
    consecutiveSamePitchCount: number,
    maxConsecutiveSamePitchSuccess: number | null,
): boolean {
    if (maxConsecutiveSamePitchSuccess == null) {
        return false;
    }
    if (lastAcceptedPc === null) {
        return false;
    }
    if (playedPc !== lastAcceptedPc) {
        return false;
    }
    return consecutiveSamePitchCount >= maxConsecutiveSamePitchSuccess;
}

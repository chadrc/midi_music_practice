export interface KeySound {
    oscillator: OscillatorNode;
    gainEnvelope: GainNode;
    sustainGain: number;
}

export const startKeySound = (
    audioContext: AudioContext,
    midiNote: number,
    velocity: number
): KeySound => {
    const oscillator = new OscillatorNode(
        audioContext,
        {
            type: 'sine',
            frequency: 440 * Math.pow(2, (midiNote - 69) / 12),
        }
    )

    const attackTime = 0.1
    const sustainTime = 0.2

    const fullGain = velocity / 127
    const sustainGain = fullGain * 0.8

    const gainEnvelope = new GainNode(audioContext)
    gainEnvelope.gain.cancelScheduledValues(audioContext.currentTime)
    gainEnvelope.gain.setValueAtTime(0, audioContext.currentTime)
    gainEnvelope.gain.linearRampToValueAtTime(fullGain, audioContext.currentTime + attackTime)
    gainEnvelope.gain.linearRampToValueAtTime(sustainGain, audioContext.currentTime + sustainTime)

    oscillator
        .connect(gainEnvelope)
        .connect(audioContext.destination)

    oscillator.start();

    return {
        oscillator,
        gainEnvelope,
        sustainGain
    }
}

export const endKeySound = (
    audioContext: AudioContext,
    sound: KeySound
) => {
    const releaseTime = 0.2

    sound.gainEnvelope.gain.setValueAtTime(sound.sustainGain, audioContext.currentTime)
    sound.gainEnvelope.gain.linearRampToValueAtTime(0, audioContext.currentTime + releaseTime)
    sound.oscillator.stop(audioContext.currentTime + releaseTime);
}
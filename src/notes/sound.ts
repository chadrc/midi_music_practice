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

    const attackTime = 0.01
    const sustainTime = 0.2

    const fullGain = velocity / 127
    const sustainGain = fullGain * 0.8

    console.log(audioContext.currentTime)
    const gainEnvelope = new GainNode(audioContext)
    gainEnvelope.gain.cancelScheduledValues(audioContext.currentTime)
        .setValueAtTime(0, audioContext.currentTime)
        .linearRampToValueAtTime(fullGain, audioContext.currentTime + attackTime)
        // .linearRampToValueAtTime(sustainGain, audioContext.currentTime + sustainTime)

    const distortion = audioContext.createWaveShaper();
    distortion.curve = makeDistortionCurve(400);
    distortion.oversample = "4x";

    const filter = audioContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1000, audioContext.currentTime);
    filter.gain.setValueAtTime(25, audioContext.currentTime);

    oscillator
        .connect(gainEnvelope)
        .connect(distortion)
        .connect(filter)
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
    const releaseTime = 1.0

    console.log(audioContext.currentTime)
    sound.gainEnvelope.gain
        .cancelScheduledValues(audioContext.currentTime)
        .setTargetAtTime(0, audioContext.currentTime, .1)
        // .linearRampToValueAtTime(0, audioContext.currentTime + releaseTime)

    sound.oscillator.stop(audioContext.currentTime + releaseTime);
}

function makeDistortionCurve(amount: number) {
    const k = typeof amount === "number" ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < n_samples; i++) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
}
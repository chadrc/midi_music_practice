import {defineStore} from 'pinia'
import {formatMidiNote} from "../notes";

interface IOState {
    receiving: boolean;
    sending: boolean;
}

enum MIDIInstruction {
    NoteOn,
    NoteOff,
    PolyphonicAftertouch,
    Aftertouch,
    ControlChange,
    ProgramChange,
    PitchBend,
}

interface MIDIData {
    instruction: MIDIInstruction;
    channel: number;
    data1: number;
    data2: number;
}

interface NotePlayData {
    on: boolean;
    velocity: number;
}

interface MIDIStore {
    audioContext: AudioContext;
    midi: MIDIAccess | null;
    err: any | null;
    ioStates: Map<string, IOState>;
    playData: NotePlayData[]
}

export const useMidiStore = defineStore('midi', {
    state: (): MIDIStore => ({
        audioContext: new AudioContext(),
        midi: null,
        err: null,
        ioStates: new Map(),
        playData: Array.from({length: 128}, () => ({on: false, velocity: 0}))
    }),
    getters: {
        inputs: (state): MIDIInput[] => {
            let items: MIDIInput[] = []
            if (state.midi == null) return items;

            state.midi.inputs.forEach((entry) => items.push(entry))

            return items;
        }
    },
    actions: {
        requestAccess() {
            console.log("Requesting MIDI access...")
            navigator.requestMIDIAccess({
                sysex: true,
                software: true,
            })
                .then(
                    (midiAccess: MIDIAccess) => {
                        this.midi = midiAccess;
                    },
                    (err) => this.err = err
                );
        },
        toggleReceiving(deviceId: string) {
            let device: MIDIInput | null = null;
            this.midi?.inputs.forEach((entry: MIDIInput) => {
                if (entry.id == deviceId) device = entry;
            })

            if (device === null) return;

            let currentState = this.ioStates.get(deviceId);

            if (currentState === undefined || currentState.receiving === false) {
                device.onmidimessage = (event: MIDIMessageEvent) => {
                    let data = makeMidiData(event.data);

                    switch (data.instruction) {
                        case MIDIInstruction.NoteOff:
                            this.playData[data.data1].on = false;
                            this.playData[data.data1].velocity = data.data2;
                            break
                        case MIDIInstruction.NoteOn:
                            this.playData[data.data1].on = true;
                            this.playData[data.data1].velocity = data.data2;

                            const sound = new OscillatorNode(
                                this.audioContext,
                                {
                                    type: 'sine',
                                    frequency: 440 * Math.pow(2, (data.data1 - 69) / 12),
                                }
                            )

                            const playTime = 0.5
                            const attackTime = 0.01

                            const envelope = new GainNode(this.audioContext, {gain: playTime})
                            envelope.gain.cancelScheduledValues(this.audioContext.currentTime)
                            envelope.gain.setValueAtTime(0, this.audioContext.currentTime)
                            envelope.gain.linearRampToValueAtTime(this.playData[data.data1].velocity / 127, this.audioContext.currentTime + attackTime)
                            envelope.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + playTime)

                            sound
                                .connect(envelope)
                                .connect(this.audioContext.destination)

                            sound.start();
                            sound.stop(this.audioContext.currentTime + 0.5);
                            break
                        default:
                            // currently unsupported
                    }

                    console.log(`${formatMidiNote(data.data1)} ${MIDIInstruction[data.instruction]}`);
                }

                this.ioStates.set(deviceId, {receiving: true, sending: false});
            } else {
                device.onmidimessage = null

                this.ioStates.set(deviceId, {receiving: false, sending: false});
            }
        }
    }
})

function makeMidiData(bytes: Uint8Array): MIDIData | null {
    let status = bytes[0];
    let channel = 0;
    let instruction: MIDIInstruction | null = null
    let data1 = bytes[1];
    let data2 = bytes[2];

    if (status > 239) {
        console.log("Unsupported MIDI instruction. Check back later for implementation.")
        return null
    } else if (status >= 224) {
        instruction = MIDIInstruction.PitchBend;
        channel = status - 224
    } else if (status >= 208) {
        instruction = MIDIInstruction.Aftertouch;
        channel = status - 208
    } else if (status >= 192) {
        instruction = MIDIInstruction.ProgramChange;
        channel = status - 192
    } else if (status >= 176) {
        instruction = MIDIInstruction.ControlChange;
        channel = status - 176
    } else if (status >= 160) {
        instruction = MIDIInstruction.PolyphonicAftertouch;
        channel = status - 160
    } else if (status >= 144) {
        instruction = MIDIInstruction.NoteOn;
        channel = status - 144
    } else if (status >= 128) {
        instruction = MIDIInstruction.NoteOff;
        channel = status - 128
    }

    return {
        instruction: instruction,
        channel: channel,
        data1: data1,
        data2: data2,
    }
}
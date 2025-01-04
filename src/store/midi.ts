import {defineStore} from 'pinia'
import {endKeySound, KeySound, startKeySound} from "../notes/sound";

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

interface MIDIInputOption {
    id: string;
    name: string;
    manufacturer: string;
    receiving: boolean;
}

interface NotePlayData {
    on: boolean;
    velocity: number;
    sound: KeySound | null;
}

interface MIDIStore {
    audioContext: AudioContext;
    midi: MIDIAccess | null;
    err: any | null;
    ioStates: Map<string, IOState>;
    playData: NotePlayData[];
}

export const useMidiStore = defineStore('midi', {
    state: (): MIDIStore => ({
        audioContext: new AudioContext(),
        midi: null,
        err: null,
        ioStates: new Map(),
        playData: Array.from({length: 128}, () => ({
            on: false,
            velocity: 0,
            sound: null as KeySound | null
        })),
    }),
    getters: {
        inputs: (state): MIDIInputOption[] => {
            let items: MIDIInputOption[] = []
            if (state.midi == null) return items;

            state.midi.inputs.forEach((entry) => items.push({
                id: entry.id,
                name: entry.name,
                manufacturer: entry.manufacturer,
                receiving: state.ioStates.get(entry.id).receiving
            }))

            return items;
        }
    },
    actions: {
        requestAccess(autoReceiveInstruments: string[]) {
            console.log("Requesting MIDI access...")
            navigator.requestMIDIAccess({
                sysex: true,
                software: true,
            }).then(
                (midiAccess: MIDIAccess) => {
                    this.midi = midiAccess;
                    this.midi.inputs.forEach((entry: MIDIInput) => {
                        this.ioStates.set(entry.id, {receiving: false, sending: false});

                        if (autoReceiveInstruments.includes(entry.id)) {
                            this.toggleReceiving(entry.id);
                        }
                    })
                },
                (err) => this.err = err
            );
        },
        toggleReceiving(deviceId: string) {
            if (this.midi === null) return;

            let device: MIDIInput | null = null;
            this.midi.inputs.forEach((entry: MIDIInput) => {
                if (entry.id == deviceId) device = entry;
            })

            if (device === null) return;

            let currentState = this.ioStates.get(deviceId);

            if (currentState === undefined || currentState.receiving === false) {
                device.onmidimessage = (event: MIDIMessageEvent) => {
                    let data = makeMidiData(event.data);
                    if (data === null) return;

                    switch (data.instruction) {
                        case MIDIInstruction.NoteOff:
                            if (this.instrumentAudioEnabled) {
                                endKeySound(this.audioContext, this.playData[data.data1].sound)
                            }

                            this.playData[data.data1].on = false;
                            this.playData[data.data1].velocity = data.data2;
                            this.playData[data.data1].sound = null;
                            break
                        case MIDIInstruction.NoteOn:
                            this.playData[data.data1].on = true;
                            this.playData[data.data1].velocity = data.data2;

                            if (this.instrumentAudioEnabled) {
                                this.playData[data.data1].sound = startKeySound(
                                    this.audioContext,
                                    data.data1,
                                    data.data2
                                )
                            }
                            break
                        default:
                            // currently unsupported
                            return
                    }
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
        // console.log("Unsupported MIDI instruction. Check back later for implementation.")
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
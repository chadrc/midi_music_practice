import {defineStore} from 'pinia'
import {endKeySound, KeySound, startKeySound} from "../notes/sound";
import {Subject} from "rxjs";

interface IOState {
    receiving: boolean;
    sending: boolean;
}

export enum MIDIInstruction {
    NoteOff= 128,
    NoteOn= 144,
    PolyphonicAftertouch = 160,
    ControlChange= 176,
    ProgramChange= 192,
    Aftertouch = 208,
    PitchBend= 224,
}

export interface PracticeMIDIData {
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
    audioContext: AudioContext | null;
    midi: MIDIAccess | null;
    err: Error | null;
    ioStates: Map<string, IOState>;
    playData: NotePlayData[];
    midiEventSubject: Subject<PracticeMIDIData>
}

export const useMidiStore = defineStore('midi', {
    state: (): MIDIStore => ({
        audioContext: null,
        midi: null,
        err: null,
        ioStates: new Map(),
        playData: Array.from({length: 128}, () => ({
            on: false,
            velocity: 0,
            sound: null as KeySound | null
        })),
        midiEventSubject: new Subject<PracticeMIDIData>(),
    }),
    getters: {
        inputs: (state): MIDIInputOption[] => {
            const items: MIDIInputOption[] = []
            if (state.midi == null) return items;

            state.midi.inputs.forEach((entry) => {
                let receiving = false;
                if (state.ioStates.has(entry.id)) {
                    receiving = state.ioStates.get(entry.id).receiving;
                }

                items.push({
                    id: entry.id,
                    name: entry.name,
                    manufacturer: entry.manufacturer,
                    receiving,
                })
            })

            return items;
        }
    },
    actions: {
        requestAccess(autoReceiveInstruments: string[]) {
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
        receiveMidiMessage(event: MIDIMessageEvent) {
            const data = makeMidiData(event.data);
            if (data === null) return;

            switch (data.instruction) {
                case MIDIInstruction.NoteOff:
                    this.midiNoteOff(data.data1, 0);
                    break
                case MIDIInstruction.NoteOn:
                    this.midiNoteOn(data.data1, data.data2);
                    break
            }

            this.midiEventSubject.next(data);
        },
        midiNoteOn(note: number, velocity: number) {
            this.playData[note].on = true;
            this.playData[note].velocity = velocity;

            if (this.instrumentAudioEnabled) {
                this.playData[note].sound = startKeySound(
                    this.audioContext,
                    note,
                    velocity
                )
            }
        },
        midiNoteOff(note: number, velocity: number) {
            if (this.instrumentAudioEnabled) {
                endKeySound(this.audioContext, this.playData[note].sound)
            }

            this.playData[note].on = false;
            this.playData[note].velocity = velocity;
            this.playData[note].sound = null;
        },
        toggleReceiving(deviceId: string) {
            if (this.midi === null) return;

            let device: MIDIInput | null = null;
            this.midi.inputs.forEach((entry: MIDIInput) => {
                if (entry.id == deviceId) device = entry;
            })

            if (device === null) return;

            const currentState = this.ioStates.get(deviceId);

            if (currentState === undefined || currentState.receiving === false) {
                device.onmidimessage = (event: MIDIMessageEvent) => {
                    this.receiveMidiMessage(event);
                }

                this.ioStates.set(deviceId, {receiving: true, sending: false});
            } else {
                device.onmidimessage = null

                this.ioStates.set(deviceId, {receiving: false, sending: false});
            }
        }
    }
})

function makeMidiData(bytes: Uint8Array): PracticeMIDIData | null {
    const status = bytes[0];
    let channel = 0;
    let instruction: MIDIInstruction | null = null
    const data1 = bytes[1];
    const data2 = bytes[2];

    if (status > 239) {
        // console.log("Unsupported MIDI instruction. Check back later for implementation.")
        return null
    } else if (status >= MIDIInstruction.PitchBend) {
        instruction = MIDIInstruction.PitchBend;
        channel = status - 224
    } else if (status >= MIDIInstruction.Aftertouch) {
        instruction = MIDIInstruction.Aftertouch;
        channel = status - 208
    } else if (status >= MIDIInstruction.ProgramChange) {
        instruction = MIDIInstruction.ProgramChange;
        channel = status - 192
    } else if (status >= MIDIInstruction.ControlChange) {
        instruction = MIDIInstruction.ControlChange;
        channel = status - 176
    } else if (status >= MIDIInstruction.PolyphonicAftertouch) {
        instruction = MIDIInstruction.PolyphonicAftertouch;
        channel = status - 160
    } else if (status >= MIDIInstruction.NoteOn) {
        instruction = MIDIInstruction.NoteOn;
        channel = status - 144
    } else if (status >= MIDIInstruction.NoteOff) {
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
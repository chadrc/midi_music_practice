import {defineStore} from 'pinia'

interface IOState {
    receiving: boolean;
    sending: boolean;
}

interface MIDIStore {
    midi: MIDIAccess | null;
    err: any | null;
    ioStates: Map<string, IOState>;
}

export const useMidiStore = defineStore('midi', {
    state: (): MIDIStore => ({
        midi: null,
        err: null,
        ioStates: new Map(),
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
            navigator.requestMIDIAccess()
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
                    console.log(event.data);
                }

                this.ioStates.set(deviceId, {receiving: true, sending: false});
            } else {
                device.onmidimessage = null

                this.ioStates.set(deviceId, {receiving: false, sending: false});
            }
        }
    }
})
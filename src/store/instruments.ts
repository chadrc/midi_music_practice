import {defineStore} from "pinia";
import {createDevice, Device, IPatcher} from "@rnbo/js";
import {ref} from "vue";
import {useMidiStore} from "./midi";
import {MIDIEvent} from "@rnbo/js";

export const useInstrumentStore = defineStore('instruments', () => {
    const audioContext = new AudioContext();
    // Create gain node and connect it to audio output
    const outputNode = ref(audioContext.createGain());
    outputNode.value.connect(audioContext.destination);

    const midiStore = useMidiStore();
    const midiListenerUnsubscribe = ref<any>();
    const currentDevice = ref<Device | null>(null);

    async function loadDevice(patcher: IPatcher) {
        const device = await createDevice({
            context: audioContext,
            patcher: patcher,
        });
        device.node.connect(outputNode.value);

        currentDevice.value = device;
    }

    midiListenerUnsubscribe.value = midiStore.$onAction(
        ({name, args}) => {
            let message: [number, number, number] = [0, 0, 0]
            if (name === 'midiNoteOn') {
                let [note, velocity, channel] = args as [number, number, number]
                message = [144 + channel, note, velocity]
            } else if (name === 'midiNoteOff') {
                let [note, velocity, channel] = args as [number, number, number]
                message = [128 + channel, note, 0]
            } else {
                return
            }

            let event = new MIDIEvent(
                currentDevice.value.context.currentTime * 1000,
                0,
                message
            );

            currentDevice.value.scheduleEvent(event);
        }
    )
    return {
        currentDevice,
        loadDevice,
    }
})
import {defineStore} from "pinia";
import {createDevice, Device, IPatcher} from "@rnbo/js";
import {computed, ref, watch} from "vue";
import {useMidiStore} from "./midi";
import {MIDIEvent} from "@rnbo/js";
import {useSettingsStore} from "./settings";
import {exists} from "../utilities";

export const useInstrumentStore = defineStore('instruments', () => {
    const settingsStore = useSettingsStore();
    const midiStore = useMidiStore();

    const audioContext = new AudioContext();
    // Create gain node and connect it to audio output
    const outputNode = audioContext.createGain();
    outputNode.gain.value = settingsStore.instruments.volume

    outputNode.connect(audioContext.destination);

    const paramValues = ref<{ [key: string]: any }>({})

    const midiListenerUnsubscribe = ref<any>();
    const currentDevice = ref<Device | null>(null);
    const currentDeviceName = ref<string | null>(null);

    async function loadDevice(patcher: IPatcher) {
        const device = await createDevice({
            context: audioContext,
            patcher: patcher,
        });
        device.node.connect(outputNode);
        currentDevice.value = device;
        currentDeviceName.value = (patcher.desc.meta as any).name

        let defaults = {}

        for (let parameter of currentDevice.value.parameters) {
            defaults[parameter.id] = parameter.initialValue;
        }

        let existingData = settingsStore.instruments.instrumentData
            .find((value) => value.name === currentDeviceName.value);

        if (exists(existingData)) {
            paramValues.value = Object.assign(defaults, existingData.parameterData);
        } else {
            paramValues.value = defaults;
        }
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

    watch(() => settingsStore.instruments.volume, (value: number, oldValue: number) => {
        console.log("setting volume");
        outputNode.gain.setValueAtTime(value, audioContext.currentTime);
    })

    watch(paramValues,  (newValue, oldValue) => {
        if (currentDevice.value !== null) {
            settingsStore.saveInstrumentData({
                name: currentDeviceName.value,
                parameterData: newValue,
            })
        }
    }, { deep: true })

    return {
        paramValues,
        currentDevice,
        loadDevice,
    }
})
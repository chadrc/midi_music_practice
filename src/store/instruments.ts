import {defineStore} from "pinia";
import {createDevice, Device, IPatcher} from "@rnbo/js";
import {ref, watch} from "vue";
import {MIDIInstruction, useMidiStore} from "./midi";
import {MIDIEvent} from "@rnbo/js";
import {useSettingsStore} from "./settings";
import {exists} from "../utilities";
import {RNBOParameter} from "./types";
import {Subscription} from "rxjs";

export const useInstrumentStore = defineStore('instruments', () => {
    const settingsStore = useSettingsStore();
    const midiStore = useMidiStore();

    const audioContext = new AudioContext();
    // Create gain node and connect it to audio output
    const outputNode = audioContext.createGain();
    outputNode.gain.value = settingsStore.instruments.volume

    outputNode.connect(audioContext.destination);

    const paramValues = ref<{ [key: string]: RNBOParameter }>({})

    const midiListenerUnsubscribe = ref<Subscription>();
    const currentDevice = ref<Device | null>(null);
    const currentDeviceName = ref<string | null>(null);

    async function loadDevice(patcher: IPatcher) {
        const device = await createDevice({
            context: audioContext,
            patcher: patcher,
        });
        device.node.connect(outputNode);
        currentDevice.value = device;
        // typing is incorrect according to RNBO output file found in instruments
        // eslint-disable-next-line
        currentDeviceName.value = (patcher.desc.meta as any).name

        const existingData = settingsStore.instruments.instrumentData
            .find((value) => value.name === currentDeviceName.value);

        if (exists(existingData)) {
            paramValues.value = Object.assign({}, existingData.parameterData);
            for (const parameter of currentDevice.value.parameters) {
                if (exists(paramValues.value[parameter.id])) {
                    parameter.value = paramValues.value[parameter.id]
                } else {
                    paramValues.value[parameter.id] = parameter.initialValue
                }
            }
        } else {
            for (const parameter of currentDevice.value.parameters) {
                paramValues.value[parameter.id] = parameter.initialValue;
            }
        }
    }

    function playNote(note: number, velocity: number, duration: number) {
        currentDevice.value.scheduleEvent(new MIDIEvent(
            currentDevice.value.context.currentTime * 1000,
            0,
            [MIDIInstruction.NoteOn, note, velocity]
        ));

        window.setTimeout(() => {
            currentDevice.value.scheduleEvent(new MIDIEvent(
                currentDevice.value.context.currentTime * 1000,
                0,
                [MIDIInstruction.NoteOff, note, velocity]
            ));
        }, duration);
    }

    midiListenerUnsubscribe.value = midiStore.midiEventSubject
        .subscribe(({instruction, channel, data1, data2}) => {
            const event = new MIDIEvent(
                currentDevice.value.context.currentTime * 1000,
                0,
                [instruction + channel, data1, data2]
            );

            currentDevice.value.scheduleEvent(event);
        })

    watch(() => settingsStore.instruments.volume, (value: number) => {
        outputNode.gain.setValueAtTime(value, audioContext.currentTime);
    })

    watch(paramValues,  (newValue) => {
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
        playNote,
    }
})
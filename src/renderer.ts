/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';
import {createApp} from "vue";
import Main from "./MainContainer.vue"

const app = createApp(Main)

app.mount('#app');

navigator.permissions.query({
    name: "midi",
    // @ts-ignore
    sysex: true,
}).then(result => {
    if (result.state === "granted") {
        console.log("MIDI access granted");
    } else if (result.state === "prompt") {
        console.log("MIDI access prompt");
    } else {
        console.log("MIDI access denied");
    }
})

function onMidiSuccess(midiAccess: MIDIAccess) {
    console.log(midiAccess)

    for (const entry of midiAccess.inputs) {
        const input = entry[1];
        console.log(
            `Input port [type:'${input.type}']` +
            ` id:'${input.id}'` +
            ` manufacturer:'${input.manufacturer}'` +
            ` name:'${input.name}'` +
            ` version:'${input.version}'`,
        );
    }

    for (const entry of midiAccess.outputs) {
        const output = entry[1];
        console.log(
            `Output port [type:'${output.type}'] id:'${output.id}' manufacturer:'${output.manufacturer}' name:'${output.name}' version:'${output.version}'`,
        );
    }
}

navigator.requestMIDIAccess().then(onMidiSuccess);

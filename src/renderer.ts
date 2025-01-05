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
import {createApp, watch} from "vue";
import {createPinia} from "pinia";
import Main from "./MainContainer.vue"
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura"

const app = createApp(Main)
const pinia = createPinia()

app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
})
app.use(pinia)
app.mount('#app');

watch(
    pinia.state,
    (state) => {
        localStorage.setItem("settings", JSON.stringify(state.settings))
    },
    { deep: true}
)

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

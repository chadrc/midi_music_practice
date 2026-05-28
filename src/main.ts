import './index.css';
import {createApp, watch} from "vue";
import {createPinia} from "pinia";
import Main from "./MainContainer.vue"
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import Tooltip from "primevue/tooltip";

const app = createApp(Main)
const pinia = createPinia()

app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
})
app.directive("tooltip", Tooltip)
app.use(pinia)
app.mount('#app');

/** Persist full settings store (note grid, audio, instruments, user routine, practice UI, reference panel, reference presets). */
watch(
    pinia.state,
    (state) => {
        localStorage.setItem("settings", JSON.stringify(state.settings))
    },
    { deep: true},
)

navigator.permissions.query({
    name: "midi",
    // @ts-expect-error Typing is incorrect
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

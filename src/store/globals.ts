import {defineStore} from "pinia";
import {ref} from "vue";
import {exists} from "../utilities";

declare global {
    interface Window {
        MMPGlobal: {
            appVersion(): Promise<string>;
        }
    }
}

export const useGlobalStore = defineStore('global', () => {
    const appVersion = ref("");

    if (exists(window.MMPGlobal)) {
        window.MMPGlobal.appVersion().then((v: string) => {
            appVersion.value = v;
        });
    } else {
        appVersion.value = "[N/A]";
    }

    return {
        appVersion
    }
});
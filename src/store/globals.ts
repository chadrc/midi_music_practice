import {defineStore} from "pinia";
import {ref} from "vue";

declare global {
    interface Window {
        MMPGlobal: {
            appVersion(): Promise<string>;
        }
    }
}

export const useGlobalStore = defineStore('global', () => {
    const appVersion = ref("");

    window.MMPGlobal.appVersion().then((v: string) => {
        appVersion.value = v;
    });

    return {
        appVersion
    }
});
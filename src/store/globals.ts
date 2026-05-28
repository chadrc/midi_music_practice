import {defineStore} from "pinia";
import {ref} from "vue";

export const useGlobalStore = defineStore('global', () => {
    const appVersion = ref("1.0.7");

    return {
        appVersion
    }
});

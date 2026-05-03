import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config
export default defineConfig({
    plugins: [vue()],
    /** PrimeVue Options API components use `extends`; a second Vue copy breaks merged methods (e.g. StepPanel.getPTOptions). */
    resolve: {
        dedupe: ['vue'],
    },
});

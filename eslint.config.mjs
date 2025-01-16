import eslint from "@eslint/js";
import tseslint from 'typescript-eslint';
import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import tsParser from "@typescript-eslint/parser";

export default tseslint.config({
    extends: [
        eslint.configs.recommended,
        tseslint.configs.recommended,
        pluginVue.configs["flat/recommended"]
    ],
    languageOptions: {
        parser: vueParser,
        parserOptions: {
            parser: tsParser
        }
    }
})
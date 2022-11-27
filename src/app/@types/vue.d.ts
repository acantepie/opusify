import Utils from "../Utils";
import {Router} from "vue-router";

// https://vuejs.org/guide/typescript/options-api.html#augmenting-global-properties

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $utils: typeof Utils
        $openUrl: (url: string) => void,
        $router: Router
    }
}

export {}  // Important! See note.
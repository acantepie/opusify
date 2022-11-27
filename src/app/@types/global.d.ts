import Api from "../../electron/ipc/Api";

declare global {
    interface Window {api: typeof Api}
    const __APP_ENV__: string
}
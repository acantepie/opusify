import {ipcRenderer} from 'electron'
import {IpcEvents} from "./IpcEvents";
import {settings} from "../settings";

// use type string|IpcEvents to avoid declare enum on renderer process but keep IDE autocompletion

export default {
    invoke: (channel: string | IpcEvents, ...args: any[]): Promise<any> => {
        return ipcRenderer.invoke(channel, ...args)
    },

    send: (channel: string | IpcEvents, ...args: any[]): void => {
        ipcRenderer.send(channel, ...args)
    },

    receive: (channel: string | IpcEvents, func: (...args: any[]) => void) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args))
    },

    settings() {
        return settings
    }
}
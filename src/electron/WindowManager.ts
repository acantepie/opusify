import {BrowserWindow} from "electron";
import {IpcEvents} from "./ipc/IpcEvents";

export default class WindowManager {

    windows: Map<string, BrowserWindow>;

    constructor() {
        this.windows = new Map();
    }

    exists(name: string): boolean {
        return this.windows.has(name)
    }

    getWindow(name: string): BrowserWindow {
        return this.windows.get(name)
    }

    addWindow(name: string, window: BrowserWindow) {

        if (this.exists(name)) {
            throw new ReferenceError(`Cannot add a new window named ${name} as it already exists`)
        }

        window.on('closed', () => {
            this.windows.delete(name)
        })

        this.windows.set(name, window)
    }

    send(name: string, cmd: IpcEvents, ...args: any[]) {
        if (this.exists(name)) {
            this.getWindow(name).webContents.send(cmd, ...args)
        }
    }
}

export const windowManager = new WindowManager()
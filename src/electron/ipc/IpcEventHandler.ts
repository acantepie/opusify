import {ipcMain, IpcMainInvokeEvent, shell, dialog, OpenDialogOptions} from 'electron'
import {IpcEvents} from "./IpcEvents";
import {spotifyOAuthHandler} from "../spotify/SpotifyOAuthHandler";
import {storage} from "../storage/Storage";
import {taskRunner} from "../task/TaskRunner";
import {TaskTypeEnum} from "../dto/Task";
import TaskConfig from "../dto/TaskConfig";
import {windowManager} from "../WindowManager";

class IpcEventHandler {

    register() {

        ipcMain.handle(IpcEvents.LIBRARY_GET, () => storage.getLibrary())

        ipcMain.handle(IpcEvents.TASK_START, (e: IpcMainInvokeEvent, type: string) => {
            if (type in TaskTypeEnum) {
                return taskRunner.start(<TaskTypeEnum>type)
            } else {
                throw new Error(`Unknown type "${type}"`)
            }
        })
        ipcMain.handle(IpcEvents.TASK_ALL, () => storage.getTasks())
        ipcMain.handle(IpcEvents.TASK_FIND, (e: IpcMainInvokeEvent, id: number) => storage.findTask(id))
        ipcMain.handle(IpcEvents.TASK_IS_RUNNING, () => taskRunner.isRunning)
        ipcMain.on(IpcEvents.TASK_ABORT, () => taskRunner.abort())
        ipcMain.handle(IpcEvents.TASK_DELETE_ALL, () => storage.deleteAllTasks())

        ipcMain.handle(IpcEvents.TASK_CONFIG_GET, () => storage.getTaskConfig())
        ipcMain.handle(IpcEvents.TASK_CONFIG_SET, (e: IpcMainInvokeEvent, config: TaskConfig) => {
            storage.setTaskConfig(config)
            storage.saveTaskConfig()
        })

        ipcMain.on(IpcEvents.SPOTIFY_LOGIN, () => spotifyOAuthHandler.login())

        ipcMain.on(IpcEvents.OPEN_EXTERNAL_URL, (e: IpcMainInvokeEvent, url: string) => shell.openExternal(url))

        ipcMain.handle(IpcEvents.CHOOSE_PATH, (e: IpcMainInvokeEvent, options: OpenDialogOptions) => {
            return dialog.showOpenDialog(windowManager.getWindow('main'), options)
        })
    }
}

export const ipcEventHandler = new IpcEventHandler()
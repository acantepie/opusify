import Task, {TaskStatusEnum, TaskTypeEnum} from "../dto/Task";
import {storage} from "../storage/Storage";
import TaskLogger from "./TaskLogger";
import {windowManager} from "../WindowManager";
import {IpcEvents} from "../ipc/IpcEvents";
import SpotifyLibrarySynchronizer from "../spotify/SpotifyLibrarySynchronizer";
import YoutubeFileSynchronizer from "../youtubedl/YoutubeFileSynchronizer";
import {Notification, NotificationConstructorOptions, nativeImage} from 'electron'
import utils from "../Utils";
import {join} from "path";

export default class TaskRunner {
    private _isRunning: boolean = false;
    private _controller: AbortController = null;

    get isRunning(): boolean {
        return this._isRunning;
    }

    start(type: TaskTypeEnum): Task {
        if (this._isRunning) {
            throw new Error('Can\'t start a new task. A task is already running')
        }

        this._isRunning = true;
        const task = new Task(storage.getNextTaskId(), type);
        storage.addTask(task);

        this.run(task)
        return task
    }

    abort() {
        if (this._controller) {
            this._controller.abort()
        }
    }

    private async run(task: Task) {
        const taskLogger = new TaskLogger(task)

        task.startedAt = new Date()
        task.status = TaskStatusEnum.running

        this._controller = new AbortController();

        try {
            if (task.type === TaskTypeEnum.spotify_library_sync) {
                const synchronizer = new SpotifyLibrarySynchronizer(taskLogger, this._controller.signal)
                await synchronizer.sync()

            } else if (task.type === TaskTypeEnum.youtube_file_sync) {
                const config = storage.getTaskConfig()

                if (null === config) {
                    throw new Error('No task configuration found.')
                }

                const synchronizer = new YoutubeFileSynchronizer(taskLogger, config, this._controller.signal)
                await synchronizer.sync()
            }

            task.endedAt = new Date()
            task.status = TaskStatusEnum.done

        } catch (e) {

            task.endedAt = new Date()

            if (!this._controller.signal.aborted) {
                task.status = TaskStatusEnum.failed
                taskLogger
                    .error(`Exited`)
                    .error(utils.dump_error(e))

            } else {
                task.status = TaskStatusEnum.aborted
                taskLogger.error('Aborted')
            }

        } finally {

            storage.saveTasks();
            this._isRunning = false

            this.sendDoneNotification(task)
            windowManager.send('main', IpcEvents.TASK_DONE, task)
        }
    }

    private sendDoneNotification(task: Task) {
        const options = <NotificationConstructorOptions>{
            title: 'Spotify downloader',
            icon: nativeImage.createFromPath(join(process.env.ASSET_ELECTRON, 'logo32.png'))
        }

        if (task.status === TaskStatusEnum.failed) {
            options.body = `Task ${utils.task_name(task)} has failed.`
        } else {
            options.body = `Task ${utils.task_name(task)} was done.`
        }

        new Notification(options).show()
    }

}

export const taskRunner = new TaskRunner()
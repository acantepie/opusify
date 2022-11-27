import Library from "../dto/Library";
import Task, {TaskStatusEnum} from "../dto/Task";
import SpotifyCredentials from "../dto/SpotifyCredentials";
import Adapter from "./Adapter";
import {join} from "path";
import TaskConfig from "../dto/TaskConfig";
import * as fs from "fs";

interface StorageCache {
    library?: Library|null,
    spotifyCredentials?: SpotifyCredentials|null,
    tasks?: Task[]|null,
    taskConfig?: TaskConfig|null,
}

class Storage {

    private libraryAdapter: Adapter<Library>;
    private spotifyCredentialsAdapter: Adapter<SpotifyCredentials>;
    private taskAdapter: Adapter<Task>;
    private taskConfigAdapter: Adapter<TaskConfig>

    private cache: StorageCache;

    constructor() {
        this.invalidateCache()
    }

    configure() {
        const basePath = join(process.env.USER_DIR, '/data')

        this.libraryAdapter = new Adapter(Library, join(basePath, 'library.json'))
        this.spotifyCredentialsAdapter = new Adapter(SpotifyCredentials, join(basePath, 'spotify_credentials.json'))
        this.taskAdapter = new Adapter(Task, join(basePath, 'task.json'))
        this.taskConfigAdapter = new Adapter(TaskConfig, join(basePath, 'task_config.json'))

        if (!fs.existsSync(basePath)) {
            fs.mkdirSync(basePath)
        }

    }

    invalidateCache() {
        this.cache = <StorageCache>{}
    }

    // --- Library --- //

    getLibrary(): Library|null {
        if (typeof this.cache.library === 'undefined') {
            this.cache.library = <Library|null>this.libraryAdapter.read()
        }
        return this.cache.library;
    }

    setLibrary(library: Library): void {
        this.cache.library = library
    }

    saveLibrary(): void {
        this.libraryAdapter.write(this.cache.library)
    }

    // --- Spotify credentials --- //

    getSpotifyCredentials(): SpotifyCredentials|null {
        if (typeof this.cache.spotifyCredentials === 'undefined') {
            this.cache.spotifyCredentials = <SpotifyCredentials|null>this.spotifyCredentialsAdapter.read()
        }
        return this.cache.spotifyCredentials;
    }

    setSpotifyCredentials(credentials: SpotifyCredentials): void {
        this.cache.spotifyCredentials = credentials
    }

    saveSpotifyCredentials(): void {
        this.spotifyCredentialsAdapter.write(this.cache.spotifyCredentials)
    }

    // --- Tasks --- //

    getTasks(): Task[] {
        if (typeof this.cache.tasks === 'undefined') {
            this.cache.tasks = <Task[]|null>this.taskAdapter.read() || []
        }
        return this.cache.tasks;
    }

    getNextTaskId(): number {
        const tasks = this.getTasks()
        let id = 1
        for (let task of tasks) {
            if (task.id >= id) {
                id = task.id + 1
            }
        }
        return id
    }

    findTask(id: number): Task|null {
        const tasks = this.getTasks()
        return tasks.find((t) => t.id === id) ?? null
    }

    addTask(task: Task): void {
        const tasks = this.getTasks()
        tasks.push(task)
    }

    saveTasks(): void {
        this.taskAdapter.write(this.cache.tasks)
    }

    deleteAllTasks(): void {
        // remove all task except thr running one
        const tasks = this.getTasks()

        const runningTask = tasks.find((t) => t.status === TaskStatusEnum.running)
        this.cache.tasks = runningTask ? [runningTask] : []
        this.taskAdapter.write(this.cache.tasks)
    }

    // --- TaskConfig --- //

    getTaskConfig(): TaskConfig|null {
        if (typeof this.cache.taskConfig === 'undefined') {
            this.cache.taskConfig = <TaskConfig|null>this.taskConfigAdapter.read() || new TaskConfig()
        }
        return this.cache.taskConfig;
    }

    setTaskConfig(config: TaskConfig): void {
        this.cache.taskConfig = config
    }

    saveTaskConfig(): void {
        this.taskConfigAdapter.write(this.cache.taskConfig)
    }

}

export const storage = new Storage();
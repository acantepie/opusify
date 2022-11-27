import TaskLogEntry from "./TaskLogEntry";

export enum TaskTypeEnum {
    spotify_library_sync = 'spotify_library_sync',
    youtube_file_sync = 'youtube_file_sync'
}

export enum TaskStatusEnum {
    pending = 'pending',
    running = 'running',
    done = 'done',
    failed = 'failed',
    aborted = 'aborted',
    interrupted = 'interrupted'
}

export default class Task {
    id: number;

    type: TaskTypeEnum;
    status: TaskStatusEnum;

    startedAt: Date;
    endedAt: Date;

    logEntries: TaskLogEntry[]

    constructor(id: number, type: TaskTypeEnum) {
        this.id = id;
        this.status = TaskStatusEnum.pending;
        this.type = type;
        this.logEntries = []
    }

    addLogEntry(entry: TaskLogEntry): void {
        this.logEntries.push(entry)
    }
}
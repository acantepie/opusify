import TaskLogEntry, {TaskLogEntryTypeEnum} from "../dto/TaskLogEntry";

interface TaskLoggerOptions {
    type?: TaskLogEntryTypeEnum,
    message: string,
    parent?: TaskLogEntry
}

interface TaskLogEntryList {
    addLogEntry(entry: TaskLogEntry): void
}

export default class TaskLogger {
    private readonly entryList: TaskLogEntryList

    constructor(entryList: TaskLogEntryList) {
        this.entryList = entryList
    }

    log(message: string): TaskLogger {
        return this.create({
            message: message
        })
    }

    info(message: string): TaskLogger {
        return this.create({
            type: TaskLogEntryTypeEnum.info,
            message: message
        })
    }

    success(message: string): TaskLogger {
        return this.create({
            type: TaskLogEntryTypeEnum.success,
            message: message
        })
    }

    error(message: string): TaskLogger {
        return this.create({
            type: TaskLogEntryTypeEnum.error,
            message: message
        })
    }

    private create(options: TaskLoggerOptions): TaskLogger {
        const logEntry = new TaskLogEntry()

        if (options.type) {
            logEntry.type = options.type
        }

        logEntry.message = options.message
        this.entryList.addLogEntry(logEntry)

        return new TaskLogger(logEntry)
    }
}
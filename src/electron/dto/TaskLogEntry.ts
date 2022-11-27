export enum TaskLogEntryTypeEnum {
    success = 'success',
    error = 'error',
    info = 'info'
}

export default class TaskLogEntry {
    type: TaskLogEntryTypeEnum = null
    message: string = null
    logEntries: TaskLogEntry[]

    constructor() {
        this.logEntries = []
    }

    addLogEntry(entry: TaskLogEntry): void {
        this.logEntries.push(entry)
    }
}
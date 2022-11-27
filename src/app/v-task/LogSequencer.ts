export class LogSequencer {
    private _sequence: number = 1
    private _task: TaskDto

    constructor(task: TaskDto) {
        this._task = task
    }

    generate(): void {
        for (const entry of this._task.logEntries) {
            this._set(entry)
        }
    }

    private _set(entry: TaskLogEntryDto): void
    {
        entry.sequence = this._sequence++;
        for (let cEntry of entry.logEntries) {
            this._set(cEntry)
        }
    }
}

export const generateLogSequence = function (task: TaskDto) {
    const sequencer = new LogSequencer(task)
    sequencer.generate()
}
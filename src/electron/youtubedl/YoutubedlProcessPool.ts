import Youtubedl from "./Youtubedl";
import {ChildProcess} from "child_process";

class ChildProcessWrapper {
    runnable: Youtubedl
    process: ChildProcess

    constructor(runnable: Youtubedl) {
        this.runnable = runnable;
    }
}

type Tick = () => void|null

export default class YoutubedlProcessPool {

    private readonly maxParallelProcess: number
    private readonly tick: Tick
    private readonly processList: ChildProcessWrapper[]

    private signal: AbortSignal
    private queue: ChildProcessWrapper[]
    private countDone: number = 0

    constructor(maxParallelProcess: number, signal: AbortSignal, tick: Tick = null) {
        this.maxParallelProcess = maxParallelProcess
        this.signal = signal
        this.tick = tick
        this.processList = []
        this.queue = []

        // Configure abort signal
        this.signal.addEventListener('abort', () => {

            // empty the queue
            this.queue = []

            // kill all
            for (const w of this.processList) {
                if (w.process && w.process) {
                    w.process.kill('SIGINT')
                }
            }
        })
    }

    addProcess(runnable: Youtubedl): YoutubedlProcessPool
    {
        this.processList.push(new ChildProcessWrapper(runnable))
        return this
    }

    async start() {
        // queue all
        this.queue = [...this.processList]

        let countLoop = 0

        // stop only when all process are done
        while(this.countDone < this.processList.length && !this.signal.aborted) {

            // running process are not in queue and not marked as done
            const countRunning = this.processList.length - this.queue.length - this.countDone

            const countToStart = Math.min(this.maxParallelProcess - countRunning, this.queue.length)
            for (let i = 0; i < countToStart; i++) {
                this.runChild()
            }

            await new Promise(resolve => setInterval(resolve, 200))

            if (this.tick && 0 === countLoop % 25) { // tick is called each 5s
                this.tick()
            }

            countLoop++
        }

        // throw error if aborted to avoid execute extra instructions
        if (this.signal.aborted) {
            throw new Error()
        }
    }

    runChild() {
        const w = this.queue.shift()
        if (w) {
            w.process = w.runnable.run()
            w.process.on('exit', () => this.countDone++)
        }
    }
}
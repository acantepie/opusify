import {execSync} from "child_process";
import {existsSync} from "fs";


export default class FFmpeg {
    private readonly _binary: string = null

    constructor(binary: string) {
        this._binary = binary;
    }

    get binary(): string {
        return this._binary;
    }

    getVersion(): string {
        if (!existsSync(this._binary)) {
            throw new Error('Unable to get version of FFmpeg : path is invalid.')
        }

        let output = ''
        try {
            output = execSync(`"${this._binary}" -version`, {encoding: 'utf8'})
        } catch (e) {
            throw new Error(`Unable to get version of FFmpeg : ${e.message}`)
        }

        const re = /ffmpeg version (\S+)/
        const matches = output.match(re)
        return matches ? matches[1] : 'Unknown version'
    }
}
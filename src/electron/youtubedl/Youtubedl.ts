import {ChildProcess, spawn} from "child_process";
import Track from "../dto/Track";
import {logger} from "../Logger";
import FFmpeg from "./FFmpeg";

type DoneCallback = (code: number, stdout: string, stderr: string) => void

interface YoutubedlResult{
    searchResult: YoutubedlSearchResult|null
    downloadResult: YoutubedlDownloadResult|null
}

interface YoutubedlSearchResult {
    youtubeId: string|null
    data: any
    score: number|null
}

interface YoutubedlDownloadResult {
    filename: string|null
    filepath: string|null
}

export default class Youtubedl {

    private readonly binary: string

    private _track : Track|null = null

    private _youtubeId: string|null = null
    private _searchLimit: number|null = null
    private _searchMinScore: number|null = null

    private _cacheDir: string|null = null
    private _outputTmpl: string|null = null
    private _audioCodec: string|null = null
    private _audioQuality: number|null = null

    private _metadata: string|null = null

    private _ffmpeg: FFmpeg|null = null;
    private _debug: boolean = false

    private _stdout: string = ''
    private _stderr: string  = ''

    private _onSuccess: DoneCallback|null = null
    private _onError: DoneCallback|null = null

    set track(value: Track | null) {
        this._track = value;
    }

    set youtubeId(value: string | null) {
        this._youtubeId = value;
    }

    set searchLimit(value: number | null) {
        this._searchLimit = value;
    }

    set searchMinScore(value: number | null) {
        this._searchMinScore = value;
    }

    set cacheDir(value: string | null) {
        this._cacheDir = value;
    }

    set outputTmpl(value: string | null) {
        this._outputTmpl = value;
    }

    set audioCodec(value: string | null) {
        this._audioCodec = value;
    }

    set audioQuality(value: number | null) {
        this._audioQuality = value;
    }

    set metadata(value: string) {
        this._metadata = value;
    }

    set debug(value: boolean) {
        this._debug = value;
    }

    set ffmpeg(value: FFmpeg | null) {
        this._ffmpeg = value;
    }

    set onSuccess(value: DoneCallback | null) {
        this._onSuccess = value;
    }

    set onError(value: DoneCallback | null) {
        this._onError = value;
    }

    constructor() {
        this.binary = process.env.YOUTUBE_DL_BINARY
    }

    getBinary(): string
    {
        return this.binary
    }

    getCliArgs(): string[]
    {
        const args = []

        // --- Track options
        args.push(`--title=${this._track.name}`)
        args.push(`--sequence=${this._track.sequence}`)

        if (this._track.album.name) {
            args.push(`--album=${this._track.album.name}`)
        }

        if (this._track.album.releaseDate) {
            const y = parseInt(this._track.album.releaseDate.substring(0, 4))
            args.push(`--year=${y}`)
        }

        if (this._track.artists.length > 0) {
            args.push('--artist')
            for (const artist of this._track.artists) {
                // trim dash if string begin by dash to avoid error
                args.push(artist.name.replace(/^-+/, ''))
            }
        }

        if (this._track.durationMs > 0) {
            const d = Math.round(this._track.durationMs / 1000)
            args.push(`--duration=${d}`)
        }

        // --- search options
        if (this._youtubeId) {
            args.push(`--youtube-id=${this._youtubeId}`)
        }

        if (this._searchLimit) {
            args.push(`--search-limit=${this._searchLimit}`)
        }

        if (this._searchMinScore) {
            args.push(`--search-min-score=${this._searchMinScore}`)
        }


        // --- download options
        if (this._cacheDir) {
            args.push(`--cache-dir=${this._cacheDir}`)
        }

        if (this._audioCodec) {
            args.push(`--audio-codec=${this._audioCodec}`)
        }

        if (this._audioQuality) {
            args.push(`--audio-quality=${this._audioQuality}`)
        }

        if (this._outputTmpl) {
            args.push(`--output-tmpl=${this._outputTmpl}`)
        }

        // --- tagger options
        if (this._metadata) {
            args.push('--metadata')
            args.push(this._metadata)
        }

        // --- other options
        if (this._debug) {
            args.push('--debug')
        }

        if (this._ffmpeg) {
            args.push(`--ffmpeg-location=${this.ffmpeg.binary}`)
        }

        return args
    }

    run(): ChildProcess {
        this.checkArgs()

        this._stdout = ''
        this._stderr = ''

        const args = this.getCliArgs()
        let process = null

        try {
            process = spawn(this.binary, args)
        } catch (e) {
            // Add additional log
            logger.error('Unable to create a child process :')
            logger.error('> binary :')
            logger.error(this.binary)
            logger.error('> args :')
            logger.error(args)

            throw e
        }

        process.stdout.on('data', data => this._stdout += Buffer.from(data,'utf-8').toString())
        process.stderr.on('data', data => this._stderr += Buffer.from(data,'utf-8').toString())

        process.on('exit', (code: number) => {
            if (0 === code) {
                if (this._onSuccess) {
                    this._onSuccess(code, this._stdout, this._stderr)
                }
            } else {
                if (this._onError) {
                    this._onError(code, this._stdout, this._stderr)
                }
            }
        })

        return process
    }

    private checkArgs(): void {
        if (null === this._ffmpeg) {
            throw new Error('Option "ffmpeg" is required')
        }

        if (null === this._track) {
            throw new Error('Option "track" is required')
        }

        if (!this._track.name) {
            throw new Error('Option "track" is invalid, tracks must have a non empty title ')
        }
    }

    static parseOutput(stdout: string): YoutubedlResult {
        try {
            return <YoutubedlResult>JSON.parse(stdout)
        } catch (e) {
            return {
                searchResult: null,
                downloadResult: null,
            }
        }
    }

}
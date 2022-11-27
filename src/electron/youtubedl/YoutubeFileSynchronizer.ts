import TaskConfig from "../dto/TaskConfig";
import {storage} from "../storage/Storage";
import Playlist from "../dto/Playlist";
import Library from "../dto/Library";
import TaskLogger from "../task/TaskLogger";
import YoutubedlProcess from "./Youtubedl";
import {join} from "path";
import utils from "../Utils";
import YoutubedlProcessPool from "./YoutubedlProcessPool";
import Youtubedl from "./Youtubedl";
import Track from "../dto/Track";
import {AudioCodec} from "../dto/AudioCodec";
import * as fs from "fs";
import {logger} from "../Logger";
import FFmpeg from "./FFmpeg";

const DEBUG = false
const LIBRARY_DIRNAME = 'library'

export default class YoutubeFileSynchronizer {
    private readonly logger: TaskLogger
    private readonly config: TaskConfig
    private readonly signal: AbortSignal
    private readonly ffmpeg: FFmpeg
    private filePathMap: Map<string, Map<string, true>>

    constructor(logger: TaskLogger, config: TaskConfig, signal: AbortSignal) {
        this.logger = logger
        this.config = config
        this.signal = signal
        this.ffmpeg = new FFmpeg(config.ffmpegBinary)
        this.filePathMap = new Map()
    }

    async sync() { // must throw an exception if aborted
        this.checkConfig()

        this.logger.log('>>> Synchronizing files ...');
        this.logger.info(`Output dir : ${this.config.outputDir}`)
        this.logger.info(`Audio codec : ${this.config.audioCodec}`)
        this.logger.info(`Metadata : ${this.config.metadataMode}`)
        this.logger.info(`FFmpeg version : ${this.ffmpeg.getVersion()}`)

        const library = storage.getLibrary()

        if (null === library) {
            this.logger.error('No library data')
            return
        }

        const playlistIds = new Set(this.config.playlistIds)
        let count = 0;

        for (const playlist of library.playlists) {
            if (playlistIds.has(playlist.spotifyId)) {
                count++;
                await this.syncPlaylist(library, playlist)
                this.flush()
            }
        }

        if (0 === count) {
            this.logger.error('No playlist to synchronize')
        }

        // Don't clean output directory if nothing was synchronized
        if (count > 0 && this.config.cleanOutputDir) {
            this.cleanOutputDir()
        }

        this.flush()
    }

    private async syncPlaylist(library: Library, playlist: Playlist) {

        const pool = new YoutubedlProcessPool(10, this.signal, () => {
            this.flush()
        })

        // keep this directory
        const playlistPath = this._playlistPath(playlist)
        this.filePathMap.set(playlistPath, new Map())

        const playlistLogger = this.logger.log(`Sync playlist "${playlist.name}`)

        for (const track of playlist.tracks) {
            const trackPath = this._trackPath(playlist, track)

            // keep this file
            this.filePathMap.get(playlistPath).set(trackPath, true)

            if (track.youtubeId && fs.existsSync(trackPath)) {
                playlistLogger.log(`Track "${track.name}" already downloaded.`)
                continue;
            }

            const youtubedl = new YoutubedlProcess()
            youtubedl.track = track
            youtubedl.youtubeId = track.youtubeId
            youtubedl.audioCodec = this.config.audioCodec
            youtubedl.outputTmpl = trackPath
            youtubedl.cacheDir = join(process.env.USER_DIR, '/cache')
            youtubedl.debug = DEBUG
            youtubedl.ffmpegBinary = this.ffmpeg.binary

            if (this.config.metadataMode === 'youtube') {
                youtubedl.metadata = 'youtube'
            } else if (this.config.metadataMode === 'spotify') {
                youtubedl.metadata = 'input'
            }

            youtubedl.onSuccess = (_, stdout, stderr) => {
                const result = Youtubedl.parseOutput(stdout)

                if (result.searchResult && result.searchResult.youtubeId) {
                    track.youtubeId = result.searchResult.youtubeId
                }

                playlistLogger.success(`Track "${track.name}" downloaded`)

                if (DEBUG) {
                    console.debug(stderr)
                    console.debug(stdout)
                }
            }

            youtubedl.onError = (_, stdout, stderr) => {
                // avoid log extra message if task was aborted
                if (!this.signal.aborted) {
                    playlistLogger
                        .error(`Unable to download ${track.name}`)
                        .error(stderr)

                    // FIXME youtube url was probably invalid
                    track.youtubeId = null

                    // add additional log
                    logger.error(youtubedl.getBinary())
                    logger.error(youtubedl.getCliArgs().join(' '))
                }
            }

            pool.addProcess(youtubedl)
        }

        return pool.start()
    }

    private cleanOutputDir(): void
    {
        const logger = this.logger.log('Clean output directory (remove extra files)')

        fs.readdirSync(this._libraryPath()).forEach(file => {
            const playlistPath = join(this._libraryPath(), file)

            // This playlist directory doesn't exist anymore
            if (!this.filePathMap.has(playlistPath)) {
                logger.success(`Delete file ${playlistPath}`)
                fs.rmSync(playlistPath, {force: true, recursive: true})
            } else {
                fs.readdirSync(playlistPath).forEach(_file => {
                    const trackPath = join(playlistPath, _file)

                    if (!this.filePathMap.get(playlistPath).has(trackPath)) {
                        logger.success(`Delete file ${trackPath}`)
                        fs.rmSync(trackPath, {force: true, recursive: true})
                    }

                })
            }
        });

    }

    // Throw an error if something is invalid
    private checkConfig() {
        // youtube-dl binary (juste in case)
        if (!process.env.YOUTUBE_DL_BINARY || !fs.existsSync(process.env.YOUTUBE_DL_BINARY)) {
            throw new Error(`Binary path "${process.env.YOUTUBE_DL_BINARY}" is invalid.`)
        }

        // Audio format
        if (!this.config.audioCodec) {
            throw new Error('No audio codec specified.')
        }

        if (!AudioCodec.isValid(this.config.audioCodec)) {
            throw new Error('Audio codec is invalid.')
        }

        // outputDir
        if (null === this.config.outputDir) {
            throw new Error('No output directory specified.')
        }

        if (!fs.existsSync(this.config.outputDir)) {
            throw new Error('Output directory doesn\'t exist.')
        }

        try {
            fs.accessSync(this.config.outputDir, fs.constants.R_OK)
            fs.accessSync(this.config.outputDir, fs.constants.W_OK)
        } catch (e) {
            throw new Error('Output directory is not readable / writable.')
        }

        const outFileStat = fs.statSync(this.config.outputDir)
        if (!outFileStat.isDirectory()) {
            throw new Error('Output directory is not a valid directory.')
        }
    }

    private _libraryPath(): string
    {
        return join(this.config.outputDir, '/' + LIBRARY_DIRNAME)
    }

    private _playlistPath(playlist: Playlist): string
    {
        return join(this._libraryPath(),  '/' + utils.sanitize_filename(playlist.name))
    }

    private _trackPath(playlist: Playlist, track: Track): string
    {
        const trackName = track.artists.length > 0
            ? track.artists.map(a => a.name.trim()).join(', ') + ' - ' + track.name
            : track.name

        return join(
            this._playlistPath(playlist),
            '/' + utils.sanitize_filename(trackName.trim()) + '.' + AudioCodec.find(this.config.audioCodec).file_ext
        )
    }

    private flush(): void
    {
        storage.saveLibrary()
        storage.saveTasks()
    }
}
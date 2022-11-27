export default class TaskConfig {
    ffmpegBinary: string = '/usr/bin/ffmpeg'
    audioCodec: string = 'opus'
    outputDir: string|null = null
    cleanOutputDir: boolean = true
    playlistIds: string[] = []
    metadataMode: string = 'spotify'
}
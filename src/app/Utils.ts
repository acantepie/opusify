import moment, {Moment} from "moment";

const SEC_IN_MIN = 60;
const SEC_IN_HOUR = SEC_IN_MIN * 60;

class Utils {

    // Duplicate code of src_electron/utils.ts
    task_name(task: TaskDto): string {

        let name;
        switch(task.type) {
            case 'spotify_library_sync':
                name = 'Synchronize library (Spotify)';
                break;

            case 'youtube_file_sync':
                name = 'Synchronize audio files (Youtube)';
                break;

            default:
                name = ''
        }

        return `#${task.id} - ${name}`
    }

    date(string : string): Moment|null {
        const d = moment(string, null, true)
        return d.isValid() ? d : null
    }

    task_duration(task: TaskDto): string|null {
        const start = this.date(task.startedAt)
        const end = this.date(task.endedAt)

        if (null === start || null === end) {
            return null
        }

        const ms = end.diff(start, 'ms')

        const {'h': h, 'm': m, 's': s} = this._duration_parts(ms)

        if (h > 0) {
            return `${h}h ${m}m`
        }

        if (m > 0) {
            return `${m}m ${s}s`
        }

        return `${s}s`
    }

    track_duration(ms: number): string {
        const {'h': h, 'm': m, 's': s} = this._duration_parts(ms)

        if (h > 0) {
            return `${h}:${this._digits(m, 2)}:${this._digits(s, 2)}`
        }

        return `${m}:${this._digits(s, 2)}`
    }

    playlist_duration(ms: number): string {
        const {'h': h, 'm': m, 's': s} = this._duration_parts(ms)

        if (h > 0) {
            return `${h} h ${m} min`
        }

        if (m > 0) {
            return `${m} min ${s} s`
        }

        return `${s} s`

    }

    private _duration_parts(ms: number) {
        let time = Math.round(ms / 1000)

        const h = Math.floor(time / SEC_IN_HOUR)
        time -= h * SEC_IN_HOUR

        const m = Math.floor(time / SEC_IN_MIN)
        time -= m * SEC_IN_MIN

        return {
            'h': h,
            'm': m,
            's': time
        }
    }

    private _digits(n: number, digits = 2): string {
        return String(n).padStart(digits, '0')
    }

    file_size(bytes: number|null, precision = 2): string {
        if (null === bytes) {
            return ''
        }

        const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB']
        bytes = Math.max(bytes, 0)

        let pow = Math.floor((bytes ? Math.log(bytes) : 0) / Math.log(1024))
        pow = Math.min(pow, units.length - 1)

        bytes /= Math.pow(1024, pow)

        const multiplier = Math.pow(10, precision)
        return Math.round(bytes * multiplier) / multiplier + ' ' + units[pow];
    }

    sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    youtube_url(youtubeId: string): string {
        return `https://www.youtube.com/watch?v=${youtubeId}`
    }

    // https://stackoverflow.com/questions/5700636/using-javascript-to-perform-text-matches-with-without-accented-characters
    sanitize_string(s: string): string {
        return s
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, "")
            .toLowerCase()
            .trim()
    }


}

export default new Utils()
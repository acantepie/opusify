import Task from "./dto/Task";
import {SpotifyApiError} from "./spotify/SpotifyClient";

class Utils {

    dump_error(error: any): string {

        if (error instanceof SpotifyApiError) {
            let s = error.message

            if (error.url) {
                s += `\nRequest : [${error.method}] ${error.url}`
            }

            if (error.spotifyError) {
                s += `\nResponse : ${error.status} ${error.spotifyError}`
            }

            return s
        }

        if (error instanceof Error) {
            return `${error.message}`
        }

        if (error instanceof Object) {
            return JSON.stringify(error)
        }

        return String(error)
    }

    base64_url_encode(str: Buffer): string {
        return str.toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    // Duplicate code of src/utils.ts
    task_name(task: Task): string {
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

    escape_quote(s: string): string {
        return s
            .replace(/'/g, "\\'")
            .replace(/"/g, "\\\"")
    }

    nl2br(s: string): string {
        return s.replace(/(?:\r\n|\r|\n)/g, '<br>')
    }

    sanitize_filename(s: string): string {
        return s.replace(/([^\w\s\d\-_~,;\[\]\(\).])/, '')
    }

    sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}

export default new Utils()
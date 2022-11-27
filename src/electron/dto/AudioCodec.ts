import {settings} from "../settings";

export namespace AudioCodec {

    export function find(value: string) {
        return settings.audio_codec.find(a => a.value === value) ?? null
    }

    export function isValid(value: string): boolean {
        return AudioCodec.find(value) !== null
    }
}
export const settings = {
    spotify: {
        // protect my spotify client id from russian hacker :)
        client_id: Buffer.from('MTQ0Y2UzNDI4MzFiNDZlZTljYjFjOGJjODI0OGNlODI=', 'base64').toString()
    },
    audio_codec : [
        {
            value: 'opus',
            label: 'Opus (Default youtube audio format)',
            file_ext: 'opus'
        },
        {
            value: 'mp3',
            label: 'MP3',
            file_ext: 'mp3'
        },
        {
            value: 'aac',
            label: 'AAC (m4a)',
            file_ext: 'm4a'
        },
        {
            value: 'flac',
            label: 'Flac',
            file_ext: 'flac'
        }
    ]
}
declare interface LibraryDto {
    account: AccountDto;
    playlists: PlaylistDto[];
}

declare interface AccountDto {
    spotifyId: string;
    name: string;
    spotifyUrl: string;
}

declare interface PlaylistDto {

    likedTracks: boolean;
    sequence: number;

    spotifyId: string;
    spotifyUrl: string;

    name: string;
    description: string;

    collaborative: boolean;
    public: boolean;

    ownerId: string;
    ownerName: string;
    ownedByMe: boolean;

    durationMs: number;
    tracks: TrackDto[];
}

declare interface TrackDto {

    sequence: number;

    spotifyId: string;
    spotifyUrl: string;

    name: string;

    popularity: number;
    durationMs: number;

    artists: ArtistDto[];
    album: AlbumDto;

    youtubeId: string;
}

declare interface AlbumDto {
    spotifyUrl: string;
    name: string;
    releaseDate: string;
}

declare interface ArtistDto {
    spotifyUrl: string;
    name: string;
}

declare interface TaskDto {
    id: number;

    type: string;
    status: string;

    startedAt: string;
    endedAt: string;

    logEntries: TaskLogEntryDto[];
}

declare interface TaskLogEntryDto {
    sequence?: number;
    type: string;
    message: string;
    logEntries: TaskLogEntryDto[];
}

declare interface TaskConfigDto {
    ffmpegBinary: string
    audioCodec: string
    outputDir: string
    cleanOutputDir: boolean
    playlistIds: string[]
    metadataMode: string
}
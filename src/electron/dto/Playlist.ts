import Track from "./Track";

export default class Playlist {

    // Is the playlist of liked tracks
    likedTracks: boolean = false;

    sequence: number = 0;

    spotifyId: string;
    spotifyUrl: string;

    name: string;
    description: string;

    collaborative: boolean;
    public: boolean;

    ownerId: string;
    ownerName: string;
    ownedByMe: boolean;

    durationMs: number = 0;

    tracks: Track[];

    constructor() {
        this.tracks = [];
    }

    addTrack(track: Track) {
        this.tracks.push(track);
    }
}
import Album from "./Album";
import Artist from "./Artist";

export default class Track {

    sequence: number = 0;

    spotifyId: string;
    spotifyUrl: string;

    name: string;

    popularity: number;
    durationMs: number;

    artists: Artist[];
    album: Album;

    // Internal data
    youtubeId: string;

    constructor() {
        this.artists = [];
        this.album = new Album();
    }

    addArtist(artist: Artist) {
        this.artists.push(artist);
    }
}
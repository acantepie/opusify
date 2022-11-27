import Account from "../dto/Account";
import Artist from "../dto/Artist";
import Library from "../dto/Library";
import Playlist from "../dto/Playlist";
import Track from "../dto/Track";
import {storage} from "../storage/Storage";
import SpotifyClient, {spotifyClient} from "../spotify/SpotifyClient";
import TaskLogger from "../task/TaskLogger";

type Backup = {
    tracks: Map<string, { youtubeId: string }>
}

const albumFields = 'name, release_date, external_urls'
const artistFields = 'name, external_urls'
const trackFields = `id, name, duration_ms, popularity, external_urls, album(${albumFields}),artists(${artistFields})`
const playlistFields = `items(track(${trackFields})), next`

// Very huge playlist aren't supported
const maxItems = 500

export default class SpotifyLibrarySynchronizer {
    private readonly logger: TaskLogger;
    private readonly client: SpotifyClient;
    private readonly signal: AbortSignal; // not managed

    constructor(logger: TaskLogger, signal: AbortSignal) {
        this.logger = logger;
        this.client = spotifyClient;
        this.signal = signal;
    }

    async sync() { // must throw an exception if aborted
        this.logger.log('Synchronizing library ...');

        const backup = this.createBackup()

        const library = new Library()
        await this.syncAccount(library.account);
        await this.syncLikedTracks(library);
        await this.syncPlaylists(library);

        this.restoreBackup(library, backup)

        storage.setLibrary(library)
        storage.saveLibrary()
    }

    private async syncAccount(account: Account) {
        const data = await this.client.getMe();

        account.name = data['display_name'];
        account.spotifyId = data['id'];
        account.spotifyUrl = this.getSpotifyUrl(data);

        this.logger.success('Account synchronized');
    }

    private async syncLikedTracks(library: Library) {
        const playlist = new Playlist();
        playlist.name = 'Liked tracks'
        playlist.likedTracks = true
        playlist.spotifyId = '__liked_tracks__'

        let offset = 0
        let data = null

        do {
            data = await this.client.getMyTracks({
                'limit': 50,
                'offset': offset
            })
            this.syncTracks(playlist, data['items'], offset)
            offset += 50

        } while (data.next && offset < maxItems)

        if (playlist.tracks.length > 0) {
            library.addPlaylist(playlist)
            this.logger.success(`Liked tracks synchronized (${playlist.tracks.length} tracks)`);
        }
    }

    private async syncPlaylists(library: Library) {
        const data = await this.client.getMyPlaylists();

        let sequence = 0;
        for (const playlistData of data['items']) {
            const playlist = new Playlist();

            playlist.sequence = ++sequence
            playlist.spotifyId = playlistData['id'];
            playlist.spotifyUrl = this.getSpotifyUrl(playlistData);

            playlist.name = playlistData['name'] ? playlistData['name'] : 'Unknown';
            playlist.description = playlistData['description'];
            playlist.ownedByMe = false;

            if ('owner' in playlistData) {
                playlist.ownerId = playlistData['owner']['id'];
                playlist.ownerName = playlistData['owner']['display_name'];
                playlist.ownedByMe = playlist.ownerName === library.account.name;
            }

            playlist.collaborative = playlistData['collaborative'];
            playlist.public = playlistData['public'];

            await this.syncPlaylistTracks(playlist);
            library.addPlaylist(playlist);

            this.logger.success(`Playlist ${playlist.name} synchronized (${playlist.tracks.length} tracks)`);
        }
    }

    private async syncPlaylistTracks(playlist: Playlist) {
        let offset = 0
        let data = null

        do {
            data = await this.client.getPlaylistTracks(playlist.spotifyId, {
                'fields': playlistFields,
                'limit': 100,
                'offset': offset
            })
            this.syncTracks(playlist, data['items'], offset)
            offset += 100

        } while (data.next && offset < maxItems)
    }

    private syncTracks(playlist: Playlist, data: any[], firstSequence: number = 0) {

        let sequence = firstSequence;
        for (const trackData of data) {

            // Spotify can return invalid value ...
            if (!trackData || !trackData['track']) {
                continue;
            }

            const track = new Track();

            track.sequence = ++sequence
            track.spotifyId = trackData['track']['id'];
            track.spotifyUrl = this.getSpotifyUrl(trackData['track']);

            track.name = trackData['track']['name'];

            track.durationMs = trackData['track']['duration_ms'];
            track.popularity = trackData['track']['popularity'];

            if ('album' in trackData['track']) {
                const albumData = trackData['track']['album'];

                track.album.spotifyUrl = this.getSpotifyUrl(albumData);
                track.album.name = albumData['name'];
                track.album.releaseDate = albumData['release_date'];
            }


            for (const artistData of trackData['track']['artists']) {
                const artist = new Artist();

                artist.name = artistData['name'];
                artist.spotifyUrl = this.getSpotifyUrl(artistData);

                track.addArtist(artist);
            }

            playlist.addTrack(track);
            playlist.durationMs += track.durationMs;
        }
    }

    private getSpotifyUrl(data: Object): null | string {
        return 'external_urls' in data && 'spotify' in data['external_urls'] ? data['external_urls']['spotify'] : null;
    }

    // save internal data before sync
    // restore internal data after sync

    private createBackup(): Backup {
        const library = storage.getLibrary()
        const backup = <Backup>{
            playlists: new Map(),
            tracks: new Map()
        }

        if (null === library) {
            return backup
        }

        for (const playlist of library.playlists) {

            for (const track of playlist.tracks) {
                if (track.spotifyId) {
                    backup.tracks.set(track.spotifyId, {youtubeId: track.youtubeId})
                }
            }
        }

        return backup;
    }

    private restoreBackup(library: Library, backup: Backup) {
        for (const playlist of library.playlists) {

            for (const track of playlist.tracks) {

                const trackBkp = backup.tracks.get(track.spotifyId)
                if (trackBkp) {
                    track.youtubeId = trackBkp.youtubeId
                }
            }
        }
    }
}
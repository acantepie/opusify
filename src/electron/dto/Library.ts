import Account from "./Account";
import Playlist from "./Playlist";

export default class Library {

    account: Account;
    playlists: Playlist[];

    constructor() {
        this.account = new Account();
        this.playlists = [];
    }

    addPlaylist(playlist: Playlist): void {
        this.playlists.push(playlist);

    }
}
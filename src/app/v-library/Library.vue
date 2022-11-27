<template>
    <el-alert v-if="null === library" title="No data to load" type="info" :closable="false" show-icon>
        <a class="text-primary" href @click.prevent="$router.push({name: 'task:spotify_library_sync'})">
            Synchronize my library with Spotify.
        </a>
    </el-alert>
    <el-row v-else>
        <el-col :sm="5">
            <LibraryNav
                :active-playlist="activePlaylist"
                :library="library"
                @select="setActivePlaylist" />

        </el-col>
        <el-col :sm="19">
            <Playlist :playlist="activePlaylist" />
        </el-col>
    </el-row>
</template>

<script lang="ts">
import Playlist from "./Playlist.vue";
import {defineComponent} from 'vue';
import LibraryNav from "./LibraryNav.vue";

export default defineComponent({
    components: {LibraryNav, Playlist},
    data() {
        return {
            library: null as LibraryDto|null,
            activePlaylist: null as PlaylistDto|null
        }
    },
    async created() {
        this.library = await window.api.invoke('library:get')
        this.activePlaylist = this.library && this.library.playlists.length > 0 ? this.library.playlists[0] : null
    },
    methods: {
        setActivePlaylist(playlist: PlaylistDto) {
            this.activePlaylist = playlist
        }
    }
})
</script>
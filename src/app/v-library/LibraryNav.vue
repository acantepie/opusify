<template>
    <div class="nav">
        <div class="nav-item">
            <div>
                <a @click.prevent="$openUrl(library.account.spotifyUrl)" class="nav-item-inner el-link" href>
                    <i class="mdi mdi-account icon"/>
                    <span>{{ library.account.name }}</span>
                </a>
            </div>
        </div>
        <div class="nav-item divider-item"/>
        <div v-for="playlist in library.playlists"
             class="nav-item action-item"
             :class="playlist === activePlaylist ? 'active' : ''"
             @click="$emit('select', playlist)">

            <div class="nav-item-inner">
                <i v-if="isLikedTracks(playlist)" class="mdi mdi-heart icon"/>
                <span class="fw-bold">{{ playlist.name }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';

export default defineComponent({
    emits: ['select'],
    props: {
        library: {
            type: Object as PropType<LibraryDto>,
            required: true
        },
        activePlaylist: {
            type: Object as PropType<PlaylistDto> | null,
            required: false
        }
    },
    methods: {
        isLikedTracks(p: PlaylistDto): boolean {
            return p.spotifyId === '__liked_tracks__'
        }
    }
})
</script>
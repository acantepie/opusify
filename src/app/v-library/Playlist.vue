<template>
    <div class="playlist" v-if="playlist">
        <div class="playlist-header pb-2">
            <div>
                <div class="playlist-head">
                    <el-link class="playlist-title" @click.prevent="$openUrl(playlist.spotifyUrl)" v-if="playlist.spotifyUrl">
                        {{ playlist.name }}
                    </el-link>
                    <div v-else class="playlist-title">
                        {{ playlist.name }}
                    </div>
                    <div class="playlist-scope" v-if="!playlist.likedTracks">
                        <template v-if="playlist.ownedByMe">
                            <el-tag v-if="playlist.public" disable-transitions size="small">Public</el-tag>
                            <el-tag v-else type="warning" disable-transitions size="small">Private</el-tag>
                        </template>
                        <i v-else class="mdi mdi-heart mdi-16px text-danger"></i>
                    </div>
                </div>

                <div class="playlist-description" v-html="playlist.description" v-if="playlist.description"/>
                <div class="playlist-info">
                    <span v-if="!playlist.likedTracks">{{ playlist.ownerName }}</span>
                    <span>{{ playlist.tracks.length }} track{{ playlist.tracks.length ? 's' : '' }}</span>
                    <span>{{ $utils.playlist_duration(playlist.durationMs) }}</span>
                </div>
            </div>
            <div class="search">
                <el-input type="text" placeholder="Search ..." v-model="search" :prefix-icon="SearchIcon" />
            </div>
        </div>

        <el-table :data="tracks"
                  class="track-list mb-2"
                  max-height="78vh"
                  stripe>

            <el-table-column label="#" width="80" prop="sequence"/>

            <el-table-column label="Title" prop="title" class-name="track-title" width="300">
                <template v-slot:default="scope">
                    <div class="truncate">
                        <el-link @click.prevent="$openUrl(scope.row.spotifyUrl)" class="inline-link fw-bold">
                            {{ scope.row.name }}
                        </el-link>
                    </div>
                    <div class="truncate">
                        <template v-for="(artist, i) in scope.row.artists">
                            <span v-if="i > 0">, </span>
                            <el-link @click.prevent="$openUrl(artist.spotifyUrl)" class="inline-link fw-normal">
                                {{ artist.name }}
                            </el-link>
                        </template>
                    </div>
                </template>
            </el-table-column>

            <el-table-column label="Album" prop="album" class-name="track-album">
                <template v-slot:default="scope">
                    <div class="truncate">
                        <el-link @click.prevent="$openUrl(scope.row.album.spotifyUrl)" v-if="scope.row.album"
                                 class="inline-link fw-normal">
                            {{ scope.row.album.name }}
                        </el-link>
                    </div>
                </template>
            </el-table-column>

            <el-table-column prop="duration" width="80">
                <template v-slot:header>
                    <i class="mdi mdi-clock-outline"/>
                </template>
                <template v-slot:default="scope">
                    {{ $utils.track_duration(scope.row.durationMs) }}
                </template>
            </el-table-column>

            <el-table-column prop="youtubeId" width="80">
                <template v-slot:header>
                    <i class="mdi mdi-youtube text-danger mdi-18px"/>
                </template>
                <template v-slot:default="scope">
                    <el-link @click.prevent="$openUrl($utils.youtube_url(scope.row.youtubeId))" v-if="scope.row.youtubeId">
                        <i class="mdi mdi-open-in-new"/>
                    </el-link>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';
import { Search as SearchIcon } from '@element-plus/icons-vue'
import utils from "../Utils";

export default defineComponent({
    setup() {
        return {SearchIcon}
    },
    props: {
        playlist: {
            type: Object as PropType<PlaylistDto> | null,
            required: false
        }
    },
    computed: {
        tracks() {
            const s = utils.sanitize_string(this.search)
            if (!s) {
                return this.playlist.tracks
            }
            return this.playlist.tracks.filter(t => this.match(t, s))
        }
    },
    methods: {
        match(track : TrackDto, search: string): boolean {
            if (utils.sanitize_string(track.name).includes(search)) {
                return true
            }

            if (track.album && utils.sanitize_string(track.album.name).includes(search)) {
                return true
            }

            for (const a of track.artists) {
                if (utils.sanitize_string(a.name).includes(search)) {
                    return true
                }
            }

            return false
        }
    },
    data() {
        return {
            search: ''
        }
    },
    watch: {
        playlist() {
            this.search = ''
        }
    }
})
</script>

<style lang="scss" scoped>
.playlist-header {
    border-bottom: 1px solid var(--el-border-color-lighter);
    display: flex;
    align-items: end;

    .playlist-head {
        display: flex;
        align-items: center;
    }

    .playlist-title {
        font-weight: bolder;
        font-size: var(--el-font-size-extra-large);
        margin-right: 0.5rem;
    }

    div.playlist-title {
        color: var(--el-text-color-regular);
    }

    .playlist-description {
        color: var(--el-text-color-regular);
    }

    .playlist-info {
        font-size: var(--el-font-size-small);

        > span {
            display: inline-block;
            color: var(--el-text-color-regular);

            &:not(:last-child)::after {
                padding-right: 0.5rem;
                padding-left: 0.5rem;
                content: '•';
                color: var(--el-text-color-primary);
            }
        }
    }

    .search {
        margin-left: auto;
    }
}

.track-list {
    width: 100%;
}

.truncate {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}
</style>
<template>
    <div class="playlist-selector">

        <div class="playlist-selector-head">
            <el-checkbox label="All playlists"
                         :model-value="isAllChecked"
                         :indeterminate="isAllIndeterminate"
                         @change="handleCheckAll"/>
            <span class="info">{{ checkedPlaylists.size }}/{{ playlists.length }}</span>
        </div>

        <div class="playlist-selector-content">
            <div class="playlist-selector-item" v-for="playlist in playlists">
                <el-checkbox :label="playlist.name"
                             :model-value="isChecked(playlist)"
                             @change="s => handleCheck(playlist, s)" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';

export default defineComponent({
    props: {
        taskConfig: {
            type: Object as PropType<TaskConfigDto>,
            required: true
        },
        playlists: {
            type: Array as PropType<PlaylistDto[]>,
            required: true
        }
    },
    data() {
        const checkedPlaylists = <Set<string>>new Set()
        const existingIds = new Set(this.playlists.map(p => p.spotifyId))

        // only add valid id
        this.taskConfig.playlistIds.forEach(id => {
            if (existingIds.has(id)) {
                checkedPlaylists.add(id)
            }
        })

        return {checkedPlaylists}
    },
    computed: {
        isAllChecked() {
            return this.checkedPlaylists.size === this.playlists.length
        },

        isAllIndeterminate() {
            return this.checkedPlaylists.size > 0 && this.checkedPlaylists.size < this.playlists.length
        },

        isChecked() {
            return (p: PlaylistDto) => this.checkedPlaylists.has(p.spotifyId)
        }
    },
    methods: {
        handleCheckAll(s: boolean) {
            if (s) {
                for (const p of this.playlists) {
                    this.checkedPlaylists.add(p.spotifyId)
                }
            } else {
                this.checkedPlaylists.clear()
            }
            this._updateConfig()
        },

        handleCheck(p: PlaylistDto, s: boolean) {
            if (s) {
                this.checkedPlaylists.add(p.spotifyId)
            } else {
                this.checkedPlaylists.delete(p.spotifyId)
            }
            this._updateConfig()
        },

        _updateConfig() {
            this.taskConfig.playlistIds =  [...this.checkedPlaylists]

        }
    }
})
</script>

<style lang="scss">
.playlist-selector {
    overflow: hidden;
    background: var(--el-bg-color-overlay);
    display: inline-block;
    text-align: left;
    vertical-align: middle;
    width: 100%;
    max-height: 100%;
    box-sizing: border-box;
    position: relative;
}

.playlist-selector-head {
    display: flex;
    align-items: center;
    height: 40px;
    background: var(--el-fill-color-light);
    margin: 0;
    padding-left: 15px;
    border: 1px solid var(--el-border-color-lighter);
    border-top-left-radius: var(--el-border-radius-base);
    border-top-right-radius: var(--el-border-radius-base);
    box-sizing: border-box;
    position: relative;

    > .info {
        position: absolute;
        right: 15px;
        top: 50%;
        transform: translate3d(0, -50%, 0);
        color: var(--el-text-color-secondary);
        font-weight: normal;
    }
}

.playlist-selector-content {
    border: 1px solid var(--el-border-color-lighter);
    border-bottom-left-radius: var(--el-border-radius-base);
    border-bottom-right-radius: var(--el-border-radius-base);
    border-top: 0;
    padding: 6px 0;
}

.playlist-selector-item {
    height: 30px;
    line-height: 30px;
    padding-left: 15px;
    margin-right: 30px;

    .el-checkbox {
        display: block !important;
    }

    .el-checkbox__label {
        width: 100%;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }
}

</style>
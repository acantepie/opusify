<template>
    <el-page-header @back="$router.push({name: 'task'})" :icon="BackIcon">
        <template #content>
            <span class="title">Synchronize audio files with Youtube</span>
        </template>
    </el-page-header>

    <template v-if="loaded">

        <el-alert v-if="!this.library || this.library.playlists.length === 0" title="No playlist to synchronize" type="info" :closable="false" show-icon>
            <a class="text-primary" href @click.prevent="$router.push({name: 'task:spotify_library_sync'})">
                Synchronize my library with Spotify.
            </a>
        </el-alert>

        <div v-else>
            <el-form label-position="top"
                     class="task-form"
                     v-if="taskConfig"
                     :model="taskConfig"
                     :rules="formRules"
                     ref="form">

                <el-row>
                    <el-col :sm="12">

                        <div class="form-card">
                            <div class="form-title">System</div>
                            <div class="form-content">
                                <el-form-item label="FFmpeg binary location" required prop="ffmpegBinary" class="mb-0">
                                    <el-input v-model="taskConfig.ffmpegBinary">
                                        <template #prepend>
                                            <el-button @click="chooseFfmpegBinary" class="primary-btn">
                                                <i class="mdi mdi-folder"/>
                                            </el-button>
                                        </template>
                                    </el-input>
                                    <div class="form-help">
                                        FFmpeg is required to transcode your audio files. You can download latest version
                                        <a href="#" @click.prevent="$openUrl('https://ffmpeg.org/download.html')" class="text-primary">here</a>
                                    </div>
                                </el-form-item>
                            </div>
                        </div>

                        <div class="form-card">
                            <div class="form-title">Playlists</div>
                            <PlaylistSelector :playlists="library.playlists" :task-config="taskConfig" />
                        </div>

                    </el-col>

                    <el-col :sm="12">
                        <div class="form-card">
                            <div class="form-title">Output</div>
                            <div class="form-content">
                                <el-form-item label="Format" required>
                                    <el-select v-model="taskConfig.audioCodec" style="width: 100%">
                                        <el-option
                                            v-for="audioCodec in audioCodecs"
                                            :key="audioCodec.value"
                                            :label="audioCodec.label"
                                            :value="audioCodec.value"
                                        />
                                    </el-select>
                                </el-form-item>

                                <el-form-item label="Metadata" required>
                                    <el-select v-model="taskConfig.metadataMode" style="width: 100%">
                                        <el-option label="Use metadata from Spotify" value="spotify"/>
                                        <el-option label="Use metadata from Youtube" value="youtube"/>
                                    </el-select>
                                </el-form-item>

                                <el-form-item label="Directory" required prop="outputDir">
                                    <el-input v-model="taskConfig.outputDir">
                                        <template #prepend>
                                            <el-button @click="chooseOutputDir" class="primary-btn">
                                                <i class="mdi mdi-folder"/>
                                            </el-button>
                                        </template>
                                    </el-input>
                                </el-form-item>

                                <el-checkbox v-model="taskConfig.cleanOutputDir"
                                             label="Clean output directory (remove extra files)"/>
                            </div>
                        </div>
                    </el-col>
                </el-row>


            </el-form>

            <el-button type="primary" @click="start">
                <i class="mdi mdi-play-speed mdi-18px me-1"></i> Run
            </el-button>
        </div>
    </template>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import BackIcon from "../v-ui/BackIcon.vue";
import {FormInstance, FormRules} from "element-plus";
import PlaylistSelector from "./PlaylistSelector.vue";

export default defineComponent({
    components: {PlaylistSelector},
    setup() {
        return {BackIcon}
    },
    data() {
        return {
            loaded: false,
            taskConfig: null as TaskConfigDto,
            library: null as LibraryDto,
            audioCodecs: <{ value: string, label: string }[]>[],
            formRules: <FormRules>{
                ffmpegBinary: [
                    {required: true, trigger: 'blur'}
                ],
                outputDir: [
                    {required: true, trigger: 'blur'}
                ]
            }
        }
    },
    async created() {
        this.library = await window.api.invoke('library:get')
        this.taskConfig = await window.api.invoke('task-config:get')

        const settings = window.api.settings()

        // audio Formats
        for (let audioCodec of settings.audio_codec) {
            this.audioCodecs.push({
                value: audioCodec.value,
                label: audioCodec.label,
            })
        }

        this.loaded = true
    },
    methods: {
        async start() {
            const form = this.$refs.form as FormInstance

            try {
                await form.validate()
            } catch (e) {
                return // form is not valid => stop
            }

            // clone and remove proxy stuff
            const data = Object.assign({}, this.taskConfig)
            data.playlistIds = Array.from(this.taskConfig.playlistIds)

            await window.api.invoke('task-config:set', data)
            const task = <TaskDto>await window.api.invoke('task:start', 'youtube_file_sync')
            return this.$router.push({name: 'task:show', params: {id: task.id}})
        },

        async chooseFfmpegBinary() {
            const response = await window.api.invoke('choose:path', {
                title: 'Choose a file',
                properties: ['openFile']
            })
            if (!response.canceled && response.filePaths.length > 0) {
                this.taskConfig.ffmpegBinary = response.filePaths[0]
            }
        },

        async chooseOutputDir() {
            const response = await window.api.invoke('choose:path', {
                title: 'Choose a directory',
                properties: ['openDirectory', 'createDirectory']
            })
            if (!response.canceled && response.filePaths.length > 0) {
                this.taskConfig.outputDir = response.filePaths[0]
            }
        }
    }
})
</script>

<style lang="scss">
.form-card {
    margin-bottom: 1rem;
}

.form-help {
    color: var(--el-text-color-regular);
}

.form-title {
    color: var(--el-text-color-regular);
    font-weight: bold;
    margin-bottom: .4rem;
}

.form-content {
    padding: 8px 15px;
    background-color: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--el-border-radius-base);
}

</style>
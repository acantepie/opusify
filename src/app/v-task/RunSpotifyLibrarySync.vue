<template>
    <el-page-header @back="$router.push({name: 'task'})" :icon="BackIcon">
        <template #content>
            <span class="title">Synchronize library with Spotify</span>
        </template>
    </el-page-header>

    <el-alert
        title="Spotify sync."
        type="info"
        description="Before run this task, make sure you have recently authenticated to Spotify"
        :closable="false"
        show-icon
        class="mb-2">
    </el-alert>

    <div>
        <el-button type="default" @click="authOnSpotify">
            <i class="mdi mdi-lock-open me-1"></i> Authenticate
        </el-button>
        <el-button type="primary" @click="start">
            <i class="mdi mdi-play-speed mdi-18px me-1"></i> Run
        </el-button>
    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {ElLoading} from "element-plus";
import BackIcon from "../v-ui/BackIcon.vue";

export default defineComponent({
    setup() {
        return {BackIcon}
    },
    methods: {
        authOnSpotify() {
            ElLoading.service()
            window.api.send('spotify:login')
        },

        async start() {
            const task = <TaskDto>await window.api.invoke('task:start', 'spotify_library_sync')
            return this.$router.push({name: 'task:show', params: {id: task.id}})
        }
    },
    created() {
        window.api.receive('spotify:login:done', () => {
            ElLoading.service().close()
        })
    }
})
</script>
import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'
import Library from "./v-library/Library.vue";
import TaskHistory from "./v-task/TaskHistory.vue";
import TaskShow from "./v-task/TaskShow.vue";
import RunYoutubeFileSync from "./v-task/RunYoutubeFileSync.vue";
import RunSpotifyLibrarySync from "./v-task/RunSpotifyLibrarySync.vue";

export const createAppRouter = () => createRouter({
    linkActiveClass: "active",
    linkExactActiveClass: "exact-active",
    history: __APP_ENV__ === 'production' ? createWebHashHistory() : createWebHistory(),
    routes: [
        {
            name: 'index',
            path: '/',
            redirect: {name: 'library'}
        },
        {
            name: 'library',
            path: '/library',
            component: Library
        },
        {
            path: '/task',
            children: [
                {
                    path: '',
                    name: 'task',
                    component: TaskHistory
                },
                {
                    path: 'spotify-library-sync',
                    name: 'task:spotify_library_sync',
                    component: RunSpotifyLibrarySync
                },
                {
                    path: 'youtube-file-sync',
                    name: 'task:youtube_file_sync',
                    component: RunYoutubeFileSync
                },
                {
                    path: ':id',
                    name: 'task:show',
                    component: TaskShow,
                    props: true
                }
            ]
        },
    ]
})
<template>
    <el-row v-if="loaded">

        <el-col :sm="5">
            <div class="nav">
                <template v-if="!isRunning">
                    <div class="nav-item action-item" @click.prevent="$router.push({name: 'task:spotify_library_sync'})">
                        <div class="nav-item-inner">
                            <div>
                                <i class="mdi mdi-spotify me-2"></i>
                            </div>
                            <div>
                                <div class="fw-bold">Synchronize library</div>
                                <div class="small">Sync. your library with Spotify.</div>
                            </div>
                        </div>
                    </div>

                    <div class="nav-item divider-item"/>

                    <div class="nav-item action-item" @click.prevent="$router.push({name: 'task:youtube_file_sync'})">
                        <div class="nav-item-inner">
                            <div>
                                <i class="mdi mdi-youtube me-2 "></i>
                            </div>
                            <div>
                                <div class="fw-bold">Synchronize audio files</div>
                                <div class="small">Sync. files with youtube.</div>
                            </div>
                        </div>
                    </div>
                </template>
                <div v-else class="nav-item">
                    <el-alert class="nav-alert"
                              title="A task is running."
                              type="info"
                              description="Wait until the task end before start a new task."
                              :closable="false"
                              show-icon/>
                </div>
            </div>
        </el-col>

        <el-col :sm="19" class="task-history">
            <div class="toolbar">
                <div class="actions">
                    <el-button size="small" @click.prevent="deleteAll()">
                        <i class="mdi mdi-delete me-1"/> Delete all
                    </el-button>
                </div>
            </div>

            <el-table :data="tasks"
                      class="task-list"
                      max-height="80vh"
                      stripe
            >
                <el-table-column label="Name">
                    <template v-slot:default="scope">
                        <el-link @click="$router.push({name: 'task:show', params: {id: scope.row.id }})">
                            <span class="fw-bold">{{ $utils.task_name(scope.row) }}</span>
                        </el-link>
                        <div class="small">
                            {{ $utils.date(scope.row.startedAt).fromNow() }} &bull; {{ $utils.task_duration(scope.row) }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="Status" prop="status">
                    <template v-slot:default="scope">
                        <TaskStatus :status="scope.row.status"/>
                    </template>
                </el-table-column>
            </el-table>
        </el-col>
    </el-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TaskStatus from "./TaskStatus.vue";

export default defineComponent({
    components: {TaskStatus},
    data() {
        return {
            tasks: [] as TaskDto[],
            isRunning: false,
            loaded: false
        }
    },
    async created() {
        await this.loadTasks()

        window.api.receive('task:done', () => {
            this.loadTasks()
        })

        this.loaded = true
    },
    methods: {
        async loadTasks() {
            this.tasks = await window.api.invoke('task:all') as TaskDto[]
            this.tasks.sort((a, b) => b.id - a.id) // sort task (highest id first)
            this.isRunning = await window.api.invoke('task:is-running')
        },
        async deleteAll() {
            await window.api.invoke('task:delete:all')
            return this.loadTasks()
        }
    }
})
</script>

<style lang="scss" scoped>
.action-item {

    .nav-item-inner {
        display: flex;
        align-items: center;
    }

    i {
        font-size: 1.5rem;
    }
}
.toolbar {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;

    .actions {
        margin-left: auto;
    }
}

.task-list {
    width: 100%;
}
</style>
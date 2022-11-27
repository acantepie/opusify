<template>
    <template v-if="loaded">
        <el-page-header @back="$router.push({name: 'task'})" :icon="BackIcon">
            <template #content>
                <span class="title">{{ task ? $utils.task_name(task) : '-' }}</span>
            </template>
            <template #extra>
                <el-button size="small" @click="abort()" v-if="isRunning && task.type === 'youtube_file_sync'">
                    <i class="mdi mdi-stop me-1 text-danger"/> Stop
                </el-button>
                <el-button size="small" @click="createNew()">
                    <i class="mdi mdi-sync me-1"/> New
                </el-button>
            </template>
        </el-page-header>

        <div v-if="task" class="task-viewer">
            <div class="head">
                <div class="task-info">
                    <TaskStatus :status="task.status"/>
                    <span>{{ $utils.date(task.startedAt).fromNow() }}</span>
                    <span v-if="$utils.task_duration(task)">{{ $utils.task_duration(task) }}</span>
                </div>
                <div class="scroll-bottom" @click.prevent="scrollToBottom()">
                    <i class="mdi mdi-arrow-down mdi-18px"/>
                </div>
            </div>
            <div class="body">
                <el-scrollbar max-height="75vh" ref="scrollbar">
                    <div class="log-entry-group">
                        <TaskLogEntry v-for="childEntry in task.logEntries" :entry="childEntry" />
                    </div>
                    <div class="task-refreshing" v-if="null !== polling">
                        <span><i class="mdi mdi-circle"/></span>
                        <span><i class="mdi mdi-circle"/></span>
                        <span><i class="mdi mdi-circle"/></span>
                    </div>
                </el-scrollbar>
            </div>
        </div>
        <el-alert v-else
                  title="Unable to load task."
                  type="error"
                  description="This task doesn't exist anymore"
                  :closable="false"
                  show-icon/>
    </template>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import BackIcon from "../v-ui/BackIcon.vue";
import TaskStatus from "./TaskStatus.vue";
import TaskLogEntry from "./TaskLogEntry.vue";
import {ElNotification, ElScrollbar} from "element-plus";
import {generateLogSequence} from "./LogSequencer";

export default defineComponent({
    components: {TaskStatus, TaskLogEntry},
    setup() {
        return {BackIcon}
    },
    props: {
        id: String
    },
    data() {
        return {
            task: null as TaskDto | null,
            polling: null,
            loaded: false
        }
    },
    async created() {
        this.task = await window.api.invoke('task:find', parseInt(this.id))
        generateLogSequence(this.task)

        this.startPolling(500)
        this.loaded = true
    },
    beforeUnmount() {
        this.stopPolling()
    },
    computed: {
        isRunning(): boolean {
            return this.task && this.task.status === 'running'
        }
    },
    methods: {
        async createNew() {
            const type = this.task.type

            const isRunning = await window.api.invoke('task:is-running')

            if (isRunning) {
                return ElNotification({
                    title: 'A task is running',
                    message: 'Wait until the task end before start a new task.',
                    type: 'error',
                })
            }

            if (type === 'spotify_library_sync') {
                return this.$router.push({name: 'task:spotify_library_sync'})
            }

            if (type === 'youtube_file_sync') {
                return this.$router.push({name: 'task:youtube_file_sync'})
            }
        },
        startPolling(ms: number) {
            if (!this.isRunning) {
                return
            }

            this.polling = setInterval(async () => {
                try {
                    this.task = await window.api.invoke('task:find', parseInt(this.id))
                    generateLogSequence(this.task)

                    if (!this.isRunning) {
                        this.stopPolling()
                    }
                } catch (err) {
                    this.stopPolling()
                }
            }, ms)
        },

        stopPolling() {
            if (this.polling) {
                clearInterval(this.polling)
                this.polling = null
            }
        },

        scrollToBottom(): void {
            const scrollbar = this.$refs.scrollbar as InstanceType<typeof ElScrollbar>
            const wrapper = scrollbar.$el.firstChild as HTMLElement
            scrollbar.setScrollTop(wrapper.scrollHeight)
        },

        abort() {
            window.api.send('task:abort')
        }
    }

})
</script>

<style lang="scss">
$task-light: #ebeef5;
$task-dark: #8c959f;
$task-darker: #8c959f;
$task-hover: #464e59;

// ---- viewer ---- //

.task-viewer {
    font-size: var(--el-font-size-medium);
    border-radius: 0.25rem;
    background-color: #282c34;
    display: block;

    .head, .body {
        padding: 8px 12px;
    }

    .head {
        border-bottom: 1px solid $task-darker;
        display: flex;
        align-items: center;
    }

    .task-info {
        color: $task-light;
        font-size: var(--el-font-size-base);
        display: flex;
        align-items: center;

        & > *:not(:last-child):after {
            content: '•';
            padding: 0 0.3rem;
        }
    }

    .scroll-bottom {
        margin-left: auto;
        cursor: pointer;
        color: $task-light;
    }
}

// ---- Loader ---- //

.task-refreshing {
    padding: .2rem .5rem;
}

.task-refreshing span {
    color: $task-light;
    opacity: 0;
    animation: ellipsis-dot 2s infinite;
    font-size: 0.5em;
    margin-right: 0.2rem;
}

.task-refreshing span:nth-child(1) {
    animation-delay: 0.0s;
}

.task-refreshing span:nth-child(2) {
    animation-delay: 0.5s;
}

.task-refreshing span:nth-child(3) {
    animation-delay: 1s;
}

@keyframes ellipsis-dot {
    0% {
        opacity: 0.2;
    }
    50% {
        opacity: 1;
    }
    100% {
        opacity: 0.2;
    }
}

// ---- Log entry ---- //

$log-entry-spacer: 20px;

.log-entry {
    font-family: 'Roboto Mono', monospace;
    font-size: var(--el-font-size-small);
    line-height: 18px;
}

.log-entry-content {
    white-space: nowrap;
    margin-bottom: 0.15rem;

    &.has-child {
        cursor: pointer;
    }

    &:hover {
        background-color: $task-hover;
    }

    > * {
        display: inline-block;
        vertical-align:top;
    }

    .spacer-1 {
        width: $log-entry-spacer;
    }

    .spacer-2 {
        width: $log-entry-spacer * 2;
    }

    .spacer-3 {
        width: $log-entry-spacer * 3;
    }

    .expand-icon {
        color: $task-light;
        width: $log-entry-spacer;

        i::before {
            rotate: (0deg);
        }

        &.expanded i::before {
            rotate: (90deg);
        }
    }

    .sequence {
        color: $task-dark;
        width: 30px;
        text-align: right;
        margin-right: 20px;
    }

    .message-markup {
        margin-right: 10px;
    }

    .message {
        color: $task-light;
        white-space: pre;

        &.message-type-info {
            color: #76e3ea;
            font-weight: bolder;
        }
    }
}
</style>
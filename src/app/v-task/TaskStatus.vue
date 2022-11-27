<template>
    <div class="task-status">
        <i :class="icon"/>
        <span class="label" v-if="showText">{{ label }}</span>
    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
    props: {
        status: {
            type: String,
            required: true
        },
        showText: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        label(): string {
            return this.status.charAt(0).toUpperCase() + this.status.slice(1)

        },
        icon(): string | null {
            switch (this.status) {
                case 'pending':
                    return 'text-warning mdi mdi-pause-circle-outline'
                case 'running':
                    return 'text-primary mdi mdi-circle-slice-5'
                case 'done':
                    return 'text-success mdi mdi-check-circle-outline'
                case 'failed':
                    return 'text-danger mdi mdi-close-circle-outline'
                case 'aborted':
                    return 'text-danger mdi mdi-progress-alert'
                case 'interrupted':
                    return 'text-danger mdi mdi-progress-alert'
                default:
                    return ''
            }
        }
    }
})
</script>

<style lang="scss" scoped>
.task-status {
    display: flex;
    align-items: center;
}

.task-status .label {
    margin-left: 0.5rem;
    font-size: var(--el-font-size-base);
}

.task-status i {
    font-weight: bold;
    font-size: 1.2em;
}
</style>
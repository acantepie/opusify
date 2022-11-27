<template>
    <div class="log-entry">
        <div :class="entryContentCls" @click.prevent="toggleOpen()">
            <div class="sequence">{{ entry.sequence }}</div>
            <div :class="'spacer-' + level"/>
            <div class="expand-icon" :class="{expanded: open}" v-if="hasChild">
                <i class="mdi mdi-play"/>
            </div>
            <div v-if="entry.type === 'success'" class="message-markup text-success">
                <i class="mdi mdi-check mdi-bold"/>
            </div>
            <div v-else-if="entry.type === 'error'" class="message-markup text-danger fw-bold">
                Error
            </div>
            <div class="message" :class="'message-type-' + entry.type">
                {{ entry.message }}
            </div>
        </div>
        <div class="log-entry-group" v-if="hasChild" v-show="open">
            <TaskLogEntry v-for="childEntry in entry.logEntries" :entry="childEntry" :level="level + 1" />
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';

export default defineComponent({
    name: 'TaskLogEntry',
    props: {
        entry: {
            type: Object as PropType<TaskLogEntryDto>,
            required: true
        },
        level: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            open: true
        }
    },
    computed: {
        hasChild() {
            return this.entry.logEntries.length > 0
        },
        entryContentCls() {
            const cls = ['log-entry-content']
            if (this.hasChild) {
                cls.push('has-child')
            }
            if (this.open) {
                cls.push('open')
            }
            return cls
        }
    },
    methods: {
        toggleOpen() {
            if (this.hasChild) {
                this.open = !this.open
            }
        }
    }
})
</script>
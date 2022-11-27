<template>
    <div class="log-entry">
        <div :class="entryContentCls" @click.prevent="() => toggle()">
            <div class="sequence">{{ entry.sequence }}</div>
            <div :class="'spacer-' + level"/>
            <div class="expand-icon" :class="{expanded: opened}" v-if="hasChild">
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
        <div class="log-entry-group" v-if="hasChild" v-show="opened">
            <TaskLogEntry v-for="childEntry in entry.logEntries" :entry="childEntry" :level="level + 1" ref="childEntries"/>
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
            opened: true
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
        close() {
            this.opened = false

            if (this.hasChild) {
                for (const childEntry of this.$refs['childEntries'] as any[]) {
                    childEntry.close()
                }
            }
        },
        open() {
            this.opened = true
        },
        toggle() {
            if (!this.hasChild) {
                return false
            }

            if (this.opened) {
                this.close()
            } else {
                this.open()
            }
        }
    }
})
</script>
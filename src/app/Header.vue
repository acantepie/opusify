<template>
    <div class="header">
        <el-button-group>
            <router-link :to="{name: 'library'}" v-slot="{ navigate, isActive }" custom>
                <el-button @click="navigate" :type="isActive ? 'primary' : ''">
                    <i class="mdi mdi-playlist-music me-1 mdi-24px"/> My library
                </el-button>
            </router-link>
            <router-link :to="{name: 'task'}" v-slot="{ navigate, isActive }" custom>
                <el-button @click="navigate" :type="isActive ? 'primary' : ''">
                    <i class="mdi mdi-sync me-1 mdi-18px"/> Tasks
                </el-button>
            </router-link>
        </el-button-group>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
export default defineComponent({

})
</script>

<style lang="scss" scoped>
.header {
    padding: 0.5rem 0;
    text-align: center;
    position: fixed;
    width: 100%;
    background-color: var(--el-menu-bg-color);
    z-index: 10;

    button {
        width: 200px;
    }
}
</style>
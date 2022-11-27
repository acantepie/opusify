<template>
    <el-container>
        <el-header>
            <Header/>
        </el-header>
        <el-main>
            <div class="app-container">
                <router-view/>
            </div>
        </el-main>
    </el-container>
</template>

<script lang="ts">
import Header from "./Header.vue";

import {defineComponent} from "vue";

export default defineComponent({
    components: {Header},
})
</script>
import {rmSync} from 'fs'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-electron-plugin'
import {join} from "path";

rmSync('dist/electron', {recursive: true, force: true})

export default defineConfig({
    root: join(__dirname, '/src/app'),
    plugins: [
        vue({}),
        electron({
            include: ['src/electron'],
            outDir: join(__dirname, '/dist')
        }),
    ],
    build: {
        rollupOptions: {
            input: {
                index: join(__dirname, 'src/app/index.html'),
                oauthSuccess: join(__dirname, 'src/app/oauth_success.html'),
                oauthError: join(__dirname, 'src/app/oauth_error.html'),
            },
        },
        outDir: join(__dirname, '/dist/app')
    },
    assetsInclude: "src/electron/assets/*",
    clearScreen: false,
    define: {
        __APP_ENV__: JSON.stringify(process.env.NODE_ENV ?? 'development')
    }
})

/// <reference types="vite-electron-plugin/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    DIST_ELECTRON: string
    DIST: string
    USER_DIR: string,
    YOUTUBE_DL_BINARY: string,
    ASSET_ELECTRON: string,
    SPOTIFY_CLIENT_ID: string
  }
}

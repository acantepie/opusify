import {windowManager} from "./WindowManager";
import {app, BrowserWindow, globalShortcut, nativeImage, protocol} from 'electron'
import {release} from 'os'
import {join} from 'path'
import {ipcEventHandler} from "./ipc/IpcEventHandler";
import {SPOTIFY_OAUTH_PROTOCOL} from "./spotify/SpotifyClient";
import {spotifyOAuthHandler} from "./spotify/SpotifyOAuthHandler";
import {storage} from "./storage/Storage";
import {configureLogger, logger} from "./Logger";
import {TaskStatusEnum} from "./dto/Task";
import {settings} from "./settings";

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

process.env.DIST_ELECTRON = join(__dirname)
process.env.DIST = join(__dirname, '../app')
process.env.USER_DIR = app.isPackaged ? app.getPath('userData') : join(__dirname, '../../var')
process.env.ASSET_ELECTRON = app.isPackaged
    ? join(process.env.DIST_ELECTRON, 'assets/')
    : join(__dirname, '../../src/electron/assets')

if (!app.isPackaged) {
    process.env.YOUTUBE_DL_BINARY = join(__dirname, '../../src/youtube-dl/youtube-dl.py')
} else if(process.platform === 'win32') {
    process.env.YOUTUBE_DL_BINARY = join(app.getPath("exe"), '../youtube-dl/youtube-dl.exe')
} else {
    process.env.YOUTUBE_DL_BINARY = join(app.getPath("exe"), '../youtube-dl/youtube-dl')
}

process.env.SPOTIFY_CLIENT_ID = app.commandLine.hasSwitch('spotify-id')
    ? app.commandLine.getSwitchValue('spotify-id')
    : settings.spotify.client_id

class Main {
    enableDebugTools: boolean

    constructor() {
        this.enableDebugTools = app.commandLine.hasSwitch('dev-tools') || !app.isPackaged

        this._onReady = this._onReady.bind(this)
        this._onActivate = this._onActivate.bind(this)
        this._onAllWindowClosed = this._onAllWindowClosed.bind(this)
    }

    start() {
        logger.info('User directory : ' + process.env.USER_DIR)
        storage.configure()

        // FIXME : find a better way
        // At this point a task can't have status "running"
        // if a task is marked as "running" => then mark this one as interrupted
        const tasks = storage.getTasks()
        for (let t of tasks) {
            if (t.status === TaskStatusEnum.running) {
                t.status = TaskStatusEnum.interrupted
            }
        }

        // Disable GPU Acceleration for Windows 7
        if (release().startsWith('6.1')) {
            app.disableHardwareAcceleration()
        }

        // Set application name for Windows 10+ notifications
        if (process.platform === 'win32') {
            app.setAppUserModelId(app.getName())
        }

        if (!app.requestSingleInstanceLock()) {
            app.quit()
            process.exit(0)
        }

        app.on('ready', this._onReady)
        app.on('window-all-closed', this._onAllWindowClosed)
        app.on('activate', this._onActivate)

        ipcEventHandler.register()
    }

    private async _createMainWindow() {
        const win = new BrowserWindow({
            title: 'Main window',
            icon: process.platform === 'linux' ? nativeImage.createFromPath(join(process.env.ASSET_ELECTRON, 'icon-32x32.png')) : undefined,
            height: 800,
            width: 1280,
            webPreferences: {
                preload: join(__dirname, 'preload.js'),
                nodeIntegration: false,
                contextIsolation: true,
                sandbox: false
            },
        })

        win.setMenu(null)

        if (app.isPackaged) {
            await win.loadFile(join(process.env.DIST, 'index.html'))
        } else {
            await win.loadURL(process.env.VITE_DEV_SERVER_URL)
        }

        if (this.enableDebugTools) {
            win.webContents.openDevTools()
        }

        win.on('closed', () => {
            for (const w of BrowserWindow.getAllWindows()) {
                w.close()
            }
        })

        windowManager.addWindow('main', win)
    }

    private async _onReady() {
        this._registerProtocols()
        this._configureShortcuts()
        await this._createMainWindow()
    }

    private async _onActivate() {
        if (!windowManager.exists('main')) {
            await this._createMainWindow()
        }
    }

    private _onAllWindowClosed() {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    }

    private _registerProtocols() {
        protocol.registerHttpProtocol(SPOTIFY_OAUTH_PROTOCOL, (request, respond) => spotifyOAuthHandler.handleLoginRequest(request, respond))
    }

    private _configureShortcuts() {
        if (this.enableDebugTools) {
            globalShortcut.register('CmdOrCtrl+R', () => {
                const w = BrowserWindow.getFocusedWindow()
                if (w) {
                    w.reload()
                }
            })

            const accDevTools = process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I';
            globalShortcut.register(accDevTools, () => {
                const w = BrowserWindow.getFocusedWindow()
                if (w) {
                    w.webContents.toggleDevTools()
                }
            })
        }

        const accFullscreen = process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11';
        globalShortcut.register(accFullscreen, () => {
            const w = BrowserWindow.getFocusedWindow()
            if (w) {
                w.setFullScreen(!w.isFullScreen())
            }
        })

    }
}

configureLogger()

const main = new Main()
main.start()
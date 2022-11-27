export enum IpcEvents {
    LIBRARY_GET = 'library:get',

    TASK_CONFIG_GET = 'task-config:get',
    TASK_CONFIG_SET = 'task-config:set',

    TASK_START = 'task:start',
    TASK_ALL = 'task:all',
    TASK_FIND = 'task:find',
    TASK_IS_RUNNING = 'task:is-running',
    TASK_DONE = 'task:done', // main to renderer
    TASK_DELETE_ALL = 'task:delete:all',
    TASK_ABORT = 'task:abort',

    SPOTIFY_LOGIN = 'spotify:login',
    SPOTIFY_LOGIN_DONE = 'spotify:login:done', // main to renderer

    OPEN_EXTERNAL_URL = 'open:external:url',

    CHOOSE_PATH = 'choose:path'

}
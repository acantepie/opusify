import { contextBridge } from 'electron'
import Api from "./ipc/Api";

contextBridge.exposeInMainWorld('api', Api)

// ----------------------------------------------------------------------
function offLoader() {
    const loader = document.getElementById('app--loader')
    if (loader) {
        loader.remove()
    }
}

window.onmessage = ev => {
    if (ev.data.payload === 'removeLoading') {
        offLoader()
    }
}

setTimeout(offLoader, 5999)
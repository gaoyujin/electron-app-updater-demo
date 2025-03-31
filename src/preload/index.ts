import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // 检查更新
  checkForUpdates: (): void => {
    ipcRenderer.send('check-for-updates')
  },
  // 监听更新下载进度
  onUpdateDownloadProgress: (callback: (progressObj: any) => void): void => {
    ipcRenderer.on('update-download-progress', (_event, progressObj) => callback(progressObj))
  },
  // 移除更新下载进度监听
  removeUpdateDownloadProgressListener: (): void => {
    ipcRenderer.removeAllListeners('update-download-progress')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

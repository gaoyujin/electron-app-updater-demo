import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // 检查更新
  checkForUpdates: (): void => {
    ipcRenderer.send('check-for-updates')
  },
  
  // 下载更新
  downloadUpdate: (): void => {
    ipcRenderer.send('download-update')
  },
  
  // 安装更新
  installUpdate: (): void => {
    ipcRenderer.send('install-update')
  },
  
  // 有更新可用事件
  onUpdateAvailable: (callback: (info: any) => void): void => {
    ipcRenderer.on('update-available', (_event, info) => callback(info))
  },
  
  // 没有更新可用事件
  onUpdateNotAvailable: (callback: () => void): void => {
    ipcRenderer.on('update-not-available', () => callback())
  },
  
  // 更新下载完成事件
  onUpdateDownloaded: (callback: () => void): void => {
    ipcRenderer.on('update-downloaded', () => callback())
  },
  
  // 更新错误事件
  onUpdateError: (callback: (error: any) => void): void => {
    ipcRenderer.on('update-error', (_event, error) => callback(error))
  },
  
  // 监听更新下载进度
  onUpdateDownloadProgress: (callback: (progressObj: any) => void): void => {
    ipcRenderer.on('update-download-progress', (_event, progressObj) => callback(progressObj))
  },
  
  // 移除所有更新监听
  removeUpdateListeners: (): void => {
    ipcRenderer.removeAllListeners('update-available')
    ipcRenderer.removeAllListeners('update-not-available')
    ipcRenderer.removeAllListeners('update-downloaded')
    ipcRenderer.removeAllListeners('update-error')
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

import { ElectronAPI } from '@electron-toolkit/preload'

// 更新API接口类型
interface API {
  checkForUpdates: () => void
  downloadUpdate: () => void
  installUpdate: () => void
  onUpdateAvailable: (callback: (info: any) => void) => void
  onUpdateNotAvailable: (callback: () => void) => void
  onUpdateDownloaded: (callback: () => void) => void
  onUpdateError: (callback: (error: any) => void) => void
  onUpdateDownloadProgress: (callback: (progressObj: any) => void) => void
  removeUpdateListeners: () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}

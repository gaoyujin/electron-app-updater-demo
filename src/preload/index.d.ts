import { ElectronAPI } from '@electron-toolkit/preload'

// 更新API接口类型
interface API {
  checkForUpdates: () => void
  onUpdateDownloadProgress: (callback: (progressObj: any) => void) => void
  removeUpdateDownloadProgressListener: () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}

import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

// 配置日志
log.transports.file.level = 'debug'
// 确保开发模式下也能在控制台看到日志
log.transports.console.level = 'debug'
autoUpdater.logger = log

// 配置自动更新
autoUpdater.autoDownload = false
// 强制在开发环境中启用更新检查
autoUpdater.allowPrerelease = true
autoUpdater.forceDevUpdateConfig = true
// 直接设置更新服务器地址
autoUpdater.setFeedURL({
  provider: 'generic',
  url: 'http://localhost:3000/download'
})
// 是否是开发环境
const isDev = is.dev

// 是否是手动检查更新
let isManualCheck = false
// 是否正在显示更新对话框
let isShowingUpdateDialog = false
// 是否正在检查更新
let isCheckingForUpdates = false

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // 设置自动更新事件
  // 允许在开发环境和生产环境下都可以测试更新功能
  setupAutoUpdater(mainWindow)
}

// 设置自动更新
function setupAutoUpdater(mainWindow: BrowserWindow): void {
  // 检查更新出错
  autoUpdater.on('error', (err) => {
    log.error('更新错误', err)
    dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: '更新错误',
      message: '检查更新失败',
      detail: err.message
    })
  })

  // 有可用更新
  autoUpdater.on('update-available', (info) => {
    log.info('有可用更新', info)

    // 如果已经显示对话框，则不再显示
    if (isShowingUpdateDialog) {
      log.info('已经在显示更新对话框，跳过显示')
      return
    }

    isShowingUpdateDialog = true
    dialog
      .showMessageBox(mainWindow, {
        type: 'info',
        title: '发现新版本',
        message: `发现新版本 ${info.version}`,
        detail: `当前版本：${app.getVersion()}\n是否现在下载更新？`,
        buttons: ['是', '否'],
        cancelId: 1
      })
      .then(({ response }) => {
        isShowingUpdateDialog = false
        if (response === 0) {
          autoUpdater.downloadUpdate()
        }
      })
  })

  // 没有可用更新
  autoUpdater.on('update-not-available', () => {
    log.info('没有可用更新')
    if (isManualCheck && !isShowingUpdateDialog) {
      isShowingUpdateDialog = true
      dialog
        .showMessageBox(mainWindow, {
          type: 'info',
          title: '没有更新',
          message: '已经是最新版本'
        })
        .then(() => {
          isShowingUpdateDialog = false
        })
      isManualCheck = false
    }
  })

  // 更新下载进度
  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow.webContents.send('update-download-progress', progressObj)
  })

  // 更新下载完成
  autoUpdater.on('update-downloaded', () => {
    if (isShowingUpdateDialog) {
      log.info('已经在显示更新对话框，跳过显示')
      return
    }

    isShowingUpdateDialog = true
    dialog
      .showMessageBox(mainWindow, {
        type: 'info',
        title: '更新已下载',
        message: '更新已下载，将在退出时安装',
        buttons: ['立即重启', '稍后重启'],
        cancelId: 1
      })
      .then(({ response }) => {
        isShowingUpdateDialog = false
        if (response === 0) {
          autoUpdater.quitAndInstall(false, true)
        }
      })
  })

  // 检查更新
  setTimeout(() => {
    // 如果已经在检查更新，则跳过
    if (isCheckingForUpdates) {
      log.info('已经在检查更新，跳过自动检查')
      return
    }

    isCheckingForUpdates = true
    log.info('自动检查更新，当前配置:', {
      appPath: app.getAppPath(),
      appName: app.getName(),
      appVersion: app.getVersion(),
      isDev: isDev,
      forceDevUpdateConfig: autoUpdater.forceDevUpdateConfig,
      allowPrerelease: autoUpdater.allowPrerelease
    })

    autoUpdater
      .checkForUpdates()
      .then((result) => {
        log.info('自动检查更新结果:', result)
        isCheckingForUpdates = false
      })
      .catch((err) => {
        log.error('自动检查更新出错', err)
        isCheckingForUpdates = false
      })
  }, 3000)
}

// 添加检查更新的IPC通信
ipcMain.on('check-for-updates', () => {
  // 如果已经在检查更新，则跳过
  if (isCheckingForUpdates) {
    log.info('已经在检查更新，跳过手动检查')
    return
  }

  // 标记为手动检查更新
  isManualCheck = true
  isCheckingForUpdates = true

  // 允许在开发环境中也测试更新功能
  log.info('手动检查更新，当前配置:', {
    appPath: app.getAppPath(),
    appName: app.getName(),
    appVersion: app.getVersion(),
    isDev: isDev,
    forceDevUpdateConfig: autoUpdater.forceDevUpdateConfig,
    allowPrerelease: autoUpdater.allowPrerelease
  })

  autoUpdater
    .checkForUpdates()
    .then((result) => {
      log.info('检查更新结果:', result)
      isCheckingForUpdates = false
    })
    .catch((err) => {
      log.error('手动检查更新出错', err)
      isCheckingForUpdates = false
    })
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

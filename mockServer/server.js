const express = require('express')
const path = require('path')
const cors = require('cors')
const morgan = require('morgan')
const fs = require('fs')
const yaml = require('js-yaml')

const app = express()
const PORT = 3000

// 获取 latest.yml 的信息
function getLatestVersionInfo() {
  try {
    const ymlPath = path.join(__dirname, 'latest.yml')
    const ymlContent = fs.readFileSync(ymlPath, 'utf8')
    const ymlData = yaml.load(ymlContent)
    return ymlData
  } catch (error) {
    console.error('读取 latest.yml 失败:', error)
    return { version: '1.0.0', path: 'electron-app-updater-demo-1.0.0-setup.exe' }
  }
}

// 中间件
app.use(cors()) // 允许跨域请求
app.use(morgan('dev')) // 请求日志记录
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 静态文件目录，提供 latest.yml 和 安装文件访问
app.use('/download', express.static(path.join(__dirname)))

// 获取更新信息的路由
app.get('/update-info', (req, res) => {
  try {
    const ymlContent = fs.readFileSync(path.join(__dirname, 'latest.yml'), 'utf8')
    res.send({
      success: true,
      data: ymlContent,
      message: '获取更新信息成功'
    })
  } catch (error) {
    res.status(500).send({
      success: false,
      message: '获取更新信息失败',
      error: error.message
    })
  }
})

// 根路由
app.get('/', (req, res) => {
  res.send('Electron 更新服务器运行中...')
})

// 启动服务器
app.listen(PORT, () => {
  const versionInfo = getLatestVersionInfo()

  console.log(`更新服务器运行在 http://localhost:${PORT}`)
  console.log(`- 版本: ${versionInfo.version}`)
  console.log(`- latest.yml 文件地址: http://localhost:${PORT}/download/latest.yml`)
  console.log(`- 安装文件地址: http://localhost:${PORT}/download/${versionInfo.path}`)
})

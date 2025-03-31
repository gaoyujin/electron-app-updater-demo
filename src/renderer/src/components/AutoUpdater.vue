<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import UpdateModal from './UpdateModal.vue'

// 检查更新状态
const isCheckingForUpdate = ref(false)

// 下载进度
const progressPercent = ref(0)
const progressBytesPerSecond = ref(0)

// 模态框控制
const showModal = ref(false)
const modalType = ref<'available' | 'not-available' | 'downloaded' | 'error'>('available')
const modalVersion = ref('')
const modalMessage = ref('')

// 检查更新
const checkForUpdates = (): void => {
  if (isCheckingForUpdate.value) return
  
  console.log('检查更新')
  isCheckingForUpdate.value = true
  window.api.checkForUpdates()
  
  // 5秒后自动重置状态
  setTimeout(() => {
    isCheckingForUpdate.value = false
  }, 5000)
}

// 事件处理函数
const handleUpdateAvailable = (info: any): void => {
  console.log('收到更新可用事件', info)
  modalType.value = 'available'
  modalVersion.value = info.version
  showModal.value = true
}

const handleUpdateNotAvailable = (): void => {
  console.log('收到没有更新事件')
  modalType.value = 'not-available'
  showModal.value = true
}

const handleUpdateDownloaded = (): void => {
  console.log('收到更新下载完成事件')
  modalType.value = 'downloaded'
  showModal.value = true
}

const handleUpdateError = (error: any): void => {
  console.log('收到更新错误事件', error)
  modalType.value = 'error'
  modalMessage.value = error.message || '更新过程中发生错误'
  showModal.value = true
}

// 监听下载进度
const handleUpdateProgress = (progressObj: any): void => {
  console.log('收到更新进度', progressObj)
  progressPercent.value = Math.round(progressObj.percent)
  progressBytesPerSecond.value = Math.round(progressObj.bytesPerSecond / 1024)
  
  // 确保进度更新时模态框是显示的
  if (progressPercent.value > 0 && !showModal.value) {
    modalType.value = 'available'
    showModal.value = true
  }
}

// 模态框事件处理
const handleCloseModal = (): void => {
  console.log('关闭模态框')
  showModal.value = false
  // 如果是下载中状态关闭，保留进度信息
  if (modalType.value !== 'available' || progressPercent.value === 0) {
    // 重置进度
    progressPercent.value = 0
    progressBytesPerSecond.value = 0
  }
}

const handleDownload = (): void => {
  console.log('触发下载更新')
  window.api.downloadUpdate()
  // 不关闭模态框，等待显示下载进度
}

const handleInstall = (): void => {
  console.log('触发安装更新')
  window.api.installUpdate()
}

onMounted(() => {
  console.log('挂载更新监听器')
  // 监听更新事件
  window.api.onUpdateAvailable(handleUpdateAvailable)
  window.api.onUpdateNotAvailable(handleUpdateNotAvailable)
  window.api.onUpdateDownloaded(handleUpdateDownloaded)
  window.api.onUpdateError(handleUpdateError)
  window.api.onUpdateDownloadProgress(handleUpdateProgress)
})

onUnmounted(() => {
  // 移除监听
  window.api.removeUpdateListeners()
})
</script>

<template>
  <div class="auto-updater">
    <div class="update-button">
      <button :disabled="isCheckingForUpdate" @click="checkForUpdates">
        {{ isCheckingForUpdate ? '检查中...' : '检查更新' }}
      </button>
    </div>
    
    <!-- 更新模态框 -->
    <UpdateModal
      :show="showModal"
      :type="modalType"
      :version="modalVersion"
      :progress="progressPercent"
      :download-speed="progressBytesPerSecond"
      :message="modalMessage"
      @close="handleCloseModal"
      @download="handleDownload"
      @install="handleInstall"
    />
  </div>
</template>

<style scoped>
.auto-updater {
  margin-top: 20px;
}

.update-button button {
  background-color: #42b8f5;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.update-button button:hover {
  background-color: #3ca9e2;
}

.update-button button:disabled {
  background-color: #8ccdf8;
  cursor: not-allowed;
}
</style>

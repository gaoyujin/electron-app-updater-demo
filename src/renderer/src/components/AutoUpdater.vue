<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const showUpdateProgress = ref(false)
const progressPercent = ref(0)
const progressBytesPerSecond = ref(0)
const isCheckingForUpdate = ref(false)

// 检查更新
const checkForUpdates = (): void => {
  isCheckingForUpdate.value = true
  window.api.checkForUpdates()
  setTimeout(() => {
    isCheckingForUpdate.value = false
  }, 5000) // 5秒后自动重置状态
}

// 监听下载进度
const handleUpdateProgress = (progressObj: any): void => {
  showUpdateProgress.value = true
  progressPercent.value = Math.round(progressObj.percent)
  progressBytesPerSecond.value = Math.round(progressObj.bytesPerSecond / 1024)
}

onMounted(() => {
  // 监听更新下载进度
  window.api.onUpdateDownloadProgress(handleUpdateProgress)
})

onUnmounted(() => {
  // 移除监听
  window.api.removeUpdateDownloadProgressListener()
})
</script>

<template>
  <div class="auto-updater">
    <div class="update-button">
      <button @click="checkForUpdates" :disabled="isCheckingForUpdate">
        {{ isCheckingForUpdate ? '检查中...' : '检查更新' }}
      </button>
    </div>

    <div v-if="showUpdateProgress" class="update-progress">
      <div class="progress-text">下载进度: {{ progressPercent }}%</div>
      <div class="progress-bar">
        <div class="progress-inner" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <div class="progress-speed">速度: {{ progressBytesPerSecond }} KB/s</div>
    </div>
  </div>
</template>

<style scoped>
.auto-updater {
  margin-top: 20px;
  padding: 15px;
  border-radius: 8px;
  background-color: #f5f5f5;
  width: 100%;
  max-width: 500px;
}

.update-button button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.update-button button:hover {
  background-color: #0069d9;
}

.update-button button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.update-progress {
  margin-top: 15px;
}

.progress-text, .progress-speed {
  font-size: 14px;
  margin: 5px 0;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background-color: #e9ecef;
  border-radius: 5px;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  background-color: #28a745;
  transition: width 0.3s ease;
}
</style> 
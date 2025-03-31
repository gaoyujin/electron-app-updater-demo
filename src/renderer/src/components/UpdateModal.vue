<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  show: boolean
  type: 'available' | 'not-available' | 'downloaded' | 'error'
  version?: string
  progress?: number
  downloadSpeed?: number
  message?: string
}>()

const emit = defineEmits<{
  close: []
  download: []
  install: []
}>()

// 标题和图标计算属性
const modalTitle = computed(() => {
  switch (props.type) {
    case 'available':
      return '发现新版本'
    case 'not-available':
      return '已是最新版本'
    case 'downloaded':
      return '更新已准备好'
    case 'error':
      return '更新出错'
    default:
      return '更新提示'
  }
})

const iconClass = computed(() => {
  switch (props.type) {
    case 'available':
      return 'icon-info'
    case 'not-available':
      return 'icon-success'
    case 'downloaded':
      return 'icon-success'
    case 'error':
      return 'icon-error'
    default:
      return 'icon-info'
  }
})

// 渐变背景计算属性
const gradientBg = computed(() => {
  switch (props.type) {
    case 'available':
      return 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)'
    case 'not-available':
      return 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)'
    case 'downloaded':
      return 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)'
    case 'error':
      return 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)'
    default:
      return 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)'
  }
})

// 进度条样式
const progressWidth = computed(() => {
  return `${props.progress || 0}%`
})

// 关闭模态框
const handleClose = () => {
  emit('close')
}

// 下载更新
const handleDownload = () => {
  emit('download')
}

// 安装更新
const handleInstall = () => {
  emit('install')
}
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-container" :style="{ backgroundImage: gradientBg }">
      <div class="modal-header">
        <div class="modal-title">
          <div :class="['modal-icon', iconClass]"></div>
          <h2>{{ modalTitle }}</h2>
        </div>
        <button class="close-button" @click="handleClose">×</button>
      </div>
      
      <div class="modal-body">
        <div v-if="type === 'available'">
          <p class="message">发现新版本 {{ version }}</p>
          <p class="description">是否现在下载更新？</p>
        </div>
        
        <div v-else-if="type === 'not-available'">
          <p class="message">当前已经是最新版本</p>
          <p class="description">无需更新</p>
        </div>
        
        <div v-else-if="type === 'downloaded'">
          <p class="message">更新已下载完成</p>
          <p class="description">重启应用以安装更新</p>
        </div>
        
        <div v-else-if="type === 'error'">
          <p class="message">更新过程中出错</p>
          <p class="description">{{ message || '请稍后再试' }}</p>
        </div>
        
        <div v-if="progress !== undefined && progress > 0" class="progress-container">
          <div class="progress-bar">
            <div class="progress-inner" :style="{ width: progressWidth }"></div>
          </div>
          <div class="progress-text">{{ progress }}%</div>
          <div v-if="downloadSpeed" class="speed-text">{{ downloadSpeed }} KB/s</div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button v-if="type === 'available'" class="btn btn-primary" @click="handleDownload">
          下载更新
        </button>
        <button v-if="type === 'available' || type === 'error'" class="btn btn-secondary" @click="handleClose">
          下次再说
        </button>
        <button v-if="type === 'not-available'" class="btn btn-primary" @click="handleClose">
          我知道了
        </button>
        <button v-if="type === 'downloaded'" class="btn btn-primary" @click="handleInstall">
          立即重启
        </button>
        <button v-if="type === 'downloaded'" class="btn btn-secondary" @click="handleClose">
          稍后重启
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.modal-container {
  width: 420px;
  max-width: 90%;
  background-color: #2c3e50;
  border-radius: 10px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  color: white;
  animation: slideIn 0.3s ease-out;
}

.modal-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-title h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.modal-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.icon-info::before,
.icon-success::before,
.icon-error::before {
  content: '';
  position: absolute;
  display: block;
}

.icon-info {
  background-color: rgba(66, 139, 202, 0.2);
}

.icon-info::before {
  width: 4px;
  height: 4px;
  background-color: #42b8f5;
  border-radius: 50%;
  top: 6px;
}

.icon-info::after {
  content: '';
  position: absolute;
  width: 2px;
  height: 8px;
  background-color: #42b8f5;
  bottom: 5px;
  left: 11px;
}

.icon-success {
  background-color: rgba(76, 217, 100, 0.2);
}

.icon-success::before {
  width: 6px;
  height: 10px;
  border-right: 2px solid #4cd964;
  border-bottom: 2px solid #4cd964;
  transform: rotate(45deg);
  top: 5px;
  left: 8px;
}

.icon-error {
  background-color: rgba(255, 59, 48, 0.2);
}

.icon-error::before {
  width: 12px;
  height: 2px;
  background-color: #ff3b30;
  transform: rotate(45deg);
  top: 11px;
  left: 6px;
}

.icon-error::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 2px;
  background-color: #ff3b30;
  transform: rotate(-45deg);
  top: 11px;
  left: 6px;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: color 0.2s;
  line-height: 1;
  padding: 0;
  margin: 0;
}

.close-button:hover {
  color: white;
}

.modal-body {
  padding: 20px;
}

.message {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.description {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.progress-container {
  margin-top: 20px;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-inner {
  height: 100%;
  background-color: #42b8f5;
  border-radius: 5px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3px;
}

.speed-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.modal-footer {
  padding: 15px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn {
  padding: 8px 16px;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background-color: #42b8f5;
  color: white;
}

.btn-primary:hover {
  background-color: #3ca9e2;
}

.btn-secondary {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.25);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style> 
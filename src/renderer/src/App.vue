<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Versions from './components/Versions.vue'
import AutoUpdater from './components/AutoUpdater.vue'

const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
const hasCheckedUpdate = ref(false)

// 组件挂载后自动检查更新
onMounted(() => {
  // 延迟几秒后检查更新，确保应用已经完全加载
  // 并且只检查一次，避免重复检查
  if (!hasCheckedUpdate.value) {
    setTimeout(() => {
      window.api.checkForUpdates()
      hasCheckedUpdate.value = true
    }, 2000)
  }
})
</script>

<template>
  <div class="container">
    <img alt="logo" class="logo" src="./assets/electron.svg" />
    <div class="creator">Powered by electron-vite</div>
    <div class="text">
      Build an Electron app with
      <span class="vue">Vue</span>
      and
      <span class="ts">TypeScript</span>
    </div>
    <p class="tip">Please try pressing <code>F12</code> to open the devTool</p>
    <div class="actions">
      <div class="action">
        <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">Documentation</a>
      </div>
      <div class="action">
        <a target="_blank" rel="noreferrer" @click="ipcHandle">Send IPC</a>
      </div>
    </div>
    <Versions />
    <AutoUpdater />
  </div>
</template>

<style>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
}
</style>

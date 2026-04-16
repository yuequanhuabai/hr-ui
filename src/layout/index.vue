<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import {
  useAppStore,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_MIN_WIDTH,
  SIDEBAR_MAX_WIDTH
} from '@/store/modules/app'
import AppMain from './components/AppMain.vue'
import Sidebar from './components/Sidebar/index.vue'
import Navbar from './components/Navbar.vue'
import TagsView from './components/TagsView.vue'

const appStore = useAppStore()

const collapsed = computed(() => appStore.sidebarCollapsed)
const asideWidth = computed(
  () => (collapsed.value ? SIDEBAR_COLLAPSED_WIDTH : appStore.sidebarWidth) + 'px'
)

const isDragging = ref(false)
let startX = 0
let startWidth = 0

function onResizerMouseDown(e: MouseEvent) {
  if (collapsed.value) return
  isDragging.value = true
  startX = e.clientX
  startWidth = appStore.sidebarWidth
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  e.preventDefault()
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  const next = startWidth + (e.clientX - startX)
  appStore.sidebarWidth = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, next))
}

function onMouseUp() {
  if (!isDragging.value) return
  isDragging.value = false
  appStore.setSidebarWidth(appStore.sidebarWidth)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
})
</script>

<template>
  <el-container class="layout">
    <el-aside
      class="layout-aside"
      :class="{ 'is-dragging': isDragging }"
      :width="asideWidth"
    >
      <div class="logo">{{ collapsed ? 'HR' : '人事管理系統' }}</div>
      <Sidebar />
      <div
        v-if="!collapsed"
        class="layout-aside__resizer"
        title="拖拽調整寬度"
        @mousedown="onResizerMouseDown"
      />
    </el-aside>

    <el-container direction="vertical" class="layout-main">
      <Navbar />
      <TagsView />
      <AppMain />
    </el-container>
  </el-container>
</template>

<style scoped>
.layout {
  height: 100vh;
}
.layout-aside {
  position: relative;
  background: #304156;
  color: #bfcbd9;
  transition: width 0.2s;
  overflow: hidden;
  flex-shrink: 0;
}
.layout-aside.is-dragging {
  transition: none;
  user-select: none;
}
.layout-aside__resizer {
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  cursor: col-resize;
  z-index: 10;
  background: transparent;
  transition: background 0.15s;
}
.layout-aside__resizer:hover,
.layout-aside.is-dragging .layout-aside__resizer {
  background: #409eff;
}
.layout-main {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
.logo {
  height: 50px;
  line-height: 50px;
  text-align: center;
  color: #fff;
  font-weight: 600;
  background: #2b3a4a;
  white-space: nowrap;
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'
import AppMain from './components/AppMain.vue'
import Sidebar from './components/Sidebar/index.vue'
import Navbar from './components/Navbar.vue'
import TagsView from './components/TagsView.vue'

const appStore = useAppStore()

const collapsed = computed(() => appStore.sidebarCollapsed)
const asideWidth = computed(() => (collapsed.value ? '64px' : '210px'))
</script>

<template>
  <el-container class="layout">
    <el-aside class="layout-aside" :width="asideWidth">
      <div class="logo">{{ collapsed ? 'HR' : '人事管理系統' }}</div>
      <Sidebar />
    </el-aside>

    <el-container>
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
  background: #304156;
  color: #bfcbd9;
  transition: width 0.2s;
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

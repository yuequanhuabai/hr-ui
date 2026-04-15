<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import { useRouter } from 'vue-router'
import AppMain from './components/AppMain.vue'

const appStore = useAppStore()
const userStore = useUserStore()
const router = useRouter()

const collapsed = computed(() => appStore.sidebarCollapsed)
const asideWidth = computed(() => (collapsed.value ? '64px' : '210px'))

function toggleSidebar() {
  appStore.toggleSidebar()
}

async function handleLogout() {
  await userStore.logout()
  router.push('/login')
}
</script>

<template>
  <el-container class="layout">
    <el-aside class="layout-aside" :width="asideWidth">
      <div class="logo">{{ collapsed ? 'HR' : '人事管理系統' }}</div>
      <div class="sidebar-placeholder">
        <p>Sidebar 佔位</p>
        <p style="font-size: 12px; opacity: 0.6">Step 8 替換</p>
      </div>
    </el-aside>

    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <el-button text @click="toggleSidebar">
            {{ collapsed ? '展開' : '摺疊' }}
          </el-button>
          <span class="breadcrumb-placeholder">Breadcrumb 佔位（Step 9）</span>
        </div>
        <div class="header-right">
          <span>{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</span>
          <el-button text @click="handleLogout">退出</el-button>
        </div>
      </el-header>

      <div class="tags-view-placeholder">TagsView 佔位（Step 10）</div>

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
.sidebar-placeholder {
  padding: 20px;
  text-align: center;
}
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 16px;
}
.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.breadcrumb-placeholder {
  color: #909399;
  font-size: 13px;
}
.tags-view-placeholder {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 6px 16px;
  font-size: 12px;
  color: #909399;
}
</style>

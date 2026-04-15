<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import Breadcrumb from './Breadcrumb.vue'

const appStore = useAppStore()
const userStore = useUserStore()
const router = useRouter()

const collapsed = computed(() => appStore.sidebarCollapsed)
const displayName = computed(
  () => userStore.userInfo?.nickname || userStore.userInfo?.username || '未登入'
)

function toggleSidebar() {
  appStore.toggleSidebar()
}

async function handleCommand(command: string) {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('確定要退出登入嗎？', '提示', {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await userStore.logout()
      router.push('/login')
    } catch {
      // 用戶取消
    }
  } else if (command === 'profile') {
    router.push('/profile')
  }
}
</script>

<template>
  <div class="navbar">
    <div class="navbar-left">
      <div class="hamburger" :class="{ 'is-collapsed': collapsed }" @click="toggleSidebar">
        <el-icon :size="20">
          <Fold v-if="!collapsed" />
          <Expand v-else />
        </el-icon>
      </div>
      <Breadcrumb class="breadcrumb-container" />
    </div>

    <div class="navbar-right">
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="30" :icon="'UserFilled'" />
          <span class="username">{{ displayName }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">個人中心</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登入</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 16px;
}
.navbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.hamburger {
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  transition: background 0.2s;
}
.hamburger:hover {
  background: #f5f7fa;
  border-radius: 4px;
}
.breadcrumb-container {
  margin-left: 8px;
}
.navbar-right {
  display: flex;
  align-items: center;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}
.user-info:hover {
  background: #f5f7fa;
}
.username {
  font-size: 14px;
  color: #303133;
}
</style>

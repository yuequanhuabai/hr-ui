<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const router = useRouter()

async function onLogout() {
  await userStore.logout()
  await router.push('/login')
}
</script>

<template>
  <div style="padding: 40px">
    <h1>Dashboard（佔位）</h1>
    <el-descriptions :column="1" border>
      <el-descriptions-item label="用戶 ID">
        {{ userStore.userInfo?.userId ?? '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="用戶名">
        {{ userStore.userInfo?.username ?? '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="暱稱">
        {{ userStore.userInfo?.nickname ?? '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="角色">
        {{ userStore.roles.join(', ') || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="權限數">
        {{ userStore.permissions.length }}
      </el-descriptions-item>
    </el-descriptions>
    <el-button type="danger" style="margin-top: 20px" @click="onLogout">退出登入</el-button>
  </div>
</template>

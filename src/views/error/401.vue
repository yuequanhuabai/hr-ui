<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()

async function goLogin() {
  if (userStore.token) {
    await userStore.logout().catch(() => {})
  }
  router.push('/login')
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="error-page">
    <div class="error-page__inner">
      <div class="error-page__illustration">
        <svg viewBox="0 0 200 200" class="error-page__svg">
          <circle cx="100" cy="100" r="80" fill="#fef0f0" />
          <text
            x="100"
            y="125"
            text-anchor="middle"
            font-size="72"
            font-weight="700"
            fill="#f56c6c"
            font-family="Consolas, monospace"
          >401</text>
        </svg>
      </div>
      <h1 class="error-page__title">未授權訪問</h1>
      <p class="error-page__desc">
        抱歉，您沒有訪問此頁面的權限。<br />
        請重新登入或聯繫管理員為您分配權限。
      </p>
      <div class="error-page__actions">
        <el-button type="primary" @click="goLogin">去登入</el-button>
        <el-button @click="goHome">返回首頁</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
}
.error-page__inner {
  text-align: center;
  max-width: 480px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
}
.error-page__illustration {
  margin-bottom: 16px;
}
.error-page__svg {
  width: 200px;
  height: 200px;
}
.error-page__title {
  font-size: 24px;
  color: #303133;
  margin: 0 0 12px;
}
.error-page__desc {
  font-size: 14px;
  color: #909399;
  line-height: 1.8;
  margin-bottom: 24px;
}
.error-page__actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const form = reactive({
  username: 'admin',
  password: 'admin123'
})
const loading = ref(false)

async function onSubmit() {
  if (!form.username || !form.password) {
    ElMessage.warning('請輸入用戶名和密碼')
    return
  }
  loading.value = true
  try {
    await userStore.login(form)
    const redirect = (route.query.redirect as string) || '/'
    await router.push(redirect)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-wrapper">
    <el-card class="login-card">
      <h2>人事管理系統 · 登入（佔位）</h2>
      <el-form label-width="70px" @submit.prevent="onSubmit">
        <el-form-item label="用戶名">
          <el-input v-model="form.username" autocomplete="username" />
        </el-form-item>
        <el-form-item label="密碼">
          <el-input v-model="form.password" type="password" autocomplete="current-password" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="onSubmit">登入</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
}
.login-card {
  width: 400px;
}
</style>

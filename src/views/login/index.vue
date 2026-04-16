<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const REMEMBER_KEY = 'hr:login:remember'
const formRef = ref<FormInstance>()

const form = reactive({
  username: '',
  password: '',
  remember: false
})

const rules: FormRules = {
  username: [{ required: true, message: '請輸入用戶名', trigger: 'blur' }],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 5, message: '密碼至少 5 位', trigger: 'blur' }
  ]
}

const loading = ref(false)

onMounted(() => {
  const saved = localStorage.getItem(REMEMBER_KEY)
  if (saved) {
    form.username = saved
    form.remember = true
  }
})

async function onSubmit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await userStore.login({ username: form.username, password: form.password })
    if (form.remember) {
      localStorage.setItem(REMEMBER_KEY, form.username)
    } else {
      localStorage.removeItem(REMEMBER_KEY)
    }
    const redirect = (route.query.redirect as string) || '/'
    await router.push(redirect)
  } catch (err: any) {
    ElMessage.error(err?.message || '登入失敗，請重試')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-card__header">
        <h1 class="login-card__title">人事管理系統</h1>
        <p class="login-card__subtitle">Human Resource Management</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        size="large"
        class="login-card__form"
        @submit.prevent="onSubmit"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            :prefix-icon="User"
            placeholder="用戶名"
            autocomplete="username"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            :prefix-icon="Lock"
            type="password"
            placeholder="密碼"
            show-password
            autocomplete="current-password"
            @keyup.enter="onSubmit"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="form.remember">記住用戶名</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="login-card__submit"
            @click="onSubmit"
          >
            {{ loading ? '登入中...' : '登 入' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-card__footer">© 2026 HR System</div>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-card {
  display: flex;
  flex-direction: column;
  width: 420px;
  padding: 40px 36px 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}
.login-card__header {
  margin-bottom: 32px;
  text-align: center;
}
.login-card__title {
  margin: 0;
  color: #303133;
  font-weight: 600;
  font-size: 24px;
}
.login-card__subtitle {
  margin: 6px 0 0;
  color: #909399;
  font-size: 13px;
  letter-spacing: 1px;
}
.login-card__form {
  width: 100%;
}
.login-card__submit {
  width: 100%;
  letter-spacing: 4px;
}
.login-card__footer {
  margin-top: 12px;
  color: #c0c4cc;
  font-size: 12px;
  text-align: center;
}
</style>

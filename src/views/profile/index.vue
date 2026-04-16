<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, UploadRawFile, UploadRequestOptions } from 'element-plus'
import { User, Phone, Message, Calendar, OfficeBuilding } from '@element-plus/icons-vue'
import {
  getProfile,
  updateProfile,
  updateProfilePassword,
  uploadAvatar
} from '@/api/system/profile'
import { useUserStore } from '@/store/modules/user'
import type { SysUser } from '@/api/types/system'

const userStore = useUserStore()

// ============= 載入 =============
const loading = ref(false)
const profile = reactive<{
  user: SysUser
  roleGroup: string
  postGroup: string
  deptName: string
}>({
  user: {},
  roleGroup: '',
  postGroup: '',
  deptName: ''
})

async function fetchProfile() {
  loading.value = true
  try {
    const data = await getProfile()
    profile.user = data.user || {}
    profile.roleGroup = data.roleGroup || ''
    profile.postGroup = data.postGroup || ''
    profile.deptName = data.deptName || ''
    Object.assign(basicForm, {
      nickname: profile.user.nickname || '',
      phone: profile.user.phone || '',
      email: profile.user.email || '',
      gender: profile.user.gender ?? 0
    })
  } finally {
    loading.value = false
  }
}

// ============= 基本資料 =============
const basicFormRef = ref<FormInstance>()
const basicSubmitting = ref(false)
const basicForm = reactive({
  nickname: '',
  phone: '',
  email: '',
  gender: 0
})

const basicRules: FormRules = {
  nickname: [{ required: true, message: '請輸入暱稱', trigger: 'blur' }],
  phone: [
    {
      pattern: /^$|^1[3-9]\d{9}$/,
      message: '請輸入正確的手機號',
      trigger: 'blur'
    }
  ],
  email: [
    {
      type: 'email',
      message: '請輸入正確的郵箱',
      trigger: 'blur'
    }
  ]
}

async function submitBasic() {
  if (!basicFormRef.value) return
  const valid = await basicFormRef.value.validate().catch(() => false)
  if (!valid) return

  basicSubmitting.value = true
  try {
    await updateProfile({
      nickname: basicForm.nickname,
      phone: basicForm.phone,
      email: basicForm.email,
      gender: basicForm.gender
    })
    ElMessage.success('修改成功')
    profile.user.nickname = basicForm.nickname
    profile.user.phone = basicForm.phone
    profile.user.email = basicForm.email
    profile.user.gender = basicForm.gender
    if (userStore.userInfo) {
      userStore.userInfo.nickname = basicForm.nickname
    }
  } finally {
    basicSubmitting.value = false
  }
}

// ============= 修改密碼 =============
const pwdFormRef = ref<FormInstance>()
const pwdSubmitting = ref(false)
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordStrength = computed(() => {
  const v = pwdForm.newPassword
  if (!v) return { level: 0, text: '', color: '#dcdfe6' }
  let score = 0
  if (v.length >= 8) score += 1
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score += 1
  if (/\d/.test(v)) score += 1
  if (/[^\w\s]/.test(v)) score += 1
  if (score <= 1) return { level: 1, text: '弱', color: '#f56c6c' }
  if (score === 2) return { level: 2, text: '中', color: '#e6a23c' }
  if (score === 3) return { level: 3, text: '強', color: '#67c23a' }
  return { level: 4, text: '極強', color: '#67c23a' }
})

const pwdRules = computed<FormRules>(() => ({
  oldPassword: [{ required: true, message: '請輸入原密碼', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '請輸入新密碼', trigger: 'blur' },
    { min: 5, max: 20, message: '密碼長度 5-20 位', trigger: 'blur' },
    {
      validator: (_r: unknown, val: string, cb: (e?: Error) => void) => {
        if (val && val === pwdForm.oldPassword) {
          return cb(new Error('新密碼不能與原密碼相同'))
        }
        cb()
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '請再次輸入新密碼', trigger: 'blur' },
    {
      validator: (_r: unknown, val: string, cb: (e?: Error) => void) => {
        if (val !== pwdForm.newPassword) return cb(new Error('兩次密碼不一致'))
        cb()
      },
      trigger: 'blur'
    }
  ]
}))

async function submitPassword() {
  if (!pwdFormRef.value) return
  const valid = await pwdFormRef.value.validate().catch(() => false)
  if (!valid) return

  pwdSubmitting.value = true
  try {
    await updateProfilePassword(pwdForm.oldPassword, pwdForm.newPassword)
    ElMessage.success('密碼修改成功，請重新登入')
    pwdForm.oldPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirmPassword = ''
  } finally {
    pwdSubmitting.value = false
  }
}

// ============= 頭像上傳 =============
const avatarUrl = computed(() => profile.user.avatar || '')

function beforeAvatarUpload(file: UploadRawFile) {
  const isImage = /^image\/(jpeg|png|gif|webp)$/.test(file.type)
  const lt2M = file.size / 1024 / 1024 < 2
  if (!isImage) {
    ElMessage.error('僅支援 JPG/PNG/GIF/WEBP 格式')
    return false
  }
  if (!lt2M) {
    ElMessage.error('圖片大小不能超過 2MB')
    return false
  }
  return true
}

async function customUpload(options: UploadRequestOptions) {
  try {
    const res = await uploadAvatar(options.file)
    profile.user.avatar = res.imgUrl
    ElMessage.success('頭像上傳成功')
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options.onError(e as any)
  }
}

// ============= 性別展示 =============
const genderLabel = computed(() => {
  const g = profile.user.gender
  if (g === 0) return '男'
  if (g === 1) return '女'
  return '未知'
})

onMounted(() => {
  fetchProfile()
})
</script>

<template>
  <div v-loading="loading" class="profile">
    <el-row :gutter="16">
      <!-- 左：個人信息卡片 -->
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="profile__info">
          <div class="info__avatar-wrap">
            <el-upload
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :http-request="customUpload"
              accept="image/*"
            >
              <el-avatar :size="96" :src="avatarUrl" class="info__avatar">
                {{ (profile.user.nickname || profile.user.username || '?').charAt(0) }}
              </el-avatar>
              <div class="info__avatar-hint">點擊更換頭像</div>
            </el-upload>
          </div>
          <h3 class="info__name">
            {{ profile.user.nickname || profile.user.username || '-' }}
          </h3>
          <ul class="info__list">
            <li>
              <el-icon><User /></el-icon>
              <span class="info__label">用戶名</span>
              <span>{{ profile.user.username || '-' }}</span>
            </li>
            <li>
              <el-icon><Phone /></el-icon>
              <span class="info__label">手機</span>
              <span>{{ profile.user.phone || '-' }}</span>
            </li>
            <li>
              <el-icon><Message /></el-icon>
              <span class="info__label">郵箱</span>
              <span>{{ profile.user.email || '-' }}</span>
            </li>
            <li>
              <el-icon><Calendar /></el-icon>
              <span class="info__label">性別</span>
              <span>{{ genderLabel }}</span>
            </li>
            <li>
              <el-icon><OfficeBuilding /></el-icon>
              <span class="info__label">部門</span>
              <span>{{ profile.deptName || '-' }}</span>
            </li>
            <li>
              <el-icon><User /></el-icon>
              <span class="info__label">崗位</span>
              <span>{{ profile.postGroup || '-' }}</span>
            </li>
            <li>
              <el-icon><User /></el-icon>
              <span class="info__label">角色</span>
              <span>{{ profile.roleGroup || '-' }}</span>
            </li>
            <li>
              <el-icon><Calendar /></el-icon>
              <span class="info__label">創建時間</span>
              <span>{{ profile.user.createTime || '-' }}</span>
            </li>
          </ul>
        </el-card>
      </el-col>

      <!-- 右：Tabs -->
      <el-col :xs="24" :md="16">
        <el-card shadow="never" class="profile__tabs">
          <el-tabs>
            <el-tab-pane label="基本資料">
              <el-form
                ref="basicFormRef"
                :model="basicForm"
                :rules="basicRules"
                label-width="90px"
                style="max-width: 520px"
              >
                <el-form-item label="暱稱" prop="nickname">
                  <el-input v-model="basicForm.nickname" />
                </el-form-item>
                <el-form-item label="手機號" prop="phone">
                  <el-input v-model="basicForm.phone" placeholder="選填" />
                </el-form-item>
                <el-form-item label="郵箱" prop="email">
                  <el-input v-model="basicForm.email" placeholder="選填" />
                </el-form-item>
                <el-form-item label="性別">
                  <el-radio-group v-model="basicForm.gender">
                    <el-radio :value="0">男</el-radio>
                    <el-radio :value="1">女</el-radio>
                    <el-radio :value="2">未知</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="basicSubmitting" @click="submitBasic">
                    保存
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="修改密碼">
              <el-form
                ref="pwdFormRef"
                :model="pwdForm"
                :rules="pwdRules"
                label-width="110px"
                style="max-width: 520px"
              >
                <el-form-item label="原密碼" prop="oldPassword">
                  <el-input
                    v-model="pwdForm.oldPassword"
                    type="password"
                    show-password
                    placeholder="請輸入原密碼"
                  />
                </el-form-item>
                <el-form-item label="新密碼" prop="newPassword">
                  <el-input
                    v-model="pwdForm.newPassword"
                    type="password"
                    show-password
                    placeholder="5-20 位字符"
                  />
                  <div v-if="pwdForm.newPassword" class="pwd-strength">
                    <div class="pwd-strength__bars">
                      <span
                        v-for="i in 4"
                        :key="i"
                        class="pwd-strength__bar"
                        :style="{
                          background: i <= passwordStrength.level ? passwordStrength.color : '#dcdfe6'
                        }"
                      />
                    </div>
                    <span class="pwd-strength__text" :style="{ color: passwordStrength.color }">
                      強度：{{ passwordStrength.text }}
                    </span>
                  </div>
                </el-form-item>
                <el-form-item label="確認新密碼" prop="confirmPassword">
                  <el-input
                    v-model="pwdForm.confirmPassword"
                    type="password"
                    show-password
                    placeholder="再次輸入新密碼"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="pwdSubmitting" @click="submitPassword">
                    修改密碼
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.profile {
  padding: 16px;
}

/* 左側個人信息 */
.profile__info :deep(.el-card__body) {
  padding: 24px;
}
.info__avatar-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}
.info__avatar {
  cursor: pointer;
  background: #409eff;
  color: #fff;
  font-size: 36px;
  font-weight: 600;
  transition: opacity 0.2s;
}
.info__avatar:hover {
  opacity: 0.85;
}
.info__avatar-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  text-align: center;
}
.info__name {
  text-align: center;
  margin: 0 0 20px;
  font-size: 18px;
  color: #303133;
}
.info__list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid #ebeef5;
}
.info__list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
  font-size: 13px;
  color: #606266;
}
.info__list li :deep(.el-icon) {
  color: #909399;
}
.info__label {
  color: #909399;
  min-width: 66px;
}

/* 右側 Tabs */
.profile__tabs :deep(.el-card__body) {
  padding: 16px 24px 24px;
}

/* 密碼強度 */
.pwd-strength {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}
.pwd-strength__bars {
  display: flex;
  gap: 4px;
}
.pwd-strength__bar {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  transition: background 0.2s;
}
.pwd-strength__text {
  font-size: 12px;
}
</style>

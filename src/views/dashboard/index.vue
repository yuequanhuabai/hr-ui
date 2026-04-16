<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  User,
  OfficeBuilding,
  UserFilled,
  Briefcase,
  Setting,
  Menu as IconMenu
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { listUser } from '@/api/system/user'
import { listRole } from '@/api/system/role'
import { listPost } from '@/api/system/post'
import { deptTree } from '@/api/system/dept'
import type { SysDept } from '@/api/types/system'

const userStore = useUserStore()
const router = useRouter()

// ============= 歡迎語 =============
const now = ref(new Date())
let timer: number | undefined

const greeting = computed(() => {
  const h = now.value.getHours()
  if (h < 6) return '夜深了'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})

const dateText = computed(() => {
  const d = now.value
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} 星期${weekdays[d.getDay()]}`
})

const timeText = computed(() => {
  const d = now.value
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
})

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`
}

// ============= 統計卡片 =============
interface StatCard {
  key: string
  label: string
  icon: any
  color: string
  bg: string
  count: number | string
  perms?: string[]
  to?: string
}

const stats = ref<StatCard[]>([
  { key: 'user', label: '用戶總數', icon: User, color: '#409eff', bg: '#ecf5ff', count: '-', perms: ['system:user:list'], to: '/system/user' },
  { key: 'dept', label: '部門數', icon: OfficeBuilding, color: '#67c23a', bg: '#f0f9eb', count: '-', perms: ['system:dept:list'], to: '/system/dept' },
  { key: 'role', label: '角色數', icon: UserFilled, color: '#e6a23c', bg: '#fdf6ec', count: '-', perms: ['system:role:list'], to: '/system/role' },
  { key: 'post', label: '崗位數', icon: Briefcase, color: '#f56c6c', bg: '#fef0f0', count: '-', perms: ['system:post:list'], to: '/system/post' }
])

async function fetchStats() {
  const [userRes, deptRes, roleRes, postRes] = await Promise.allSettled([
    listUser({ pageNum: 1, pageSize: 1 } as any),
    deptTree(),
    listRole({ pageNum: 1, pageSize: 1 } as any),
    listPost({ pageNum: 1, pageSize: 1 } as any)
  ])

  updateStat('user', userRes.status === 'fulfilled' ? userRes.value.total : '-')
  updateStat('dept', deptRes.status === 'fulfilled' ? countDept(deptRes.value) : '-')
  updateStat('role', roleRes.status === 'fulfilled' ? roleRes.value.total : '-')
  updateStat('post', postRes.status === 'fulfilled' ? postRes.value.total : '-')
}

function updateStat(key: string, value: number | string) {
  const s = stats.value.find((x) => x.key === key)
  if (s) s.count = value
}

function countDept(tree: SysDept[]): number {
  let n = 0
  const walk = (nodes: SysDept[]) => {
    for (const x of nodes) {
      n += 1
      if (x.children?.length) walk(x.children)
    }
  }
  walk(tree)
  return n
}

function goTo(card: StatCard) {
  if (card.to) router.push(card.to)
}

// ============= 快捷入口 =============
const shortcuts = [
  { label: '用戶管理', path: '/system/user', icon: User, color: '#409eff' },
  { label: '角色管理', path: '/system/role', icon: UserFilled, color: '#e6a23c' },
  { label: '部門管理', path: '/system/dept', icon: OfficeBuilding, color: '#67c23a' },
  { label: '崗位管理', path: '/system/post', icon: Briefcase, color: '#f56c6c' },
  { label: '菜單管理', path: '/system/menu', icon: IconMenu, color: '#909399' },
  { label: '個人中心', path: '/profile', icon: Setting, color: '#606266' }
]

onMounted(() => {
  fetchStats()
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<template>
  <div class="dashboard">
    <!-- 歡迎卡片 -->
    <el-card shadow="never" class="dashboard__welcome">
      <div class="welcome">
        <div class="welcome__left">
          <el-avatar :size="64" class="welcome__avatar">
            {{ (userStore.userInfo?.nickname || userStore.userInfo?.username || '?').charAt(0) }}
          </el-avatar>
          <div class="welcome__text">
            <div class="welcome__greeting">
              {{ greeting }}，{{ userStore.userInfo?.nickname || userStore.userInfo?.username || '訪客' }} 👋
            </div>
            <div class="welcome__sub">
              歡迎回到 HR 管理系統
              <el-tag
                v-for="r in userStore.roles"
                :key="r"
                size="small"
                type="primary"
                style="margin-left: 6px"
              >
                {{ r }}
              </el-tag>
            </div>
          </div>
        </div>
        <div class="welcome__right">
          <div class="welcome__time">{{ timeText }}</div>
          <div class="welcome__date">{{ dateText }}</div>
        </div>
      </div>
    </el-card>

    <!-- 統計卡片 -->
    <el-row :gutter="16" class="dashboard__stats">
      <el-col v-for="s in stats" :key="s.key" :xs="24" :sm="12" :md="6">
        <el-card
          shadow="hover"
          class="stat-card"
          :style="{ cursor: s.to ? 'pointer' : 'default' }"
          @click="goTo(s)"
        >
          <div class="stat-card__body">
            <div class="stat-card__icon" :style="{ background: s.bg, color: s.color }">
              <el-icon :size="28"><component :is="s.icon" /></el-icon>
            </div>
            <div class="stat-card__info">
              <div class="stat-card__label">{{ s.label }}</div>
              <div class="stat-card__count">{{ s.count }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷入口 + 個人信息 -->
    <el-row :gutter="16" class="dashboard__main">
      <el-col :xs="24" :md="16">
        <el-card shadow="never" class="panel">
          <template #header>
            <div class="panel__header">
              <span>快捷入口</span>
            </div>
          </template>
          <div class="shortcuts">
            <div
              v-for="item in shortcuts"
              :key="item.path"
              class="shortcut"
              @click="router.push(item.path)"
            >
              <el-icon :size="24" :style="{ color: item.color }">
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.label }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="panel">
          <template #header>
            <div class="panel__header">
              <span>個人信息</span>
            </div>
          </template>
          <el-descriptions :column="1" size="small">
            <el-descriptions-item label="用戶名">
              {{ userStore.userInfo?.username ?? '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="暱稱">
              {{ userStore.userInfo?.nickname ?? '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="用戶 ID">
              {{ userStore.userInfo?.userId ?? '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="部門 ID">
              {{ userStore.userInfo?.deptId ?? '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="角色">
              {{ userStore.roles.join('、') || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="權限數">
              {{ userStore.permissions.length }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

/* 歡迎卡片 */
.dashboard__welcome :deep(.el-card__body) {
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 4px;
}
.welcome {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.welcome__left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.welcome__avatar {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
  font-size: 28px;
  font-weight: 600;
}
.welcome__greeting {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 6px;
}
.welcome__sub {
  font-size: 13px;
  opacity: 0.9;
}
.welcome__time {
  font-size: 28px;
  font-weight: 600;
  font-family: 'Consolas', monospace;
  text-align: right;
}
.welcome__date {
  font-size: 13px;
  opacity: 0.85;
  text-align: right;
  margin-top: 4px;
}

/* 統計卡片 */
.stat-card :deep(.el-card__body) {
  padding: 20px;
}
.stat-card__body {
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-card__icon {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-card__label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 6px;
}
.stat-card__count {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

/* 面板 */
.panel :deep(.el-card__header) {
  padding: 14px 20px;
}
.panel__header {
  font-size: 15px;
  font-weight: 600;
}

/* 快捷入口 */
.shortcuts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}
.shortcut {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  color: #606266;
}
.shortcut:hover {
  border-color: #409eff;
  color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.dashboard__stats,
.dashboard__main {
  row-gap: 16px;
}
</style>

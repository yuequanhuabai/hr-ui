<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  addUser,
  changeUserStatus,
  deleteUser,
  getUser,
  listUser,
  resetPassword,
  updateUser
} from '@/api/system/user'
import { deptTree } from '@/api/system/dept'
import { roleAll } from '@/api/system/role'
import { postAll } from '@/api/system/post'
import type {
  SysDept,
  SysPost,
  SysRole,
  SysUser,
  SysUserQuery
} from '@/api/types/system'

// ============= 列表 =============
const loading = ref(false)
const total = ref(0)
const userList = ref<SysUser[]>([])
const selectedIds = ref<number[]>([])
const showSearch = ref(true)

const query = reactive<SysUserQuery>({
  pageNum: 1,
  pageSize: 10,
  deptId: null,
  username: '',
  phone: '',
  status: null
})

async function fetchList() {
  loading.value = true
  try {
    const res = await listUser(query)
    userList.value = res.rows
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function onQuery() {
  query.pageNum = 1
  fetchList()
}

function onReset() {
  query.deptId = null
  query.username = ''
  query.phone = ''
  query.status = null
  onQuery()
}

function onSelectionChange(rows: SysUser[]) {
  selectedIds.value = rows.map((r) => r.userId!).filter(Boolean)
}

// ============= 部門樹 =============
const deptOptions = ref<SysDept[]>([])

async function fetchDeptTree() {
  deptOptions.value = await deptTree()
}

const deptNameMap = computed(() => {
  const map = new Map<number, string>()
  const walk = (nodes: SysDept[]) => {
    for (const n of nodes) {
      map.set(n.deptId, n.deptName)
      if (n.children?.length) walk(n.children)
    }
  }
  walk(deptOptions.value)
  return map
})

function onDeptNodeClick(node: SysDept) {
  query.deptId = node.deptId
  onQuery()
}

// ============= 下拉字典 =============
const roleOptions = ref<SysRole[]>([])
const postOptions = ref<SysPost[]>([])

async function fetchDict() {
  const [roles, posts] = await Promise.all([roleAll(), postAll()])
  roleOptions.value = roles
  postOptions.value = posts
}

// ============= 新增 / 修改 =============
const dialogVisible = ref(false)
const dialogTitle = ref('新增用戶')
const submitting = ref(false)
const formRef = ref<FormInstance>()

const emptyForm: SysUser = {
  userId: undefined,
  deptId: null,
  postId: null,
  username: '',
  password: '',
  nickname: '',
  email: '',
  phone: '',
  gender: 0,
  status: 0,
  roleIds: [],
  remark: ''
}

const form = reactive<SysUser>({ ...emptyForm })

const rules: FormRules = {
  username: [
    { required: true, message: '請輸入用戶名', trigger: 'blur' },
    { min: 2, max: 20, message: '長度 2-20 字', trigger: 'blur' }
  ],
  nickname: [{ required: true, message: '請輸入暱稱', trigger: 'blur' }],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 5, max: 20, message: '長度 5-20 字', trigger: 'blur' }
  ],
  deptId: [{ required: true, message: '請選擇部門', trigger: 'change' }],
  phone: [
    {
      pattern: /^$|^1[3-9]\d{9}$/,
      message: '手機號格式不正確',
      trigger: 'blur'
    }
  ],
  email: [{ type: 'email', message: '郵箱格式不正確', trigger: 'blur' }]
}

function resetForm() {
  Object.assign(form, emptyForm)
  formRef.value?.clearValidate()
}

function openAdd() {
  resetForm()
  dialogTitle.value = '新增用戶'
  dialogVisible.value = true
}

async function openEdit(row: SysUser) {
  resetForm()
  dialogTitle.value = '修改用戶'
  const { user, roles } = await getUser(row.userId!)
  Object.assign(form, user)
  form.password = ''
  form.roleIds = roles.map((r) => r.roleId!).filter((id): id is number => typeof id === 'number')
  dialogVisible.value = true
}

async function submit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (form.userId) {
      const { password, ...rest } = form
      await updateUser(rest as SysUser)
      ElMessage.success('修改成功')
    } else {
      await addUser(form)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

// ============= 刪除 =============
async function onDelete(row?: SysUser) {
  const ids = row ? [row.userId!] : selectedIds.value
  if (!ids.length) return ElMessage.warning('請選擇要刪除的用戶')

  try {
    await ElMessageBox.confirm(`確定刪除選中的 ${ids.length} 條記錄？`, '提示', {
      type: 'warning'
    })
  } catch {
    return
  }
  await deleteUser(ids)
  ElMessage.success('刪除成功')
  fetchList()
}

// ============= 狀態切換 =============
async function onStatusChange(row: SysUser) {
  try {
    await changeUserStatus(row.userId!, row.status!)
    ElMessage.success(row.status === 0 ? '已啟用' : '已停用')
  } catch {
    row.status = row.status === 0 ? 1 : 0
  }
}

// ============= 重置密碼 =============
const pwdDialogVisible = ref(false)
const pwdForm = reactive<{ userId: number | null; password: string }>({
  userId: null,
  password: ''
})

function openResetPwd(row: SysUser) {
  pwdForm.userId = row.userId!
  pwdForm.password = ''
  pwdDialogVisible.value = true
}

async function submitResetPwd() {
  if (!pwdForm.password || pwdForm.password.length < 5) {
    return ElMessage.warning('密碼長度至少 5 位')
  }
  await resetPassword(pwdForm.userId!, pwdForm.password)
  ElMessage.success('密碼已重置')
  pwdDialogVisible.value = false
}

// ============= 初始化 =============
onMounted(() => {
  fetchDeptTree()
  fetchDict()
  fetchList()
})
</script>

<template>
  <div class="user-page">
    <!-- 左：部門樹 -->
    <div class="user-page__left">
      <DeptTree
        :data="deptOptions"
        node-key="deptId"
        label-key="deptName"
        children-key="children"
        @node-click="onDeptNodeClick"
      />
    </div>

    <!-- 右：表格區 -->
    <div class="user-page__right">
      <!-- 搜索表單 -->
      <el-card v-show="showSearch" shadow="never" class="user-page__search">
        <el-form :model="query" inline>
          <el-form-item label="用戶名">
            <el-input
              v-model="query.username"
              placeholder="用戶名"
              clearable
              style="width: 180px"
              @keyup.enter="onQuery"
            />
          </el-form-item>
          <el-form-item label="手機">
            <el-input
              v-model="query.phone"
              placeholder="手機號"
              clearable
              style="width: 180px"
              @keyup.enter="onQuery"
            />
          </el-form-item>
          <el-form-item label="狀態">
            <el-select
              v-model="query.status"
              placeholder="狀態"
              clearable
              style="width: 120px"
            >
              <el-option label="正常" :value="0" />
              <el-option label="停用" :value="1" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onQuery">搜索</el-button>
            <el-button @click="onReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 工具欄 -->
      <div class="user-page__toolbar">
        <div>
          <el-button
            v-hasPerms="['system:user:add']"
            type="primary"
            @click="openAdd"
          >
            新增
          </el-button>
          <el-button
            v-hasPerms="['system:user:remove']"
            type="danger"
            :disabled="!selectedIds.length"
            @click="onDelete()"
          >
            批量刪除
          </el-button>
        </div>
        <RightToolbar v-model:show-search="showSearch" @query-table="fetchList" />
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="userList"
        border
        stripe
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="用戶ID" prop="userId" width="80" />
        <el-table-column label="用戶名" prop="username" min-width="110" />
        <el-table-column label="暱稱" prop="nickname" min-width="110" />
        <el-table-column label="部門" width="130">
          <template #default="{ row }">
            {{ row.deptId ? deptNameMap.get(row.deptId) || row.deptId : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="手機" prop="phone" width="130" />
        <el-table-column label="狀態" width="90" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="0"
              :inactive-value="1"
              @change="onStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="創建時間" prop="createTime" width="180" />
        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              v-hasPerms="['system:user:edit']"
              link
              type="primary"
              @click="openEdit(row)"
            >
              修改
            </el-button>
            <el-button
              v-hasPerms="['system:user:resetPwd']"
              link
              type="primary"
              @click="openResetPwd(row)"
            >
              重置密碼
            </el-button>
            <el-button
              v-hasPerms="['system:user:remove']"
              link
              type="danger"
              @click="onDelete(row)"
            >
              刪除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <Pagination
        v-model:page="query.pageNum"
        v-model:limit="query.pageSize"
        :total="total"
        @pagination="fetchList"
      />
    </div>

    <!-- 新增/修改彈窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="680px">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="90px"
      >
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="用戶名" prop="username">
              <el-input v-model="form.username" :disabled="!!form.userId" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="暱稱" prop="nickname">
              <el-input v-model="form.nickname" />
            </el-form-item>
          </el-col>
          <el-col v-if="!form.userId" :span="12">
            <el-form-item label="密碼" prop="password">
              <el-input v-model="form.password" type="password" show-password />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部門" prop="deptId">
              <TreeSelect
                v-model="form.deptId"
                :data="deptOptions"
                node-key="deptId"
                label-key="deptName"
                placeholder="選擇部門"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="崗位">
              <el-select v-model="form.postId" clearable placeholder="選擇崗位" style="width: 100%">
                <el-option
                  v-for="p in postOptions"
                  :key="p.postId"
                  :label="p.postName"
                  :value="p.postId ?? 0"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-select
                v-model="form.roleIds"
                multiple
                collapse-tags
                placeholder="選擇角色"
                style="width: 100%"
              >
                <el-option
                  v-for="r in roleOptions"
                  :key="r.roleId"
                  :label="r.roleName"
                  :value="r.roleId ?? 0"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手機" prop="phone">
              <el-input v-model="form.phone" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="郵箱" prop="email">
              <el-input v-model="form.email" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性別">
              <el-radio-group v-model="form.gender">
                <el-radio :value="0">未知</el-radio>
                <el-radio :value="1">男</el-radio>
                <el-radio :value="2">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="狀態">
              <el-radio-group v-model="form.status">
                <el-radio :value="0">正常</el-radio>
                <el-radio :value="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="備註">
              <el-input v-model="form.remark" type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">確定</el-button>
      </template>
    </el-dialog>

    <!-- 重置密碼彈窗 -->
    <el-dialog v-model="pwdDialogVisible" title="重置密碼" width="400px">
      <el-form label-width="80px">
        <el-form-item label="新密碼">
          <el-input v-model="pwdForm.password" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pwdDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitResetPwd">確定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.user-page {
  display: flex;
  gap: 12px;
  height: 100%;
}
.user-page__left {
  flex: 0 0 240px;
}
.user-page__right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}
.user-page__search :deep(.el-card__body) {
  padding: 16px;
}
.user-page__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>

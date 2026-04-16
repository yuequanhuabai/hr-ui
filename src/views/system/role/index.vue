<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, ElTree } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  addRole,
  changeRoleStatus,
  deleteRole,
  listRole,
  updateRole,
  updateRoleDataScope
} from '@/api/system/role'
import { menuTree, roleMenuIds } from '@/api/system/menu'
import { deptTree } from '@/api/system/dept'
import type {
  SysDept,
  SysMenu,
  SysRole,
  SysRoleQuery
} from '@/api/types/system'

// ============= 列表 =============
const loading = ref(false)
const total = ref(0)
const roleList = ref<SysRole[]>([])
const selectedIds = ref<number[]>([])
const showSearch = ref(true)

const query = reactive<SysRoleQuery>({
  pageNum: 1,
  pageSize: 10,
  roleName: '',
  roleKey: '',
  status: null
})

async function fetchList() {
  loading.value = true
  try {
    const res = await listRole(query)
    roleList.value = res.rows
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
  query.roleName = ''
  query.roleKey = ''
  query.status = null
  onQuery()
}

function onSelectionChange(rows: SysRole[]) {
  selectedIds.value = rows.map((r) => r.roleId!).filter(Boolean)
}

// ============= 新增 / 修改（含菜單權限） =============
const dialogVisible = ref(false)
const dialogTitle = ref('新增角色')
const submitting = ref(false)
const formRef = ref<FormInstance>()
const menuTreeRef = ref<InstanceType<typeof ElTree>>()
const menuTreeData = ref<SysMenu[]>([])

const emptyForm: SysRole = {
  roleId: undefined,
  roleName: '',
  roleKey: '',
  orderNum: 0,
  status: 0,
  menuIds: [],
  remark: ''
}

const form = reactive<SysRole>({ ...emptyForm })

const rules: FormRules = {
  roleName: [{ required: true, message: '請輸入角色名稱', trigger: 'blur' }],
  roleKey: [{ required: true, message: '請輸入角色標識', trigger: 'blur' }],
  orderNum: [{ required: true, message: '請輸入排序號', trigger: 'blur' }]
}

function resetForm() {
  Object.assign(form, { ...emptyForm, menuIds: [] })
  formRef.value?.clearValidate()
  menuTreeRef.value?.setCheckedKeys([])
}

function getParentMenuIdSet(nodes: SysMenu[], acc = new Set<number>()): Set<number> {
  for (const n of nodes) {
    if (n.children?.length) {
      acc.add(n.menuId)
      getParentMenuIdSet(n.children, acc)
    }
  }
  return acc
}

async function openAdd() {
  resetForm()
  dialogTitle.value = '新增角色'
  await fetchMenuTree()
  dialogVisible.value = true
}

async function openEdit(row: SysRole) {
  resetForm()
  dialogTitle.value = '修改角色'
  Object.assign(form, row)
  await fetchMenuTree()
  const ids = await roleMenuIds(row.roleId!)
  form.menuIds = ids
  dialogVisible.value = true
  await nextTick()
  const parentIds = getParentMenuIdSet(menuTreeData.value)
  const leafIds = ids.filter((id) => !parentIds.has(id))
  menuTreeRef.value?.setCheckedKeys(leafIds)
}

async function fetchMenuTree() {
  if (menuTreeData.value.length) return
  menuTreeData.value = await menuTree()
}

async function submit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const checked = menuTreeRef.value?.getCheckedKeys() as number[] || []
  const halfChecked = menuTreeRef.value?.getHalfCheckedKeys() as number[] || []
  form.menuIds = [...checked, ...halfChecked]

  submitting.value = true
  try {
    if (form.roleId) {
      await updateRole(form)
      ElMessage.success('修改成功')
    } else {
      await addRole(form)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

// ============= 刪除 =============
async function onDelete(row?: SysRole) {
  const ids = row ? [row.roleId!] : selectedIds.value
  if (!ids.length) return ElMessage.warning('請選擇要刪除的角色')
  try {
    await ElMessageBox.confirm(`確定刪除選中的 ${ids.length} 條記錄？`, '提示', {
      type: 'warning'
    })
  } catch {
    return
  }
  await deleteRole(ids)
  ElMessage.success('刪除成功')
  fetchList()
}

// ============= 狀態切換 =============
async function onStatusChange(row: SysRole) {
  try {
    await changeRoleStatus(row.roleId!, row.status!)
    ElMessage.success(row.status === 0 ? '已啟用' : '已停用')
  } catch {
    row.status = row.status === 0 ? 1 : 0
  }
}

// ============= 數據權限 =============
const scopeDialogVisible = ref(false)
const scopeSubmitting = ref(false)
const scopeDeptTreeRef = ref<InstanceType<typeof ElTree>>()
const deptTreeData = ref<SysDept[]>([])

const scopeForm = reactive<SysRole>({
  roleId: undefined,
  roleName: '',
  roleKey: '',
  dataScope: 1,
  deptIds: []
})

async function openScope(row: SysRole) {
  Object.assign(scopeForm, {
    roleId: row.roleId,
    roleName: row.roleName,
    roleKey: row.roleKey,
    dataScope: row.dataScope ?? 1,
    deptIds: []
  })
  if (!deptTreeData.value.length) {
    deptTreeData.value = await deptTree()
  }
  scopeDialogVisible.value = true
  await nextTick()
  scopeDeptTreeRef.value?.setCheckedKeys([])
}

async function submitScope() {
  if (scopeForm.dataScope === 2) {
    const checked = scopeDeptTreeRef.value?.getCheckedKeys() as number[] || []
    const halfChecked = scopeDeptTreeRef.value?.getHalfCheckedKeys() as number[] || []
    scopeForm.deptIds = [...checked, ...halfChecked]
  } else {
    scopeForm.deptIds = []
  }
  scopeSubmitting.value = true
  try {
    await updateRoleDataScope(scopeForm)
    ElMessage.success('分配數據權限成功')
    scopeDialogVisible.value = false
    fetchList()
  } finally {
    scopeSubmitting.value = false
  }
}

const dataScopeText: Record<number, string> = {
  1: '全部數據',
  2: '自定義',
  3: '本部門',
  4: '本部門及以下',
  5: '僅本人'
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div class="role-page">
    <!-- 搜索表單 -->
    <el-card v-show="showSearch" shadow="never" class="role-page__search">
      <el-form :model="query" inline>
        <el-form-item label="角色名稱">
          <el-input
            v-model="query.roleName"
            placeholder="角色名稱"
            clearable
            style="width: 180px"
            @keyup.enter="onQuery"
          />
        </el-form-item>
        <el-form-item label="角色標識">
          <el-input
            v-model="query.roleKey"
            placeholder="角色標識"
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
    <div class="role-page__toolbar">
      <div>
        <el-button
          v-hasPerms="['system:role:add']"
          type="primary"
          @click="openAdd"
        >
          新增
        </el-button>
        <el-button
          v-hasPerms="['system:role:remove']"
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
      :data="roleList"
      border
      stripe
      @selection-change="onSelectionChange"
    >
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="角色ID" prop="roleId" width="80" />
      <el-table-column label="角色名稱" prop="roleName" min-width="120" />
      <el-table-column label="角色標識" prop="roleKey" min-width="140" />
      <el-table-column label="排序" prop="orderNum" width="80" align="center" />
      <el-table-column label="數據範圍" width="120" align="center">
        <template #default="{ row }">
          {{ dataScopeText[row.dataScope] || '-' }}
        </template>
      </el-table-column>
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
      <el-table-column label="操作" width="280" fixed="right" align="center">
        <template #default="{ row }">
          <el-button
            v-hasPerms="['system:role:edit']"
            link
            type="primary"
            @click="openEdit(row)"
          >
            修改
          </el-button>
          <el-button
            v-hasPerms="['system:role:edit']"
            link
            type="primary"
            @click="openScope(row)"
          >
            數據權限
          </el-button>
          <el-button
            v-hasPerms="['system:role:remove']"
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

    <!-- 新增/修改彈窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="720px">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="90px"
      >
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="角色名稱" prop="roleName">
              <el-input v-model="form.roleName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色標識" prop="roleKey">
              <el-input v-model="form.roleKey" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" :min="0" style="width: 100%" />
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
            <el-form-item label="菜單權限">
              <el-tree
                ref="menuTreeRef"
                class="role-menu-tree"
                :data="menuTreeData"
                node-key="menuId"
                :props="{ label: 'menuName', children: 'children' }"
                show-checkbox
                default-expand-all
                :check-strictly="false"
              />
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

    <!-- 數據權限彈窗 -->
    <el-dialog v-model="scopeDialogVisible" title="分配數據權限" width="560px">
      <el-form label-width="90px">
        <el-form-item label="角色名稱">
          <el-input :model-value="scopeForm.roleName" disabled />
        </el-form-item>
        <el-form-item label="角色標識">
          <el-input :model-value="scopeForm.roleKey" disabled />
        </el-form-item>
        <el-form-item label="數據範圍">
          <el-select v-model="scopeForm.dataScope" style="width: 100%">
            <el-option label="全部數據" :value="1" />
            <el-option label="自定義" :value="2" />
            <el-option label="本部門" :value="3" />
            <el-option label="本部門及以下" :value="4" />
            <el-option label="僅本人" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="scopeForm.dataScope === 2" label="部門權限">
          <el-tree
            ref="scopeDeptTreeRef"
            class="scope-dept-tree"
            :data="deptTreeData"
            node-key="deptId"
            :props="{ label: 'deptName', children: 'children' }"
            show-checkbox
            default-expand-all
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scopeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="scopeSubmitting" @click="submitScope">
          確定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.role-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 4px;
  height: 100%;
  overflow: hidden;
}
.role-page__search :deep(.el-card__body) {
  padding: 16px;
}
.role-page__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.role-menu-tree,
.scope-dept-tree {
  max-height: 260px;
  overflow: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 6px;
  width: 100%;
}
</style>

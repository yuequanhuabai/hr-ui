<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  addDept,
  deleteDept,
  deptTree as fetchDeptTree,
  updateDept
} from '@/api/system/dept'
import type { SysDept, SysDeptQuery } from '@/api/types/system'

const ROOT_DEPT: SysDept = { deptId: 0, parentId: -1, deptName: '頂級部門', children: [] }

// ============= 列表 =============
const loading = ref(false)
const deptList = ref<SysDept[]>([])
const showSearch = ref(true)
const tableRef = ref()
const allExpanded = ref(true)

const query = reactive<SysDeptQuery>({
  deptName: '',
  status: null
})

async function fetchList() {
  loading.value = true
  try {
    deptList.value = await fetchDeptTree(query as any)
  } finally {
    loading.value = false
  }
}

function onQuery() {
  fetchList()
}

function onReset() {
  query.deptName = ''
  query.status = null
  onQuery()
}

// ============= 展開/摺疊 =============
function getAllDeptIds(nodes: SysDept[], acc: number[] = []): number[] {
  for (const n of nodes) {
    acc.push(n.deptId)
    if (n.children?.length) getAllDeptIds(n.children, acc)
  }
  return acc
}

function toggleExpandAll() {
  allExpanded.value = !allExpanded.value
  const ids = getAllDeptIds(deptList.value)
  for (const id of ids) {
    tableRef.value?.toggleRowExpansion?.(
      findDept(deptList.value, id),
      allExpanded.value
    )
  }
}

function findDept(nodes: SysDept[], id: number): SysDept | undefined {
  for (const n of nodes) {
    if (n.deptId === id) return n
    if (n.children?.length) {
      const f = findDept(n.children, id)
      if (f) return f
    }
  }
  return undefined
}

// ============= 新增/修改 =============
const dialogVisible = ref(false)
const dialogTitle = ref('新增部門')
const submitting = ref(false)
const formRef = ref<FormInstance>()

const emptyForm: SysDept = {
  deptId: 0,
  parentId: 0,
  deptName: '',
  leader: '',
  phone: '',
  email: '',
  orderNum: 0,
  status: 0
}

const form = reactive<SysDept>({ ...emptyForm })

const rules: FormRules = {
  parentId: [{ required: true, message: '請選擇上級部門', trigger: 'change' }],
  deptName: [{ required: true, message: '請輸入部門名稱', trigger: 'blur' }],
  orderNum: [{ required: true, message: '請輸入排序', trigger: 'blur' }],
  phone: [
    { pattern: /^$|^1[3-9]\d{9}$/, message: '手機號格式不正確', trigger: 'blur' }
  ],
  email: [{ type: 'email', message: '郵箱格式不正確', trigger: 'blur' }]
}

function resetForm() {
  Object.assign(form, emptyForm)
  formRef.value?.clearValidate()
}

function openAdd(row?: SysDept) {
  resetForm()
  dialogTitle.value = '新增部門'
  if (row) form.parentId = row.deptId
  dialogVisible.value = true
}

function openEdit(row: SysDept) {
  resetForm()
  dialogTitle.value = '修改部門'
  Object.assign(form, row)
  dialogVisible.value = true
}

async function submit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (form.deptId && form.deptId !== 0) {
      await updateDept(form)
      ElMessage.success('修改成功')
    } else {
      const { deptId, ...rest } = form
      await addDept(rest)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

// ============= 刪除 =============
async function onDelete(row: SysDept) {
  if (row.children?.length) {
    return ElMessage.warning('該部門下還有子部門，不能刪除')
  }
  try {
    await ElMessageBox.confirm(`確定刪除部門「${row.deptName}」？`, '提示', {
      type: 'warning'
    })
  } catch {
    return
  }
  await deleteDept(row.deptId)
  ElMessage.success('刪除成功')
  fetchList()
}

// ============= 上級部門選項（排除自身及後代） =============
const parentOptions = computed<SysDept[]>(() => {
  const tree = [ROOT_DEPT, ...deptList.value]
  if (!form.deptId || form.deptId === 0) return tree
  return pruneSelf(tree, form.deptId)
})

function pruneSelf(nodes: SysDept[], excludeId: number): SysDept[] {
  return nodes
    .filter((n) => n.deptId !== excludeId)
    .map((n) => ({
      ...n,
      children: n.children?.length ? pruneSelf(n.children, excludeId) : []
    }))
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div class="dept-page">
    <!-- 搜索表單 -->
    <el-card v-show="showSearch" shadow="never" class="dept-page__search">
      <el-form :model="query" inline>
        <el-form-item label="部門名稱">
          <el-input
            v-model="query.deptName"
            placeholder="部門名稱"
            clearable
            style="width: 180px"
            @keyup.enter="onQuery"
          />
        </el-form-item>
        <el-form-item label="狀態">
          <el-select v-model="query.status" placeholder="狀態" clearable style="width: 120px">
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
    <div class="dept-page__toolbar">
      <div>
        <el-button
          v-hasPerms="['system:dept:add']"
          type="primary"
          @click="openAdd()"
        >
          新增
        </el-button>
        <el-button @click="toggleExpandAll">
          {{ allExpanded ? '全部摺疊' : '全部展開' }}
        </el-button>
      </div>
      <RightToolbar v-model:show-search="showSearch" @query-table="fetchList" />
    </div>

    <!-- 樹形表格 -->
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="deptList"
      row-key="deptId"
      :tree-props="{ children: 'children' }"
      :default-expand-all="allExpanded"
      border
      stripe
    >
      <el-table-column label="部門名稱" prop="deptName" min-width="220" />
      <el-table-column label="排序" prop="orderNum" width="80" align="center" />
      <el-table-column label="負責人" prop="leader" width="120" />
      <el-table-column label="電話" prop="phone" width="130" />
      <el-table-column label="狀態" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 0 ? 'success' : 'info'">
            {{ row.status === 0 ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="創建時間" prop="createTime" width="180" />
      <el-table-column label="操作" width="260" fixed="right" align="center">
        <template #default="{ row }">
          <el-button
            v-hasPerms="['system:dept:add']"
            link
            type="primary"
            @click="openAdd(row)"
          >
            新增子部門
          </el-button>
          <el-button
            v-hasPerms="['system:dept:edit']"
            link
            type="primary"
            @click="openEdit(row)"
          >
            修改
          </el-button>
          <el-button
            v-hasPerms="['system:dept:remove']"
            link
            type="danger"
            @click="onDelete(row)"
          >
            刪除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/修改彈窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="上級部門" prop="parentId">
          <TreeSelect
            v-model="form.parentId"
            :data="parentOptions"
            node-key="deptId"
            label-key="deptName"
            placeholder="選擇上級部門"
          />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="部門名稱" prop="deptName">
              <el-input v-model="form.deptName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="負責人">
              <el-input v-model="form.leader" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="電話" prop="phone">
              <el-input v-model="form.phone" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="郵箱" prop="email">
              <el-input v-model="form.email" />
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
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">確定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.dept-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 4px;
  height: 100%;
  overflow: hidden;
}
.dept-page__search :deep(.el-card__body) {
  padding: 16px;
}
.dept-page__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>

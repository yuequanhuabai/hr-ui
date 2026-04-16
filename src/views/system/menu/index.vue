<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  addMenu,
  deleteMenu,
  menuTree as fetchMenuTree,
  updateMenu
} from '@/api/system/menu'
import type { SysMenu } from '@/api/types/system'

type MenuType = 'M' | 'C' | 'F'

const ROOT_MENU: SysMenu = {
  menuId: 0,
  parentId: -1,
  menuName: '頂級菜單',
  menuType: 'M',
  children: []
}

// ============= 列表 =============
const loading = ref(false)
const menuList = ref<SysMenu[]>([])
const showSearch = ref(true)
const tableRef = ref()
const allExpanded = ref(false)

const query = reactive<{ menuName: string; status: number | null }>({
  menuName: '',
  status: null
})

async function fetchList() {
  loading.value = true
  try {
    menuList.value = await fetchMenuTree(query as any)
  } finally {
    loading.value = false
  }
}

function onQuery() {
  fetchList()
}
function onReset() {
  query.menuName = ''
  query.status = null
  onQuery()
}

// ============= 展開/摺疊 =============
function walkMenus(nodes: SysMenu[], cb: (m: SysMenu) => void) {
  for (const n of nodes) {
    cb(n)
    if (n.children?.length) walkMenus(n.children, cb)
  }
}

function toggleExpandAll() {
  allExpanded.value = !allExpanded.value
  walkMenus(menuList.value, (m) => {
    tableRef.value?.toggleRowExpansion?.(m, allExpanded.value)
  })
}

// ============= 新增/修改 =============
const dialogVisible = ref(false)
const dialogTitle = ref('新增菜單')
const submitting = ref(false)
const formRef = ref<FormInstance>()

const emptyForm: SysMenu = {
  menuId: 0,
  parentId: 0,
  menuName: '',
  menuType: 'M',
  path: '',
  component: '',
  perms: '',
  icon: '',
  orderNum: 0,
  visible: 0,
  status: 0
}

const form = reactive<SysMenu>({ ...emptyForm })

const rules = computed<FormRules>(() => ({
  parentId: [{ required: true, message: '請選擇上級菜單', trigger: 'change' }],
  menuName: [{ required: true, message: '請輸入菜單名稱', trigger: 'blur' }],
  menuType: [{ required: true, message: '請選擇菜單類型', trigger: 'change' }],
  orderNum: [{ required: true, message: '請輸入排序', trigger: 'blur' }],
  path: form.menuType === 'C'
    ? [{ required: true, message: '請輸入路由地址', trigger: 'blur' }]
    : [],
  component: form.menuType === 'C'
    ? [{ required: true, message: '請輸入組件路徑', trigger: 'blur' }]
    : [],
  perms: form.menuType === 'F'
    ? [{ required: true, message: '請輸入權限標識', trigger: 'blur' }]
    : []
}))

const showIcon = computed(() => form.menuType !== 'F')
const showPathComponent = computed(() => form.menuType === 'C')
const showVisible = computed(() => form.menuType !== 'F')
const showPerms = computed(() => form.menuType !== 'M')

function resetForm() {
  Object.assign(form, emptyForm)
  formRef.value?.clearValidate()
}

function openAdd(row?: SysMenu) {
  resetForm()
  dialogTitle.value = '新增菜單'
  if (row) form.parentId = row.menuId
  dialogVisible.value = true
}

function openEdit(row: SysMenu) {
  resetForm()
  dialogTitle.value = '修改菜單'
  Object.assign(form, row)
  dialogVisible.value = true
}

async function submit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (form.menuId && form.menuId !== 0) {
      await updateMenu(form)
      ElMessage.success('修改成功')
    } else {
      const { menuId, ...rest } = form
      await addMenu(rest)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

// ============= 刪除 =============
async function onDelete(row: SysMenu) {
  if (row.children?.length) {
    return ElMessage.warning('該菜單下還有子菜單，不能刪除')
  }
  try {
    await ElMessageBox.confirm(`確定刪除菜單「${row.menuName}」？`, '提示', {
      type: 'warning'
    })
  } catch {
    return
  }
  await deleteMenu(row.menuId)
  ElMessage.success('刪除成功')
  fetchList()
}

// ============= 上級菜單選項（排除自身及後代） =============
const parentOptions = computed<SysMenu[]>(() => {
  const tree = [ROOT_MENU, ...filterNonButtons(menuList.value)]
  if (!form.menuId || form.menuId === 0) return tree
  return pruneSelf(tree, form.menuId)
})

function filterNonButtons(nodes: SysMenu[]): SysMenu[] {
  return nodes
    .filter((n) => n.menuType !== 'F')
    .map((n) => ({
      ...n,
      children: n.children?.length ? filterNonButtons(n.children) : []
    }))
}

function pruneSelf(nodes: SysMenu[], excludeId: number): SysMenu[] {
  return nodes
    .filter((n) => n.menuId !== excludeId)
    .map((n) => ({
      ...n,
      children: n.children?.length ? pruneSelf(n.children, excludeId) : []
    }))
}

type TagType = 'primary' | 'success' | 'warning' | 'info' | 'danger'
const menuTypeTag: Record<MenuType, TagType> = {
  M: 'primary',
  C: 'success',
  F: 'warning'
}
const menuTypeLabel: Record<MenuType, string> = {
  M: '目錄',
  C: '菜單',
  F: '按鈕'
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div class="menu-page">
    <!-- 搜索表單 -->
    <el-card v-show="showSearch" shadow="never" class="menu-page__search">
      <el-form :model="query" inline>
        <el-form-item label="菜單名稱">
          <el-input
            v-model="query.menuName"
            placeholder="菜單名稱"
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
    <div class="menu-page__toolbar">
      <div>
        <el-button v-hasPerms="['system:menu:add']" type="primary" @click="openAdd()">
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
      :data="menuList"
      row-key="menuId"
      :tree-props="{ children: 'children' }"
      :default-expand-all="allExpanded"
      border
      stripe
    >
      <el-table-column label="菜單名稱" prop="menuName" min-width="200">
        <template #default="{ row }">
          <el-icon v-if="row.icon" style="vertical-align: middle; margin-right: 4px">
            <component :is="row.icon" />
          </el-icon>
          <span>{{ row.menuName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="類型" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="menuTypeTag[row.menuType as MenuType]">
            {{ menuTypeLabel[row.menuType as MenuType] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="orderNum" width="70" align="center" />
      <el-table-column label="路由地址" prop="path" min-width="140" />
      <el-table-column label="組件路徑" prop="component" min-width="180" />
      <el-table-column label="權限標識" prop="perms" min-width="160" />
      <el-table-column label="狀態" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 0 ? 'success' : 'info'">
            {{ row.status === 0 ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="260" fixed="right" align="center">
        <template #default="{ row }">
          <el-button
            v-if="row.menuType !== 'F'"
            v-hasPerms="['system:menu:add']"
            link
            type="primary"
            @click="openAdd(row)"
          >
            新增
          </el-button>
          <el-button
            v-hasPerms="['system:menu:edit']"
            link
            type="primary"
            @click="openEdit(row)"
          >
            修改
          </el-button>
          <el-button
            v-hasPerms="['system:menu:remove']"
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="680px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="菜單類型" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio-button value="M">目錄</el-radio-button>
                <el-radio-button value="C">菜單</el-radio-button>
                <el-radio-button value="F">按鈕</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="上級菜單" prop="parentId">
              <TreeSelect
                v-model="form.parentId"
                :data="parentOptions"
                node-key="menuId"
                label-key="menuName"
                placeholder="選擇上級菜單"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="菜單名稱" prop="menuName">
              <el-input v-model="form.menuName" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>

          <el-col v-if="showIcon" :span="12">
            <el-form-item label="圖標">
              <IconSelect v-model="(form as any).icon" />
            </el-form-item>
          </el-col>

          <el-col v-if="showPathComponent" :span="12">
            <el-form-item label="路由地址" prop="path">
              <el-input v-model="(form as any).path" placeholder="如 user" />
            </el-form-item>
          </el-col>

          <el-col v-if="showPathComponent" :span="12">
            <el-form-item label="組件路徑" prop="component">
              <el-input v-model="(form as any).component" placeholder="如 system/user/index" />
            </el-form-item>
          </el-col>

          <el-col v-if="showPerms" :span="12">
            <el-form-item label="權限標識" prop="perms">
              <el-input v-model="(form as any).perms" placeholder="如 system:user:add" />
            </el-form-item>
          </el-col>

          <el-col v-if="showVisible" :span="12">
            <el-form-item label="顯示狀態">
              <el-radio-group v-model="form.visible">
                <el-radio :value="0">顯示</el-radio>
                <el-radio :value="1">隱藏</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="菜單狀態">
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
.menu-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 4px;
  height: 100%;
  overflow: hidden;
}
.menu-page__search :deep(.el-card__body) {
  padding: 16px;
}
.menu-page__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  addPost,
  deletePost,
  listPost,
  updatePost
} from '@/api/system/post'
import type { SysPost, SysPostQuery } from '@/api/types/system'

// ============= 列表 =============
const loading = ref(false)
const total = ref(0)
const postList = ref<SysPost[]>([])
const selectedIds = ref<number[]>([])
const showSearch = ref(true)

const query = reactive<SysPostQuery>({
  pageNum: 1,
  pageSize: 10,
  postCode: '',
  postName: '',
  status: null
})

async function fetchList() {
  loading.value = true
  try {
    const res = await listPost(query)
    postList.value = res.rows
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
  query.postCode = ''
  query.postName = ''
  query.status = null
  onQuery()
}

function onSelectionChange(rows: SysPost[]) {
  selectedIds.value = rows.map((r) => r.postId!).filter(Boolean)
}

// ============= 新增/修改 =============
const dialogVisible = ref(false)
const dialogTitle = ref('新增崗位')
const submitting = ref(false)
const formRef = ref<FormInstance>()

const emptyForm: SysPost = {
  postId: undefined,
  postCode: '',
  postName: '',
  orderNum: 0,
  status: 0,
  remark: ''
}

const form = reactive<SysPost>({ ...emptyForm })

const rules: FormRules = {
  postCode: [{ required: true, message: '請輸入崗位編碼', trigger: 'blur' }],
  postName: [{ required: true, message: '請輸入崗位名稱', trigger: 'blur' }],
  orderNum: [{ required: true, message: '請輸入排序', trigger: 'blur' }]
}

function resetForm() {
  Object.assign(form, emptyForm)
  formRef.value?.clearValidate()
}

function openAdd() {
  resetForm()
  dialogTitle.value = '新增崗位'
  dialogVisible.value = true
}

function openEdit(row: SysPost) {
  resetForm()
  dialogTitle.value = '修改崗位'
  Object.assign(form, row)
  dialogVisible.value = true
}

async function submit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (form.postId) {
      await updatePost(form)
      ElMessage.success('修改成功')
    } else {
      await addPost(form)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

// ============= 刪除 =============
async function onDelete(row?: SysPost) {
  const ids = row ? [row.postId!] : selectedIds.value
  if (!ids.length) return ElMessage.warning('請選擇要刪除的崗位')
  try {
    await ElMessageBox.confirm(`確定刪除選中的 ${ids.length} 條記錄？`, '提示', {
      type: 'warning'
    })
  } catch {
    return
  }
  await deletePost(ids)
  ElMessage.success('刪除成功')
  fetchList()
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div class="post-page">
    <!-- 搜索表單 -->
    <el-card v-show="showSearch" shadow="never" class="post-page__search">
      <el-form :model="query" inline>
        <el-form-item label="崗位編碼">
          <el-input
            v-model="query.postCode"
            placeholder="崗位編碼"
            clearable
            style="width: 180px"
            @keyup.enter="onQuery"
          />
        </el-form-item>
        <el-form-item label="崗位名稱">
          <el-input
            v-model="query.postName"
            placeholder="崗位名稱"
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
    <div class="post-page__toolbar">
      <div>
        <el-button v-hasPerms="['system:post:add']" type="primary" @click="openAdd">
          新增
        </el-button>
        <el-button
          v-hasPerms="['system:post:remove']"
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
      :data="postList"
      border
      stripe
      @selection-change="onSelectionChange"
    >
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="崗位ID" prop="postId" width="80" />
      <el-table-column label="崗位編碼" prop="postCode" min-width="140" />
      <el-table-column label="崗位名稱" prop="postName" min-width="140" />
      <el-table-column label="排序" prop="orderNum" width="80" align="center" />
      <el-table-column label="狀態" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 0 ? 'success' : 'info'">
            {{ row.status === 0 ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="創建時間" prop="createTime" width="180" />
      <el-table-column label="操作" width="160" fixed="right" align="center">
        <template #default="{ row }">
          <el-button
            v-hasPerms="['system:post:edit']"
            link
            type="primary"
            @click="openEdit(row)"
          >
            修改
          </el-button>
          <el-button
            v-hasPerms="['system:post:remove']"
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="崗位編碼" prop="postCode">
          <el-input v-model="form.postCode" />
        </el-form-item>
        <el-form-item label="崗位名稱" prop="postName">
          <el-input v-model="form.postName" />
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input-number v-model="form.orderNum" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="狀態">
          <el-radio-group v-model="form.status">
            <el-radio :value="0">正常</el-radio>
            <el-radio :value="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="備註">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">確定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.post-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 4px;
  height: 100%;
  overflow: hidden;
}
.post-page__search :deep(.el-card__body) {
  padding: 16px;
}
.post-page__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>

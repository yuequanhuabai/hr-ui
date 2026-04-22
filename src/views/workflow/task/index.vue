<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span>我的待辦</span>
          <el-button type="primary" plain size="small" @click="fetchTasks">刷新</el-button>
        </div>
      </template>

      <el-table :data="tasks" border stripe v-loading="loading" style="width:100%">
        <el-table-column prop="taskName" label="任務名稱" min-width="120" />
        <el-table-column prop="processDefinitionName" label="流程名稱" min-width="140" />
        <el-table-column prop="processInstanceId" label="流程實例 ID" width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="創建時間" width="170" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="success" size="small" @click="openApprove(row, 'complete')">通過</el-button>
            <el-button link type="danger" size="small" @click="openApprove(row, 'reject')">駁回</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!loading && tasks.length === 0" style="text-align:center;padding:40px;color:#909399">
        暫無待辦任務
      </div>
    </el-card>

    <!-- 審批對話框 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.type === 'complete' ? '審批通過' : '駁回申請'"
      width="460px"
      destroy-on-close
    >
      <el-form :model="dialog" label-width="80px">
        <el-form-item label="任務">
          <span>{{ dialog.task?.taskName }}</span>
        </el-form-item>
        <el-form-item label="審批意見">
          <el-input
            v-model="dialog.comment"
            type="textarea"
            :rows="3"
            :placeholder="dialog.type === 'complete' ? '可填寫審批意見（可選）' : '請填寫駁回原因'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button
          :type="dialog.type === 'complete' ? 'primary' : 'danger'"
          :loading="dialog.submitting"
          @click="handleConfirm"
        >
          確認{{ dialog.type === 'complete' ? '通過' : '駁回' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMyTasks, completeTask, rejectTask, type TaskVO } from '@/api/workflow'

const loading = ref(false)
const tasks = ref<TaskVO[]>([])

const dialog = reactive({
  visible: false,
  type: 'complete' as 'complete' | 'reject',
  task: null as TaskVO | null,
  comment: '',
  submitting: false
})

onMounted(fetchTasks)

async function fetchTasks() {
  loading.value = true
  try {
    tasks.value = await getMyTasks()
  } catch {
    ElMessage.error('加載待辦任務失敗')
  } finally {
    loading.value = false
  }
}

function openApprove(task: TaskVO, type: 'complete' | 'reject') {
  dialog.task = task
  dialog.type = type
  dialog.comment = ''
  dialog.visible = true
}

async function handleConfirm() {
  if (!dialog.task) return
  dialog.submitting = true
  try {
    if (dialog.type === 'complete') {
      await completeTask(dialog.task.taskId, dialog.comment)
      ElMessage.success('審批通過')
    } else {
      await rejectTask(dialog.task.taskId, dialog.comment)
      ElMessage.success('已駁回')
    }
    dialog.visible = false
    fetchTasks()
  } finally {
    dialog.submitting = false
  }
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}
</style>

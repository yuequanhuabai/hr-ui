<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <span>發起請假申請</span>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width:600px">
        <el-form-item label="選擇流程" prop="processKey">
          <el-select
            v-model="form.processKey"
            placeholder="請選擇流程"
            style="width:100%"
            v-loading="processLoading"
          >
            <el-option
              v-for="p in processes"
              :key="p.key"
              :label="p.name"
              :value="p.key"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="假期類型" prop="leaveType">
          <el-select v-model="form.leaveType" style="width:100%">
            <el-option label="年假" value="annual" />
            <el-option label="事假" value="personal" />
            <el-option label="病假" value="sick" />
            <el-option label="婚假" value="marriage" />
            <el-option label="喪假" value="bereavement" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="開始日期" prop="startDate">
          <el-date-picker
            v-model="form.startDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="選擇開始日期"
            style="width:100%"
          />
        </el-form-item>

        <el-form-item label="結束日期" prop="endDate">
          <el-date-picker
            v-model="form.endDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="選擇結束日期"
            style="width:100%"
          />
        </el-form-item>

        <el-form-item label="請假原因" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="3"
            placeholder="請填寫請假原因"
          />
        </el-form-item>

        <el-form-item label="業務單號">
          <el-input v-model="form.businessKey" placeholder="可選，如請假單號" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">提交申請</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { listProcessDefinitions, startProcess, type ProcessDefinitionItem } from '@/api/workflow'

const formRef = ref<FormInstance>()
const processes = ref<ProcessDefinitionItem[]>([])
const processLoading = ref(false)
const submitting = ref(false)

const form = reactive({
  processKey: '',
  leaveType: '',
  startDate: '',
  endDate: '',
  reason: '',
  businessKey: ''
})

const rules: FormRules = {
  processKey: [{ required: true, message: '請選擇流程', trigger: 'change' }],
  leaveType: [{ required: true, message: '請選擇假期類型', trigger: 'change' }],
  startDate: [{ required: true, message: '請選擇開始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '請選擇結束日期', trigger: 'change' }],
  reason: [{ required: true, message: '請填寫請假原因', trigger: 'blur' }]
}

onMounted(async () => {
  processLoading.value = true
  try {
    processes.value = await listProcessDefinitions()
  } catch {
    ElMessage.warning('無法加載流程列表，請確認流程引擎服務已啟動')
  } finally {
    processLoading.value = false
  }
})

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await startProcess({
      processKey: form.processKey,
      businessKey: form.businessKey || undefined,
      variables: {
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason
      }
    })
    ElMessage.success('申請已提交，等待審批')
    handleReset()
  } finally {
    submitting.value = false
  }
}

function handleReset() {
  formRef.value?.resetFields()
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}
</style>

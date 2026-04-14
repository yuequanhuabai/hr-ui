<script setup lang="ts">
const count = ref(0)
const title = import.meta.env.VITE_APP_TITLE
const baseApi = import.meta.env.VITE_APP_BASE_API
</script>

<template>
  <div style="padding: 40px; font-family: sans-serif">
    <h1>HR 前端 · Step 1 驗證</h1>
    <p>環境標題：{{ title }}</p>
    <p>API 基礎路徑：{{ baseApi }}</p>

    <el-button type="primary" @click="count++"> Element Plus 計數器：{{ count }} </el-button>

    <el-divider />

    <el-space>
      <el-tag>默認標籤</el-tag>
      <el-tag type="success">成功</el-tag>
      <el-tag type="warning">警告</el-tag>
      <el-tag type="danger">危險</el-tag>
    </el-space>
  </div>
</template>

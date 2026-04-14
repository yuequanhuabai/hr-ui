<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <el-result icon="error" title="401" sub-title="未授權訪問">
    <template #extra>
      <el-button type="primary" @click="router.push('/login')">去登入</el-button>
    </template>
  </el-result>
</template>

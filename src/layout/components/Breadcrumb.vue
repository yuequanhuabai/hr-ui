<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { RouteLocationMatched } from 'vue-router'

const route = useRoute()

const breadcrumbs = computed<RouteLocationMatched[]>(() =>
  route.matched.filter(
    (item) => item.meta && item.meta.title && item.meta.hidden !== true
  )
)
</script>

<template>
  <el-breadcrumb separator="/" class="breadcrumb">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item
        v-for="(item, index) in breadcrumbs"
        :key="item.path || index"
      >
        <span class="breadcrumb-text">{{ item.meta.title }}</span>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<style scoped>
.breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
}
.breadcrumb-text {
  color: #606266;
}
.breadcrumb-enter-active {
  transition: all 0.3s;
}
.breadcrumb-enter-from {
  opacity: 0;
  transform: translateX(8px);
}
</style>

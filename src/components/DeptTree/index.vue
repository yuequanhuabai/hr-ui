<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ElTree } from 'element-plus'

const props = withDefaults(
  defineProps<{
    data: any[]
    title?: string
    expandAll?: boolean
    nodeKey?: string
    labelKey?: string
    childrenKey?: string
  }>(),
  {
    title: '部門列表',
    expandAll: true,
    nodeKey: 'id',
    labelKey: 'label',
    childrenKey: 'children'
  }
)

const emit = defineEmits<{
  (e: 'nodeClick', node: any): void
}>()

const keyword = ref('')
const treeRef = ref<InstanceType<typeof ElTree>>()

watch(keyword, (val) => {
  treeRef.value?.filter(val)
})

function filterNode(value: string, data: any) {
  if (!value) return true
  const label = data[props.labelKey]
  return typeof label === 'string' && label.includes(value)
}

function handleNodeClick(data: any) {
  emit('nodeClick', data)
}
</script>

<template>
  <div class="dept-tree">
    <div class="dept-tree__header">
      <span class="dept-tree__title">{{ title }}</span>
    </div>
    <el-input v-model="keyword" placeholder="搜索部門" clearable size="small" />
    <el-tree
      ref="treeRef"
      class="dept-tree__body"
      :data="data"
      :props="{ label: labelKey, children: childrenKey }"
      :default-expand-all="expandAll"
      :expand-on-click-node="false"
      :filter-node-method="filterNode"
      :node-key="nodeKey"
      highlight-current
      @node-click="handleNodeClick"
    />
  </div>
</template>

<style scoped>
.dept-tree {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  padding: 12px;
  background: #fff;
  border-radius: 4px;
}
.dept-tree__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dept-tree__title {
  font-weight: 600;
  font-size: 14px;
}
.dept-tree__body {
  flex: 1;
  overflow-y: auto;
}
</style>

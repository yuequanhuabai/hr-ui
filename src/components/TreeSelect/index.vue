<script setup lang="ts">
import { computed } from 'vue'

interface TreeNode {
  id: number | string
  label: string
  children?: TreeNode[]
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue: number | string | null
    data: TreeNode[]
    placeholder?: string
    clearable?: boolean
    checkStrictly?: boolean
    disabled?: boolean
  }>(),
  {
    placeholder: '請選擇',
    clearable: true,
    checkStrictly: true,
    disabled: false
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | string | null): void
  (e: 'change', value: number | string | null): void
}>()

const value = computed({
  get: () => props.modelValue,
  set: (v) => {
    emit('update:modelValue', v)
    emit('change', v)
  }
})

const treeProps = {
  value: 'id',
  label: 'label',
  children: 'children'
}
</script>

<template>
  <el-tree-select
    v-model="value"
    :data="data"
    :props="treeProps"
    :placeholder="placeholder"
    :clearable="clearable"
    :check-strictly="checkStrictly"
    :disabled="disabled"
    :render-after-expand="false"
    node-key="id"
    default-expand-all
    style="width: 100%"
  />
</template>

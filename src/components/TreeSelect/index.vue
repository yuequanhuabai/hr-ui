<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: number | string | null
    data: any[]
    placeholder?: string
    clearable?: boolean
    checkStrictly?: boolean
    disabled?: boolean
    nodeKey?: string
    labelKey?: string
    childrenKey?: string
  }>(),
  {
    placeholder: '請選擇',
    clearable: true,
    checkStrictly: true,
    disabled: false,
    nodeKey: 'id',
    labelKey: 'label',
    childrenKey: 'children'
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

const treeProps = computed(() => ({
  value: props.nodeKey,
  label: props.labelKey,
  children: props.childrenKey
}))
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
    :node-key="nodeKey"
    default-expand-all
    style="width: 100%"
  />
</template>

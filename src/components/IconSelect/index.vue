<script setup lang="ts">
import { computed, ref } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const keyword = ref('')
const popoverVisible = ref(false)

const iconList = computed(() => Object.keys(ElementPlusIconsVue))
const filteredIcons = computed(() => {
  const kw = keyword.value.toLowerCase()
  if (!kw) return iconList.value
  return iconList.value.filter((n) => n.toLowerCase().includes(kw))
})

function selectIcon(name: string) {
  emit('update:modelValue', name)
  popoverVisible.value = false
}

function clearIcon() {
  emit('update:modelValue', '')
}
</script>

<template>
  <el-popover v-model:visible="popoverVisible" placement="bottom-start" :width="380" trigger="click">
    <template #reference>
      <el-input
        :model-value="modelValue"
        placeholder="點擊選擇圖標"
        readonly
        clearable
        @clear="clearIcon"
      >
        <template v-if="modelValue" #prefix>
          <el-icon>
            <component :is="(ElementPlusIconsVue as any)[modelValue]" />
          </el-icon>
        </template>
      </el-input>
    </template>

    <div class="icon-select">
      <el-input v-model="keyword" placeholder="搜索圖標" clearable size="small" />
      <div class="icon-select__grid">
        <div
          v-for="name in filteredIcons"
          :key="name"
          class="icon-select__item"
          :class="{ active: name === modelValue }"
          :title="name"
          @click="selectIcon(name)"
        >
          <el-icon :size="20">
            <component :is="(ElementPlusIconsVue as any)[name]" />
          </el-icon>
        </div>
      </div>
    </div>
  </el-popover>
</template>

<style scoped>
.icon-select {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.icon-select__grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  max-height: 280px;
  overflow-y: auto;
  padding: 4px;
}
.icon-select__item {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 4px;
  transition: all 0.2s;
}
.icon-select__item:hover {
  background: #f5f7fa;
  border-color: #409eff;
}
.icon-select__item.active {
  color: #fff;
  background: #409eff;
  border-color: #409eff;
}
</style>

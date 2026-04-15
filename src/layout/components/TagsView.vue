<script setup lang="ts">
import { computed, nextTick, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore, type TagView } from '@/store/modules/tagsView'

const route = useRoute()
const router = useRouter()
const tagsViewStore = useTagsViewStore()

const visitedViews = computed(() => tagsViewStore.visitedViews)

function isActive(tag: TagView): boolean {
  return tag.path === route.path
}
function isAffix(tag: TagView): boolean {
  return tag.meta?.affix === true
}

watch(
  () => route.path,
  () => {
    if (route.name) tagsViewStore.addView(route)
  },
  { immediate: true }
)

function goto(tag: TagView) {
  if (tag.path !== route.path) router.push(tag.fullPath)
}

function closeTag(tag: TagView) {
  if (isAffix(tag)) return
  const wasActive = isActive(tag)
  tagsViewStore.delView(tag.path)
  if (wasActive) {
    const remaining = visitedViews.value
    const last = remaining[remaining.length - 1]
    router.push(last ? last.fullPath : '/dashboard')
  }
}

// ===== 右鍵菜單 =====
const menuVisible = ref(false)
const menuTop = ref(0)
const menuLeft = ref(0)
const menuTarget = ref<TagView | null>(null)

function openMenu(tag: TagView, e: MouseEvent) {
  e.preventDefault()
  menuTarget.value = tag
  menuLeft.value = e.clientX
  menuTop.value = e.clientY
  menuVisible.value = true
}
function closeMenu() {
  menuVisible.value = false
  menuTarget.value = null
}
function closeCurrent() {
  if (menuTarget.value) closeTag(menuTarget.value)
  closeMenu()
}
function closeOthers() {
  if (menuTarget.value) {
    tagsViewStore.delOthersViews(menuTarget.value.path)
    if (!isActive(menuTarget.value)) router.push(menuTarget.value.fullPath)
  }
  closeMenu()
}
function closeAll() {
  tagsViewStore.delAllViews()
  router.push('/dashboard')
  closeMenu()
}

onMounted(() => document.addEventListener('click', closeMenu))
onBeforeUnmount(() => document.removeEventListener('click', closeMenu))

// 切換路由時滾動到激活項
const scrollRef = ref<HTMLElement | null>(null)
watch(
  () => route.path,
  () => {
    nextTick(() => {
      const active = scrollRef.value?.querySelector('.tag-item.active') as HTMLElement | null
      active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    })
  }
)
</script>

<template>
  <div class="tags-view">
    <div ref="scrollRef" class="tags-scroll">
      <div
        v-for="tag in visitedViews"
        :key="tag.path"
        class="tag-item"
        :class="{ active: isActive(tag), affix: isAffix(tag) }"
        @click="goto(tag)"
        @contextmenu="openMenu(tag, $event)"
      >
        <span class="tag-text">{{ tag.title }}</span>
        <el-icon v-if="!isAffix(tag)" class="tag-close" @click.stop="closeTag(tag)">
          <Close />
        </el-icon>
      </div>
    </div>

    <ul
      v-show="menuVisible"
      class="context-menu"
      :style="{ top: menuTop + 'px', left: menuLeft + 'px' }"
    >
      <li @click="closeCurrent">關閉</li>
      <li @click="closeOthers">關閉其他</li>
      <li @click="closeAll">關閉所有</li>
    </ul>
  </div>
</template>

<style scoped>
.tags-view {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  height: 34px;
  display: flex;
  align-items: center;
  padding: 0 8px;
}
.tags-scroll {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: thin;
}
.tags-scroll::-webkit-scrollbar {
  height: 3px;
}
.tag-item {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  font-size: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 3px;
  background: #fff;
  color: #495060;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
  transition: all 0.15s;
}
.tag-item:hover {
  color: #409eff;
}
.tag-item.active {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}
.tag-item.active::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  margin-right: 6px;
}
.tag-close {
  margin-left: 4px;
  font-size: 12px;
  border-radius: 50%;
  padding: 1px;
  transition: background 0.15s;
}
.tag-close:hover {
  background: rgba(0, 0, 0, 0.15);
}
.context-menu {
  position: fixed;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 4px 0;
  margin: 0;
  z-index: 3000;
  min-width: 100px;
}
.context-menu li {
  padding: 6px 16px;
  font-size: 13px;
  cursor: pointer;
  color: #606266;
}
.context-menu li:hover {
  background: #f5f7fa;
  color: #409eff;
}
</style>

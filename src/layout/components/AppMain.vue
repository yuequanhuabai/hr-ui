<script setup lang="ts">
import { computed } from 'vue'
import { useTagsViewStore } from '@/store/modules/tagsView'

const tagsViewStore = useTagsViewStore()

const cachedViews = computed(() => tagsViewStore.cachedViews)
</script>

<template>
  <section class="app-main">
    <router-view v-slot="{ Component, route: currentRoute }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="cachedViews">
          <component :is="Component" :key="currentRoute.path" />
        </keep-alive>
      </transition>
    </router-view>
  </section>
</template>

<style scoped>
.app-main {
  flex: 1;
  overflow: auto;
  background: #f0f2f5;
  padding: 16px;
  box-sizing: border-box;
}

.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.2s ease;
}
.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-8px);
}
.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(8px);
}
</style>

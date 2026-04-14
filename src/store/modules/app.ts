import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Device = 'desktop' | 'mobile'

const SIDEBAR_KEY = 'hr-sidebar-collapsed'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref<boolean>(localStorage.getItem(SIDEBAR_KEY) === '1')
  const device = ref<Device>('desktop')

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem(SIDEBAR_KEY, sidebarCollapsed.value ? '1' : '0')
  }

  function setDevice(d: Device) {
    device.value = d
  }

  return {
    sidebarCollapsed,
    device,
    toggleSidebar,
    setDevice
  }
})

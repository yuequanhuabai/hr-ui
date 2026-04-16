import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Device = 'desktop' | 'mobile'

const SIDEBAR_COLLAPSED_KEY = 'hr-sidebar-collapsed'
const SIDEBAR_WIDTH_KEY = 'hr-sidebar-width'

export const SIDEBAR_MIN_WIDTH = 160
export const SIDEBAR_MAX_WIDTH = 400
export const SIDEBAR_DEFAULT_WIDTH = 210
export const SIDEBAR_COLLAPSED_WIDTH = 64

function readStoredWidth(): number {
  const raw = localStorage.getItem(SIDEBAR_WIDTH_KEY)
  const n = raw ? Number(raw) : NaN
  if (!Number.isFinite(n)) return SIDEBAR_DEFAULT_WIDTH
  return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, n))
}

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref<boolean>(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1')
  const sidebarWidth = ref<number>(readStoredWidth())
  const device = ref<Device>('desktop')

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, sidebarCollapsed.value ? '1' : '0')
  }

  function setSidebarWidth(w: number) {
    const clamped = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, Math.round(w)))
    sidebarWidth.value = clamped
    localStorage.setItem(SIDEBAR_WIDTH_KEY, String(clamped))
  }

  function setDevice(d: Device) {
    device.value = d
  }

  return {
    sidebarCollapsed,
    sidebarWidth,
    device,
    toggleSidebar,
    setSidebarWidth,
    setDevice
  }
})

import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/store/modules/user'

const ALL_PERMISSION = '*:*:*'

function check(value: unknown): boolean {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('v-hasPerms 需要綁定一個非空數組，例如 v-hasPerms="[\'system:user:add\']"')
  }

  const userStore = useUserStore()
  const perms = userStore.permissions || []

  if (perms.includes(ALL_PERMISSION)) return true
  return (value as string[]).some((p) => perms.includes(p))
}

export const hasPerms: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    if (!check(binding.value)) {
      el.parentNode?.removeChild(el)
    }
  }
}

export default hasPerms

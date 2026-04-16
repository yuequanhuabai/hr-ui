import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/store/modules/user'

const SUPER_ROLE = 'admin'

function check(value: unknown): boolean {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('v-hasRoles 需要綁定一個非空數組，例如 v-hasRoles="[\'admin\']"')
  }

  const userStore = useUserStore()
  const roles = userStore.roles || []

  if (roles.includes(SUPER_ROLE)) return true
  return (value as string[]).some((r) => roles.includes(r))
}

export const hasRoles: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    if (!check(binding.value)) {
      el.parentNode?.removeChild(el)
    }
  }
}

export default hasRoles

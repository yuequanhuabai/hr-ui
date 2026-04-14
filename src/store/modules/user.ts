import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as authApi from '@/api/auth'
import type { LoginBody, UserInfo } from '@/api/types/auth'
import { getToken, removeToken, setToken } from '@/utils/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken() || '')
  const userInfo = ref<UserInfo | null>(null)
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])

  async function login(loginBody: LoginBody) {
    const { token: newToken } = await authApi.login(loginBody)
    setToken(newToken)
    token.value = newToken
  }

  async function getInfo() {
    const info = await authApi.getInfo()
    userInfo.value = info
    roles.value = info.roles || []
    permissions.value = info.permissions || []
    return info
  }

  async function logout() {
    try {
      await authApi.logout()
    } finally {
      resetState()
    }
  }

  function resetState() {
    removeToken()
    token.value = ''
    userInfo.value = null
    roles.value = []
    permissions.value = []
  }

  return {
    token,
    userInfo,
    roles,
    permissions,
    login,
    getInfo,
    logout,
    resetState
  }
})

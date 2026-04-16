import { request } from '@/api/request'
import type { SysUser, SysUserProfile } from '@/api/types/system'

export function getProfile() {
  return request<SysUserProfile>({
    url: '/system/user/profile',
    method: 'get'
  })
}

export function updateProfile(data: Partial<SysUser>) {
  return request<void>({
    url: '/system/user/profile',
    method: 'put',
    data
  })
}

export function updateProfilePassword(oldPassword: string, newPassword: string) {
  return request<void>({
    url: '/system/user/profile/updatePwd',
    method: 'put',
    params: { oldPassword, newPassword }
  })
}

export function uploadAvatar(file: File) {
  const form = new FormData()
  form.append('avatarfile', file)
  return request<{ imgUrl: string }>({
    url: '/system/user/profile/avatar',
    method: 'post',
    data: form,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

import { request } from './request'
import type { LoginBody, LoginResult, MenuItem, UserInfo } from './types/auth'

export function login(data: LoginBody) {
  return request<LoginResult>({
    url: '/login',
    method: 'post',
    data
  })
}

export function logout() {
  return request<void>({
    url: '/logout',
    method: 'post'
  })
}

export function getInfo() {
  return request<UserInfo>({
    url: '/getInfo',
    method: 'get'
  })
}

export function getRouters() {
  return request<MenuItem[]>({
    url: '/getRouters',
    method: 'get'
  })
}

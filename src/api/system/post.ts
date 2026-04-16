import { request } from '@/api/request'
import type {
  PageResult,
  SysPost,
  SysPostQuery
} from '@/api/types/system'

export function listPost(params: SysPostQuery) {
  return request<PageResult<SysPost>>({
    url: '/system/post/list',
    method: 'get',
    params
  })
}

export function postAll() {
  return request<SysPost[]>({
    url: '/system/post/all',
    method: 'get'
  })
}

export function getPost(postId: number) {
  return request<SysPost>({
    url: `/system/post/${postId}`,
    method: 'get'
  })
}

export function addPost(data: SysPost) {
  return request<void>({
    url: '/system/post',
    method: 'post',
    data
  })
}

export function updatePost(data: SysPost) {
  return request<void>({
    url: '/system/post',
    method: 'put',
    data
  })
}

export function deletePost(postIds: number | number[]) {
  const ids = Array.isArray(postIds) ? postIds.join(',') : postIds
  return request<void>({
    url: `/system/post/${ids}`,
    method: 'delete'
  })
}

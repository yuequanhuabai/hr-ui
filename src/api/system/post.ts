import { request } from '@/api/request'
import type { SysPost } from '@/api/types/system'

export function postAll() {
  return request<SysPost[]>({
    url: '/system/post/all',
    method: 'get'
  })
}

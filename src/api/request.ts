import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getToken, removeToken } from '@/utils/auth'
import type { ApiResponse } from './types/common'

const BUSINESS_OK = 200
const HTTP_UNAUTHORIZED = 401

let isReloginPrompting = false

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 15000
})

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log(
      '[HTTP →]',
      config.method?.toUpperCase(),
      (config.baseURL || '') + (config.url || ''),
      { params: config.params, data: config.data, headers: config.headers }
    )
    return config
  },
  (error) => {
    console.error('[HTTP → ✗]', error)
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    console.log('[HTTP ←]', response.config.url, response.status, response.data)
    const { code, msg, data } = response.data

    if (code === BUSINESS_OK) {
      return data
    }

    if (code === HTTP_UNAUTHORIZED) {
      handleUnauthorized()
      return Promise.reject(new Error(msg || '登入狀態已失效'))
    }

    ElMessage.error(msg || '請求失敗')
    return Promise.reject(new Error(msg || 'Error'))
  },
  (error) => {
    console.error('[HTTP ✗]', error.config?.url, error.response?.status, error.response?.data || error.message)
    const status = error.response?.status
    const msg = error.response?.data?.msg || error.message || '網絡錯誤'

    if (status === HTTP_UNAUTHORIZED) {
      handleUnauthorized()
    } else {
      ElMessage.error(msg)
    }

    return Promise.reject(error)
  }
)

function handleUnauthorized(): void {
  if (isReloginPrompting) return
  isReloginPrompting = true

  ElMessageBox.confirm('登入狀態已過期，是否重新登入？', '提示', {
    confirmButtonText: '重新登入',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      removeToken()
      window.location.href = '/login'
    })
    .catch(() => {
      isReloginPrompting = false
    })
}

export function request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
  return service(config) as unknown as Promise<T>
}

export default service

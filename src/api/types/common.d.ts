export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
}

export interface PageResult<T> {
  rows: T[]
  total: number
}

export interface PageQuery {
  pageNum: number
  pageSize: number
}

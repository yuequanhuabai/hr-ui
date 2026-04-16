export interface PageQuery {
  pageNum?: number
  pageSize?: number
  orderByColumn?: string
  isAsc?: 'asc' | 'desc'
}

export interface PageResult<T> {
  total: number
  rows: T[]
  pageNum: number
  pageSize: number
}

export interface SysUser {
  userId?: number
  deptId?: number | null
  postId?: number | null
  username?: string
  password?: string
  nickname?: string
  email?: string
  phone?: string
  gender?: number
  avatar?: string
  status?: number
  loginIp?: string
  loginTime?: string
  remark?: string
  roleIds?: number[]
  createBy?: string
  createTime?: string
}

export interface SysUserQuery extends PageQuery {
  deptId?: number | null
  username?: string
  phone?: string
  status?: number | null
}

export interface SysDept {
  deptId: number
  parentId: number
  deptName: string
  orderNum?: number
  leader?: string
  phone?: string
  email?: string
  status?: number
  children?: SysDept[]
}

export interface SysRole {
  roleId: number
  roleName: string
  roleKey: string
  roleSort?: number
  dataScope?: number
  status?: number
  remark?: string
}

export interface SysPost {
  postId: number
  postCode: string
  postName: string
  postSort?: number
  status?: number
  remark?: string
}

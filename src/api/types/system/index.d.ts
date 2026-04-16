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
  ancestors?: string
  orderNum?: number
  leader?: string
  phone?: string
  email?: string
  status?: number
  children?: SysDept[]
  createTime?: string
}

export interface SysDeptQuery {
  deptName?: string
  status?: number | null
}

export interface SysRole {
  roleId?: number
  roleKey?: string
  roleName?: string
  dataScope?: number
  orderNum?: number
  status?: number
  remark?: string
  menuIds?: number[]
  deptIds?: number[]
  createTime?: string
}

export interface SysRoleQuery extends PageQuery {
  roleName?: string
  roleKey?: string
  status?: number | null
}

export interface SysPost {
  postId?: number
  postCode?: string
  postName?: string
  orderNum?: number
  status?: number
  remark?: string
  createTime?: string
}

export interface SysPostQuery extends PageQuery {
  postCode?: string
  postName?: string
  status?: number | null
}

export interface SysUserProfile {
  user: SysUser
  roleGroup?: string
  postGroup?: string
  deptName?: string
}

export interface SysMenu {
  menuId: number
  parentId: number
  menuName: string
  menuType: 'M' | 'C' | 'F'
  path?: string | null
  component?: string | null
  perms?: string | null
  icon?: string | null
  orderNum?: number
  visible?: number
  status?: number
  children?: SysMenu[]
}

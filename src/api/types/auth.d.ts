export interface LoginBody {
  username: string
  password: string
}

export interface LoginResult {
  token: string
}

export interface UserInfo {
  userId: number
  username: string
  nickname: string
  deptId: number | null
  roles: string[]
  permissions: string[]
}

export interface MenuItem {
  menuId: number
  menuName: string
  menuType: 'M' | 'C' | 'F'
  path: string | null
  component: string | null
  perms: string | null
  icon: string | null
  orderNum: number
  visible: number
  status: number
  parentId: number
  children?: MenuItem[]
}

import type { App } from 'vue'
import hasPerms from './permission/hasPerms'
import hasRoles from './permission/hasRoles'

export function setupDirectives(app: App): void {
  app.directive('hasPerms', hasPerms)
  app.directive('hasRoles', hasRoles)
}

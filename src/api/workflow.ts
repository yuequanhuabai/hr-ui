import service from './request'

export interface StartProcessDTO {
  processKey: string
  businessKey?: string
  variables?: Record<string, unknown>
}

export interface TaskVO {
  taskId: string
  taskName: string
  processDefinitionName: string
  processInstanceId: string
  assignee: string
  createTime: string
  variables?: Record<string, unknown>
}

export interface ProcessDefinitionItem {
  id: string
  key: string
  name: string
  version: number
}

export function listProcessDefinitions(): Promise<ProcessDefinitionItem[]> {
  return service.get('/workflow/processes')
}

export function startProcess(data: StartProcessDTO): Promise<void> {
  return service.post('/workflow/start', data)
}

export function getMyTasks(): Promise<TaskVO[]> {
  return service.get('/workflow/my-tasks')
}

export function completeTask(taskId: string, comment?: string, variables?: Record<string, unknown>): Promise<void> {
  return service.post(`/workflow/task/${taskId}/complete`, { comment: comment ?? '', variables: variables ?? {} })
}

export function rejectTask(taskId: string, comment: string): Promise<void> {
  return service.post(`/workflow/task/${taskId}/reject`, { comment })
}

import {
  Employee, EmployeeCreate, EmployeeUpdate,
  Device, DeviceCreate, DeviceUpdate,
  Assignment, AssignmentDetailed, AssignmentCreate,
  DeviceHistoryEntry, EmployeeHistoryEntry,
  StatusChangeRequest, DeviceStatusLogEntry,
  DeviceStatus, DeviceStatusTransition,
} from './types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `Request failed: ${res.status}`)
  }
  return res.json()
}

// =====================================================
// Employees
// =====================================================
export const employeeApi = {
  list: () => request<Employee[]>('/employees/'),
  get: (id: number) => request<Employee>(`/employees/${id}`),
  create: (data: EmployeeCreate) => request<Employee>('/employees/', {
    method: 'POST', body: JSON.stringify(data)
  }),
  update: (id: number, data: EmployeeUpdate) => request<Employee>(`/employees/${id}`, {
    method: 'PATCH', body: JSON.stringify(data)
  }),
  remove: (id: number) => request<void>(`/employees/${id}`, { method: 'DELETE' }),
}

// =====================================================
// Devices
// =====================================================
export const deviceApi = {
  list: () => request<Device[]>('/devices/'),
  get: (id: number) => request<Device>(`/devices/${id}`),
  create: (data: DeviceCreate) => request<Device>('/devices/', {
    method: 'POST', body: JSON.stringify(data)
  }),
  update: (id: number, data: DeviceUpdate) => request<Device>(`/devices/${id}`, {
    method: 'PATCH', body: JSON.stringify(data)
  }),
  remove: (id: number) => request<void>(`/devices/${id}`, { method: 'DELETE' }),
  changeStatus: (id: number, data: StatusChangeRequest) =>
    request<Device>(`/devices/${id}/status`, { method: 'POST', body: JSON.stringify(data) }),
  statusLog: (id: number) => request<DeviceStatusLogEntry[]>(`/devices/${id}/status-log`),

}

// =====================================================
// Assignments
// =====================================================
export const assignmentApi = {
  list: () => request<AssignmentDetailed[]>('/assignments/'),
  create: (data: AssignmentCreate) => request<Assignment>('/assignments/', {
    method: 'POST', body: JSON.stringify(data)
  }),
  return: (assignmentId: number) => request<Assignment>(`/assignments/${assignmentId}/return`, {
    method: 'PATCH', body: JSON.stringify({})
  }),
}

// =====================================================
// History
// =====================================================
export const historyApi = {
  forDevice: (deviceId: number) =>
    request<DeviceHistoryEntry[]>(`/devices/${deviceId}/history`),
  forEmployee: (employeeId: number) =>
    request<EmployeeHistoryEntry[]>(`/employees/${employeeId}/history`),
}


// ── Statuses ──────────────────────────────────────
export const statusApi = {
  list: () => request<DeviceStatus[]>('/statuses/'),
  transitions: (status: string) => request<DeviceStatusTransition[]>(`/statuses/${status}/transitions`),
}

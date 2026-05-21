import {
  Employee, EmployeeCreate, EmployeeUpdate,
  Computer, ComputerCreate, ComputerUpdate,
  Assignment, AssignmentDetailed, AssignmentCreate
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
// Computers
// =====================================================
export const computerApi = {
  list: () => request<Computer[]>('/computers/'),
  get: (id: number) => request<Computer>(`/computers/${id}`),
  create: (data: ComputerCreate) => request<Computer>('/computers/', {
    method: 'POST', body: JSON.stringify(data)
  }),
  update: (id: number, data: ComputerUpdate) => request<Computer>(`/computers/${id}`, {
    method: 'PATCH', body: JSON.stringify(data)
  }),
  remove: (id: number) => request<void>(`/computers/${id}`, { method: 'DELETE' }),
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
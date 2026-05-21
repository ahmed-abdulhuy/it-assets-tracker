// =====================================================
// Types mirroring the FastAPI Pydantic schemas
// =====================================================

export interface Employee {
  employee_id: number
  first_name: string
  last_name: string
  email: string | null
  job_title: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EmployeeCreate {
  first_name: string
  last_name: string
  email?: string
  job_title?: string
  is_active?: boolean
}

export interface EmployeeUpdate {
  first_name?: string
  last_name?: string
  email?: string
  job_title?: string
  is_active?: boolean
}

export interface Computer {
  computer_id: number
  device_type: string
  model: string | null
  specs: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface ComputerCreate {
  device_type: string
  model?: string
  specs?: string
  status?: string
}

export interface ComputerUpdate {
  device_type?: string
  model?: string
  specs?: string
  status?: string
}

export interface Assignment {
  assignment_id: number
  computer_id: number
  employee_id: number
  assigned_at: string
  returned_at: string | null
  assigned_by: string | null
}

export interface AssignmentDetailed extends Assignment {
  employee: Employee
  computer: Computer
}

export interface AssignmentCreate {
  computer_id: number
  employee_id: number
  assigned_by?: string
}
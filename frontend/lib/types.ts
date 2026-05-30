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

export interface Device {
  device_id: number
  device_type: string
  model: string | null
  specs: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface DeviceCreate {
  device_type: string
  model?: string
  specs?: string
  status?: string
}

export interface DeviceUpdate {
  device_type?: string
  model?: string
  specs?: string
  status?: string
}

export interface Assignment {
  assignment_id: number
  device_id: number
  employee_id: number
  assigned_at: string
  returned_at: string | null
  assigned_by: string | null
}

export interface AssignmentDetailed extends Assignment {
  employee: Employee
  device: Device
}

export interface AssignmentCreate {
  device_id: number
  employee_id: number
  assigned_by?: string
}

export interface DeviceHistoryEntry {
  assignment_id: number
  employee: Employee
  assigned_at: string
  returned_at: string | null
  assigned_by: string | null
  close_reason: string | null
}
 
export interface EmployeeHistoryEntry {
  assignment_id: number
  device: Device
  assigned_at: string
  returned_at: string | null
  assigned_by: string | null
}


// ── Status management ─────────────────────────────
 
export interface DeviceStatus {
  status: string
  label: string
  color: string
  description: string | null
  is_terminal: boolean
}
 
export interface DeviceStatusTransition {
  from_status: string
  to_status: string
  label: string | null
  description: string | null
  requires_return: boolean
  to_status_obj: DeviceStatus
}
 
export interface StatusChangeRequest {
  to_status: string
  changed_by?: string
  note?: string
}
 
export interface DeviceStatusLogEntry {
  log_id: number
  device_id: number
  from_status: string | null
  to_status: string
  changed_by: string | null
  note: string | null
  changed_at: string
}

'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { employeeApi, deviceApi } from '@/lib/api'
import { AssignmentCreate } from '@/lib/types'

interface Props {
  onSubmit: (data: AssignmentCreate) => Promise<void>
  onClose: () => void
  loading?: boolean
}

export function AssignmentForm({ onSubmit, onClose, loading }: Props) {
  const [form, setForm] = useState<AssignmentCreate>({
    device_id: 0,
    employee_id: 0,
    assigned_by: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: employeeApi.list })
  const { data: devices } = useQuery({ queryKey: ['devices'], queryFn: deviceApi.list })

  const activeEmployees  = employees?.filter(e => e.is_active) ?? []
  const availableDevices = devices?.filter(c => c.status === 'available') ?? []

  function validate() {
    const e: Record<string, string> = {}
    if (!form.device_id) e.device_id = 'Select a device'
    if (!form.employee_id) e.employee_id = 'Select an employee'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({ ...form, assigned_by: form.assigned_by || undefined })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span>New record</span>
            <strong>Assign Device</strong>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>Device</label>
              <select
                value={form.device_id || ''}
                onChange={e => setForm(f => ({ ...f, device_id: Number(e.target.value) }))}
              >
                <option value="">— Select available device —</option>
                {availableDevices.map(c => (
                  <option key={c.device_id} value={c.device_id}>
                    [{c.device_id}] {c.device_type}{c.model ? ` · ${c.model}` : ''}
                  </option>
                ))}
              </select>
              {errors.device_id && <span className="field-error">{errors.device_id}</span>}
              {devices && availableDevices.length === 0 && (
                <span className="field-error">No available devices.</span>
              )}
            </div>

            <div className="field">
              <label>Employee</label>
              <select
                value={form.employee_id || ''}
                onChange={e => setForm(f => ({ ...f, employee_id: Number(e.target.value) }))}
              >
                <option value="">— Select active employee —</option>
                {activeEmployees.map(emp => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    [{emp.employee_id}] {emp.first_name} {emp.last_name}{emp.job_title ? ` · ${emp.job_title}` : ''}
                  </option>
                ))}
              </select>
              {errors.employee_id && <span className="field-error">{errors.employee_id}</span>}
            </div>

            <div className="field">
              <label>Assigned By <span style={{ color: 'var(--text-dim)' }}>(optional)</span></label>
              <input
                placeholder="e.g. IT Admin"
                value={form.assigned_by}
                onChange={e => setForm(f => ({ ...f, assigned_by: e.target.value }))}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Assigning...' : 'Assign Device'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
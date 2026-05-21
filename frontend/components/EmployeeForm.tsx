'use client'

import { useState, useEffect } from 'react'
import { Employee, EmployeeCreate, EmployeeUpdate } from '@/lib/types'

interface Props {
  initial?: Employee
  onSubmit: (data: EmployeeCreate | EmployeeUpdate) => Promise<void>
  onClose: () => void
  loading?: boolean
}

export function EmployeeForm({ initial, onSubmit, onClose, loading }: Props) {
  const [form, setForm] = useState({
    first_name: initial?.first_name ?? '',
    last_name:  initial?.last_name  ?? '',
    email:      initial?.email      ?? '',
    job_title:  initial?.job_title  ?? '',
    is_active:  initial?.is_active  ?? true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!form.first_name.trim()) e.first_name = 'Required'
    if (!form.last_name.trim())  e.last_name  = 'Required'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({
      ...form,
      email:     form.email     || undefined,
      job_title: form.job_title || undefined,
    })
  }

  function field(key: string, label: string, placeholder = '') {
    return (
      <div className="field">
        <label>{label}</label>
        <input
          placeholder={placeholder}
          value={(form as any)[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        />
        {errors[key] && <span className="field-error">{errors[key]}</span>}
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span>{initial ? 'Edit record' : 'New record'}</span>
            <strong>{initial ? 'Edit Employee' : 'Add Employee'}</strong>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-row">
              {field('first_name', 'First Name', 'Jane')}
              {field('last_name',  'Last Name',  'Doe')}
            </div>
            {field('email',     'Email',     'jane.doe@company.com')}
            {field('job_title', 'Job Title', 'IT Engineer')}
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
              />
              Active employee
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : initial ? 'Save Changes' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
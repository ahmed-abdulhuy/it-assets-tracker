'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeApi } from '@/lib/api'
import { Employee, EmployeeUpdate } from '@/lib/types'
import { EmployeeForm } from '@/components/EmployeeForm'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'

export function EmployeeTable() {
  const qc = useQueryClient()
  const { toast } = useToast()

  const { data: employees, isLoading, isError } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeApi.list,
  })

  const [editing, setEditing]   = useState<Employee | null>(null)
  const [deleting, setDeleting] = useState<Employee | null>(null)

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; payload: EmployeeUpdate }) => employeeApi.update(data.id, data.payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      toast('Employee updated.', 'success')
      setEditing(null)
    },
    onError: (e: Error) => toast(e.message, 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => employeeApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      toast('Employee deleted.', 'success')
      setDeleting(null)
    },
    onError: (e: Error) => toast(e.message, 'error'),
  })

  if (isLoading) return <div className="state-loading"><span className="state-icon">◌</span>Loading employees...</div>
  if (isError)   return <div className="state-error"><span className="state-icon">✕</span>Failed to load employees.</div>

  return (
    <>
      <div className="table-wrap">
        {!employees?.length ? (
          <div className="state-empty"><span className="state-icon">○</span>No employees found.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Job Title</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.employee_id}>
                  <td className="td-mono">{emp.employee_id}</td>
                  <td><strong>{emp.first_name} {emp.last_name}</strong></td>
                  <td className="td-mono">{emp.email ?? '—'}</td>
                  <td>{emp.job_title ?? '—'}</td>
                  <td>
                    <span className={`badge ${emp.is_active ? 'badge-green' : 'badge-gray'}`}>
                      {emp.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing(emp)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleting(emp)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <EmployeeForm
          initial={editing}
          loading={updateMutation.isPending}
          onClose={() => setEditing(null)}
          onSubmit={async payload => {
            await updateMutation.mutateAsync({id: editing.employee_id, payload})}
          }
          // onSubmit={payload => updateMutation.mutateAsync({ id: editing.employee_id, payload })}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete Employee"
          danger
          message={<>Remove <strong>{deleting.first_name} {deleting.last_name}</strong> permanently? This cannot be undone.</>}
          confirmLabel="Delete"
          loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleting.employee_id)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
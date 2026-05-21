'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeApi } from '@/lib/api'
import { EmployeeTable } from '@/components/EmployeeTable'
import { EmployeeForm } from '@/components/EmployeeForm'
import { ToastProvider, useToast } from '@/components/Toast'

function PageContent() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [showCreate, setShowCreate] = useState(false)

  const createMutation = useMutation({
    mutationFn: employeeApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      toast('Employee created.', 'success')
      setShowCreate(false)
    },
    onError: (e: Error) => toast(e.message, 'error'),
  })

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <span>Directory</span>
          <strong>Employees</strong>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + Add Employee
        </button>
      </div>

      <EmployeeTable />

      {showCreate && (
        <EmployeeForm
          loading={createMutation.isPending}
          onClose={() => setShowCreate(false)}
          onSubmit={data => createMutation.mutateAsync(data as any)}
        />
      )}
    </>
  )
}

export default function EmployeesPage() {
  return <ToastProvider><PageContent /></ToastProvider>
}
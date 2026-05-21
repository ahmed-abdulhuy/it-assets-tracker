'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { assignmentApi } from '@/lib/api'
import { AssignmentTable } from '@/components/AssignmentTable'
import { AssignmentForm } from '@/components/AssignmentForm'
import { ToastProvider, useToast } from '@/components/Toast'

function PageContent() {
  const qc = useQueryClient() 
  const { toast } = useToast()
  const [showCreate, setShowCreate] = useState(false)

  const createMutation = useMutation({
    mutationFn: assignmentApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] })
      qc.invalidateQueries({ queryKey: ['computers'] })
      toast('Computer assigned.', 'success')
      setShowCreate(false)
    },
    onError: (e: Error) => toast(e.message, 'error'),
  })

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <span>Tracking</span>
          <strong>Assignments</strong>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + Assign Computer
        </button>
      </div>

      <AssignmentTable />

      {showCreate && (
        <AssignmentForm
          loading={createMutation.isPending}
          onClose={() => setShowCreate(false)}
          onSubmit={data => createMutation.mutateAsync(data)}
        />
      )}
    </>
  )
}

export default function AssignmentsPage() {
  return <ToastProvider><PageContent /></ToastProvider>
}
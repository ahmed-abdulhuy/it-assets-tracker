'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { computerApi } from '@/lib/api'
import { ComputerTable } from '@/components/ComputerTable'
import { ComputerForm } from '@/components/ComputerForm'
import { ToastProvider, useToast } from '@/components/Toast'

function PageContent() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [showCreate, setShowCreate] = useState(false)

  const createMutation = useMutation({
    mutationFn: computerApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['computers'] })
      toast('Computer added.', 'success')
      setShowCreate(false)
    },
    onError: (e: Error) => toast(e.message, 'error'),
  })

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <span>Inventory</span>
          <strong>Computers</strong>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + Add Computer
        </button>
      </div>

      <ComputerTable />

      {showCreate && (
        <ComputerForm
          loading={createMutation.isPending}
          onClose={() => setShowCreate(false)}
          onSubmit={data => createMutation.mutateAsync(data as any)}
        />
      )}
    </>
  )
}

export default function ComputersPage() {
  return <ToastProvider><PageContent /></ToastProvider>
}
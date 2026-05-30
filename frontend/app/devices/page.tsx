'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deviceApi } from '@/lib/api'
import { DeviceTable } from '@/components/DeviceTable'
import { DeviceForm } from '@/components/DeviceForm'
import { ToastProvider, useToast } from '@/components/Toast'

function PageContent() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [showCreate, setShowCreate] = useState(false)

  const createMutation = useMutation({
    mutationFn: deviceApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['devices'] })
      toast('Device added.', 'success')
      setShowCreate(false)
    },
    onError: (e: Error) => toast(e.message, 'error'),
  })

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <span>Inventory</span>
          <strong>Devices</strong>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + Add Device
        </button>
      </div>

      <DeviceTable />

      {showCreate && (
        <DeviceForm
          loading={createMutation.isPending}
          onClose={() => setShowCreate(false)}
          onSubmit={async data => {
            await createMutation.mutateAsync(data as Parameters<typeof createMutation.mutateAsync>[0])
          }}
        />
      )}
    </>
  )
}

export default function DevicesPage() {
  return <ToastProvider><PageContent /></ToastProvider>
}
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deviceApi, statusApi } from '@/lib/api'
import { Device } from '@/lib/types'
import { DeviceForm } from '@/components/DeviceForm'
import { DeviceHistoryDrawer } from '@/components/DeviceHistoryDrawer'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'
import { StatusTransitionModal } from './StatusTransitionModal'

function StatusBadge({
  device,
  onClick,
}: {
  device: Device
  onClick: (e: React.MouseEvent) => void
}) {
  const { data: allStatuses } = useQuery({
    queryKey: ['statuses'],
    queryFn: statusApi.list,
    staleTime: Infinity,  // statuses never change at runtime
  })
  const meta = allStatuses?.find(s => s.status === device.status)
 
  const style = meta ? {
    background: meta.color + '18',
    color: meta.color,
    border: `1px solid ${meta.color}44`,
    cursor: meta.is_terminal ? 'default' : 'pointer',
  } : {}
 
  return (
    <span
      className="badge"
      style={style}
      onClick={meta?.is_terminal ? undefined : onClick}
      title={meta?.is_terminal ? 'Terminal status — no transitions available' : 'Click to change status'}
    >
      {meta?.label ?? device.status}
      {!meta?.is_terminal && (
        <span style={{ marginLeft: 5, opacity: 0.6, fontSize: 9 }}>▾</span>
      )}
    </span>
  )
}

export function DeviceTable() {
  const qc = useQueryClient()
  const { toast } = useToast()

  const { data: devices, isLoading, isError } = useQuery({
    queryKey: ['devices'],
    queryFn: deviceApi.list,
  })


  const [editing, setEditing]   = useState<Device | null>(null)
  const [deleting, setDeleting] = useState<Device | null>(null)
  const [viewingHistory, setViewingHistory] = useState<Device | null>(null)
  const [changingStatus, setChangingStatus] = useState<Device | null>(null)


  const updateMutation = useMutation({
    mutationFn: (data: { id: number; payload: Partial<Device> }) => deviceApi.update(data.id, data.payload as Parameters<typeof deviceApi.update>[1]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['devices'] })
      toast('Device updated.', 'success')
      setEditing(null)
    },
    onError: (e: Error) => toast(e.message, 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deviceApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['devices'] })
      toast('Device deleted.', 'success')
      setDeleting(null)
    },
    onError: (e: Error) => toast(e.message, 'error'),
  })

  if (isLoading) return <div className="state-loading"><span className="state-icon">◌</span>Loading devices...</div>
  if (isError)   return <div className="state-error"><span className="state-icon">✕</span>Failed to load devices.</div>

  return (
    <>
      <div className="table-wrap">
        {!devices?.length ? (
          <div className="state-empty"><span className="state-icon">○</span>No devices found.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Device Type</th>
                <th>Model</th>
                <th>Specs</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map(c => (
                <tr key={c.device_id}
                  className="clickable"
                  onClick={() => setViewingHistory(c)}
                >
                  <td className="td-mono">{c.device_id}</td>
                  <td><strong>{c.device_type}</strong></td>
                  <td>{c.model ?? '—'}</td>
                  <td className="td-mono" style={{ fontSize: 11 }}>{c.specs ?? '—'}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <StatusBadge
                      device={c}
                      onClick={e => { e.stopPropagation(); setChangingStatus(c) }}
                    />
                  </td>

                  <td>
                    <div className="td-actions">
                      <button className="btn btn-ghost btn-sm" onClick={(e) => {setEditing(c); e.stopPropagation()}}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={(e) => {setDeleting(c); e.stopPropagation()}}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
        CLICK A ROW TO VIEW ASSIGNMENT HISTORY
      </p>
      
      {/* Status transition modal */}
      {changingStatus && (
        <StatusTransitionModal
          device={changingStatus}
          onClose={() => setChangingStatus(null)}
          onSuccess={(updated) => {
            setChangingStatus(null)
            // If history drawer is open for this device, refresh it
            if (viewingHistory?.device_id === updated.device_id) {
              setViewingHistory(updated)
            }
          }}
        />
      )}
 
      {/* History drawer */}
      {viewingHistory && (
        <DeviceHistoryDrawer
          device={viewingHistory}
          onClose={() => setViewingHistory(null)}
          onChangeStatus={(c) => { setChangingStatus(c) }}
        />
      )}

      {editing && (
        <DeviceForm
          initial={editing}
          loading={updateMutation.isPending}
          onClose={() => setEditing(null)}
          onSubmit={async payload => {
            await updateMutation.mutateAsync({ id: editing.device_id, payload })
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete Device"
          danger
          message={<>Remove <strong>{deleting.device_type}</strong> permanently? This cannot be undone.</>}
          confirmLabel="Delete"
          loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleting.device_id)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
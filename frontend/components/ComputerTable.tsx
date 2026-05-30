'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { computerApi, statusApi } from '@/lib/api'
import { Computer } from '@/lib/types'
import { ComputerForm } from '@/components/ComputerForm'
import { ComputerHistoryDrawer } from '@/components/ComputerHistoryDrawer'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'
import { StatusTransitionModal } from './StatusTransitionModal'

function StatusBadge({
  computer,
  onClick,
}: {
  computer: Computer
  onClick: (e: React.MouseEvent) => void
}) {
  const { data: allStatuses } = useQuery({
    queryKey: ['statuses'],
    queryFn: statusApi.list,
    staleTime: Infinity,  // statuses never change at runtime
  })
  const meta = allStatuses?.find(s => s.status === computer.status)
 
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
      {meta?.label ?? computer.status}
      {!meta?.is_terminal && (
        <span style={{ marginLeft: 5, opacity: 0.6, fontSize: 9 }}>▾</span>
      )}
    </span>
  )
}

export function ComputerTable() {
  const qc = useQueryClient()
  const { toast } = useToast()

  const { data: computers, isLoading, isError } = useQuery({
    queryKey: ['computers'],
    queryFn: computerApi.list,
  })


  const [editing, setEditing]   = useState<Computer | null>(null)
  const [deleting, setDeleting] = useState<Computer | null>(null)
  const [viewingHistory, setViewingHistory] = useState<Computer | null>(null)
  const [changingStatus, setChangingStatus] = useState<Computer | null>(null)


  const updateMutation = useMutation({
    mutationFn: (data: { id: number; payload: Partial<Computer> }) => computerApi.update(data.id, data.payload as Parameters<typeof computerApi.update>[1]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['computers'] })
      toast('Computer updated.', 'success')
      setEditing(null)
    },
    onError: (e: Error) => toast(e.message, 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => computerApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['computers'] })
      toast('Computer deleted.', 'success')
      setDeleting(null)
    },
    onError: (e: Error) => toast(e.message, 'error'),
  })

  if (isLoading) return <div className="state-loading"><span className="state-icon">◌</span>Loading computers...</div>
  if (isError)   return <div className="state-error"><span className="state-icon">✕</span>Failed to load computers.</div>

  return (
    <>
      <div className="table-wrap">
        {!computers?.length ? (
          <div className="state-empty"><span className="state-icon">○</span>No computers found.</div>
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
              {computers.map(c => (
                <tr key={c.computer_id}
                  className="clickable"
                  onClick={() => setViewingHistory(c)}
                >
                  <td className="td-mono">{c.computer_id}</td>
                  <td><strong>{c.device_type}</strong></td>
                  <td>{c.model ?? '—'}</td>
                  <td className="td-mono" style={{ fontSize: 11 }}>{c.specs ?? '—'}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <StatusBadge
                      computer={c}
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
          computer={changingStatus}
          onClose={() => setChangingStatus(null)}
          onSuccess={(updated) => {
            setChangingStatus(null)
            // If history drawer is open for this computer, refresh it
            if (viewingHistory?.computer_id === updated.computer_id) {
              setViewingHistory(updated)
            }
          }}
        />
      )}
 
      {/* History drawer */}
      {viewingHistory && (
        <ComputerHistoryDrawer
          computer={viewingHistory}
          onClose={() => setViewingHistory(null)}
          onChangeStatus={(c) => { setChangingStatus(c) }}
        />
      )}

      {editing && (
        <ComputerForm
          initial={editing}
          loading={updateMutation.isPending}
          onClose={() => setEditing(null)}
          onSubmit={async payload => {
            await updateMutation.mutateAsync({ id: editing.computer_id, payload })
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete Computer"
          danger
          message={<>Remove <strong>{deleting.device_type}</strong> permanently? This cannot be undone.</>}
          confirmLabel="Delete"
          loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleting.computer_id)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { computerApi } from '@/lib/api'
import { Computer } from '@/lib/types'
import { ComputerForm } from '@/components/ComputerForm'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'

function statusBadge(status: string) {
  const map: Record<string, string> = {
    available:   'badge-green',
    assigned:    'badge-amber',
    maintenance: 'badge-blue',
    retired:     'badge-gray',
  }
  return <span className={`badge ${map[status] ?? 'badge-gray'}`}>{status}</span>
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
                <tr key={c.computer_id}>
                  <td className="td-mono">{c.computer_id}</td>
                  <td><strong>{c.device_type}</strong></td>
                  <td>{c.model ?? '—'}</td>
                  <td className="td-mono" style={{ fontSize: 11 }}>{c.specs ?? '—'}</td>
                  <td>{statusBadge(c.status)}</td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing(c)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleting(c)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
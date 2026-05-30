'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assignmentApi } from '@/lib/api'
import { AssignmentDetailed } from '@/lib/types'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export function AssignmentTable() {
  const qc = useQueryClient()
  const { toast } = useToast()

  const { data: assignments, isLoading, isError } = useQuery({
    queryKey: ['assignments'],
    queryFn: assignmentApi.list,
  })

  const [returning, setReturning] = useState<AssignmentDetailed | null>(null)

  const returnMutation = useMutation({
    mutationFn: (id: number) => assignmentApi.return(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] })
      qc.invalidateQueries({ queryKey: ['devices'] })
      toast('Device returned successfully.', 'success')
      setReturning(null)
    },
    onError: (e: Error) => toast(e.message, 'error'),
  })

  if (isLoading) return <div className="state-loading"><span className="state-icon">◌</span>Loading assignments...</div>
  if (isError)   return <div className="state-error"><span className="state-icon">✕</span>Failed to load assignments.</div>

  const active   = assignments?.filter(a => !a.returned_at) ?? []
  const returned = assignments?.filter(a =>  a.returned_at) ?? []

  return (
    <>
      {/* ── Active Assignments ── */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>
          Active · {active.length}
        </div>
        <div className="table-wrap">
          {!active.length ? (
            <div className="state-empty"><span className="state-icon">○</span>No active assignments.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Device</th>
                  <th>Employee</th>
                  <th>Assigned By</th>
                  <th>Assigned At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {active.map(a => (
                  <tr key={a.assignment_id}>
                    <td className="td-mono">{a.assignment_id}</td>
                    <td>
                      <strong>{a.device.device_type}</strong>
                      {a.device.model && <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{a.device.model}</div>}
                    </td>
                    <td>
                      <strong>{a.employee.first_name} {a.employee.last_name}</strong>
                      {a.employee.job_title && <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{a.employee.job_title}</div>}
                    </td>
                    <td className="td-mono">{a.assigned_by ?? '—'}</td>
                    <td className="td-mono">{formatDate(a.assigned_at)}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => setReturning(a)}>
                          Return
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Returned History ── */}
      {returned.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>
            History · {returned.length}
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Device</th>
                  <th>Employee</th>
                  <th>Assigned At</th>
                  <th>Returned At</th>
                </tr>
              </thead>
              <tbody>
                {returned.map(a => (
                  <tr key={a.assignment_id} style={{ opacity: 0.6 }}>
                    <td className="td-mono">{a.assignment_id}</td>
                    <td>{a.device.device_type}</td>
                    <td>{a.employee.first_name} {a.employee.last_name}</td>
                    <td className="td-mono">{formatDate(a.assigned_at)}</td>
                    <td className="td-mono">
                      <span className="badge badge-gray">{formatDate(a.returned_at!)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {returning && (
        <ConfirmDialog
          title="Return Device"
          message={
            <>
              Mark <strong>{returning.device.device_type}</strong> as returned from{' '}
              <strong>{returning.employee.first_name} {returning.employee.last_name}</strong>?
            </>
          }
          confirmLabel="Confirm Return"
          loading={returnMutation.isPending}
          onConfirm={() => returnMutation.mutate(returning.assignment_id)}
          onCancel={() => setReturning(null)}
        />
      )}
    </>
  )
}
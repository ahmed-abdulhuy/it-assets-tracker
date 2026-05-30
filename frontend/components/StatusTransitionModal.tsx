'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { statusApi, computerApi } from '@/lib/api'
import { Computer, DeviceStatusTransition } from '@/lib/types'
import { useToast } from '@/components/Toast'

interface Props {
  computer: Computer
  onClose: () => void
  onSuccess: (updated: Computer) => void
}

export function StatusTransitionModal({ computer, onClose, onSuccess }: Props) {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [selected, setSelected] = useState<DeviceStatusTransition | null>(null)
  const [note, setNote]         = useState('')
  const [changedBy, setChangedBy] = useState('')

  const { data: transitions, isLoading } = useQuery({
    queryKey: ['transitions', computer.status],
    queryFn: () => statusApi.transitions(computer.status),
  })

  const { data: allStatuses } = useQuery({
    queryKey: ['statuses'],
    queryFn: statusApi.list,
  })

  const currentStatusMeta = allStatuses?.find(s => s.status === computer.status)

  const mutation = useMutation({
    mutationFn: () => computerApi.changeStatus(computer.computer_id, {
      to_status:  selected!.to_status,
      changed_by: changedBy || undefined,
      note:       note      || undefined,
    }),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['computers'] })
      qc.invalidateQueries({ queryKey: ['assignments'] })
      qc.invalidateQueries({ queryKey: ['computer-history', computer.computer_id] })
      toast(`Status changed to "${selected!.to_status_obj.label}".`, 'success')
      onSuccess(updated)
      onClose()
    },
    onError: (e: Error) => toast(e.message, 'error'),
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <span>Status Management</span>
            <strong>{computer.device_type}</strong>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Current status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--bg-row)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: 20,
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Current status
          </span>
          {currentStatusMeta ? (
            <span className="badge" style={{
              background: currentStatusMeta.color + '18',
              color: currentStatusMeta.color,
              border: `1px solid ${currentStatusMeta.color}44`,
            }}>
              {currentStatusMeta.label}
            </span>
          ) : (
            <span className="badge badge-gray">{computer.status}</span>
          )}
          {currentStatusMeta?.is_terminal && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', marginLeft: 'auto' }}>
              Terminal — no further transitions
            </span>
          )}
        </div>

        {isLoading && (
          <div className="state-loading" style={{ padding: '24px 0' }}>
            <span className="state-icon">◌</span>Loading transitions...
          </div>
        )}

        {!isLoading && transitions?.length === 0 && (
          <div className="state-empty" style={{ padding: '24px 0' }}>
            <span className="state-icon">○</span>No transitions available from this status.
          </div>
        )}

        {/* Transition options */}
        {transitions && transitions.length > 0 && (
          <>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              Available transitions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {transitions.map(t => {
                const isSelected = selected?.to_status === t.to_status
                return (
                  <button
                    key={t.to_status}
                    onClick={() => setSelected(isSelected ? null : t)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 14,
                      background: isSelected ? t.to_status_obj.color + '12' : 'var(--bg-row)',
                      border: `1px solid ${isSelected ? t.to_status_obj.color : 'var(--border)'}`,
                      borderRadius: 'var(--radius)',
                      padding: '13px 14px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                      width: '100%',
                    }}
                  >
                    {/* Color dot */}
                    <span style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: t.to_status_obj.color,
                      flexShrink: 0, marginTop: 3,
                      boxShadow: isSelected ? `0 0 0 3px ${t.to_status_obj.color}28` : 'none',
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                          {t.label ?? t.to_status_obj.label}
                        </span>
                        <span className="badge" style={{
                          background: t.to_status_obj.color + '18',
                          color: t.to_status_obj.color,
                          fontSize: 9,
                        }}>
                          → {t.to_status_obj.label}
                        </span>
                        {t.requires_return && (
                          <span className="badge badge-red" style={{ fontSize: 9 }}>
                            Closes assignment
                          </span>
                        )}
                      </div>
                      {t.description && (
                        <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>
                          {t.description}
                        </div>
                      )}
                    </div>
                    {/* Checkmark */}
                    <span style={{
                      width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                      background: isSelected ? t.to_status_obj.color : 'transparent',
                      border: `2px solid ${isSelected ? t.to_status_obj.color : 'var(--border-mid)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, color: '#000', marginTop: 1,
                      transition: 'all 0.15s',
                    }}>
                      {isSelected && '✓'}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Optional fields — only shown when something is selected */}
            {selected && (
              <div className="form-grid" style={{ marginBottom: 4 }}>
                <div className="field">
                  <label>Changed By <span style={{ color: 'var(--text-dim)' }}>(optional)</span></label>
                  <input
                    placeholder="e.g. IT Admin"
                    value={changedBy}
                    onChange={e => setChangedBy(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Note <span style={{ color: 'var(--text-dim)' }}>(optional)</span></label>
                  <input
                    placeholder={
                      selected.requires_return
                        ? 'e.g. Screen damaged, sent to vendor'
                        : 'e.g. Annual maintenance cycle'
                    }
                    value={note}
                    onChange={e => setNote(e.target.value)}
                  />
                </div>
              </div>
            )}
          </>
        )}

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            disabled={!selected || mutation.isPending}
            onClick={() => mutation.mutate()}
            style={selected ? {
              background: selected.to_status_obj.color,
              borderColor: selected.to_status_obj.color,
              color: '#000',
            } : {}}
          >
            {mutation.isPending
              ? 'Applying...'
              : selected
                ? `Apply — ${selected.label ?? selected.to_status_obj.label}`
                : 'Select a transition'}
          </button>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useQuery } from '@tanstack/react-query'
import { historyApi, deviceApi, statusApi } from '@/lib/api'
import { Device } from '@/lib/types'
import { Drawer } from '@/components/Drawer'
import { useState } from 'react'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatDuration(from: string, to: string | null) {
  const start = new Date(from)
  const end   = to ? new Date(to) : new Date()
  const days  = Math.floor((end.getTime() - start.getTime()) / 86_400_000)
  if (days === 0) return '< 1 day'
  if (days < 30)  return `${days}d`
  if (days < 365) return `${Math.floor(days / 30)}mo`
  return `${(days / 365).toFixed(1)}yr`
}

type Tab = 'assignments' | 'status-log'

interface Props {
  device: Device
  onClose: () => void
  onChangeStatus: (c: Device) => void
}


// function statusBadge(status: string) {
//   const map: Record<string, string> = {
//     available: 'badge-green', assigned: 'badge-amber',
//     maintenance: 'badge-blue', retired: 'badge-gray',
//   }
//   return <span className={`badge ${map[status] ?? 'badge-gray'}`}>{status}</span>
// }

export function DeviceHistoryDrawer({ device, onClose, onChangeStatus }: Props) {
  // const [tab, setTab] = useState<Tab>('assignments')
  // const { data: history, isLoading, isError } = useQuery({
  //   queryKey: ['device-history', device.device_id],
  //   queryFn: () => historyApi.forDevice(device.device_id),
  // })

  // const active = history?.filter(h => !h.returned_at) ?? []

  const [tab, setTab] = useState<Tab>('assignments')
 
  const { data: history,   isLoading: loadingHistory }  = useQuery({
    queryKey: ['device-history', device.device_id],
    queryFn: () => historyApi.forDevice(device.device_id),
  })
  const { data: statusLog, isLoading: loadingLog } = useQuery({
    queryKey: ['device-status-log', device.device_id],
    queryFn: () => deviceApi.statusLog(device.device_id),
  })
  const { data: allStatuses } = useQuery({
    queryKey: ['statuses'],
    queryFn: statusApi.list,
    staleTime: Infinity,
  })
 
  const statusMeta = (s: string) => allStatuses?.find(x => x.status === s)
  const currentMeta = statusMeta(device.status)
  const isTerminal = currentMeta?.is_terminal ?? false


  return (
    <Drawer onClose={onClose}>
      <button className="drawer-close" onClick={onClose}>✕</button>

      <div className="drawer-header">
        <div className="drawer-label">Device · Assignment History</div>
        <div className="drawer-title">{device.device_type}</div>
        <div className="drawer-meta">
          {device.model && (
            <span className="drawer-meta-item">{device.model}</span>
          )}
          {device.specs && (
            <span className="drawer-meta-item" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              · {device.specs}
            </span>
          )}
          {/* Status badge */}
          {currentMeta ? (
            <span className="badge" style={{
              marginLeft: 4,
              background: currentMeta.color + '18',
              color: currentMeta.color,
              border: `1px solid ${currentMeta.color}44`,
            }}>
              {currentMeta.label}
            </span>
          ) : (
            <span className="badge badge-gray">{device.status}</span>
          )}
        </div>
                {/* Change status button */}
        {!isTerminal && (
          <button
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            onClick={() => onChangeStatus(device)}
          >
            ⇄ Change Status
          </button>
        )}
 
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginTop: 16, borderBottom: '1px solid var(--border)' }}>
          {(['assignments', 'status-log'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '8px 16px 10px',
                color: tab === t ? 'var(--accent)' : 'var(--text-dim)',
                borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`,
                marginBottom: -1,
                transition: 'color 0.15s',
              }}
            >
              {t === 'assignments' ? 'Assignments' : 'Status Log'}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="drawer-body">
 
        {/* ── Assignment History Tab ── */}
        {tab === 'assignments' && (
          <>
            {loadingHistory && <div className="state-loading"><span className="state-icon">◌</span>Loading...</div>}
            {!loadingHistory && !history?.length && (
              <div className="state-empty"><span className="state-icon">○</span>Never assigned.</div>
            )}
            {history && history.length > 0 && (
              <>
                <div className="drawer-section-label">
                  {history.length} assignment{history.length !== 1 ? 's' : ''}
                  {history.filter(h => !h.returned_at).length > 0 && ' · 1 active'}
                </div>
                <div className="timeline">
                  {history.map(entry => {
                    const isActive = !entry.returned_at
                    return (
                      <div className="timeline-item" key={entry.assignment_id}>
                        <div className="timeline-line" />
                        <div className="timeline-dot-wrap">
                          <div className={`timeline-dot ${isActive ? 'active' : 'returned'}`} />
                        </div>
                        <div className={`timeline-card ${isActive ? 'active' : ''}`}>
                          <div className="timeline-card-title">
                            {entry.employee.first_name} {entry.employee.last_name}
                            {isActive && <span className="badge badge-amber" style={{ marginLeft: 8, verticalAlign: 'middle' }}>Active</span>}
                          </div>
                          {entry.employee.job_title && <div className="timeline-card-sub">{entry.employee.job_title}</div>}
                          {entry.employee.email && (
                            <div className="timeline-card-sub" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{entry.employee.email}</div>
                          )}
                          <div className="timeline-card-dates">
                            <div className="timeline-date"><strong>Assigned</strong>{formatDate(entry.assigned_at)}</div>
                            <div className="timeline-date"><strong>Returned</strong>{entry.returned_at ? formatDate(entry.returned_at) : '—'}</div>
                            <div className="timeline-date"><strong>Duration</strong>{formatDuration(entry.assigned_at, entry.returned_at)}</div>
                            {entry.assigned_by && <div className="timeline-date"><strong>By</strong>{entry.assigned_by}</div>}
                          </div>
                          {entry.close_reason && (
                            <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', background: 'var(--red-bg)', padding: '4px 8px', borderRadius: 'var(--radius)' }}>
                              {entry.close_reason}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}
 
        {/* ── Status Log Tab ── */}
        {tab === 'status-log' && (
          <>
            {loadingLog && <div className="state-loading"><span className="state-icon">◌</span>Loading...</div>}
            {!loadingLog && !statusLog?.length && (
              <div className="state-empty"><span className="state-icon">○</span>No status changes recorded.</div>
            )}
            {statusLog && statusLog.length > 0 && (
              <>
                <div className="drawer-section-label">{statusLog.length} status change{statusLog.length !== 1 ? 's' : ''}</div>
                <div className="timeline">
                  {statusLog.map((entry, i) => {
                    const toMeta   = statusMeta(entry.to_status)
                    const fromMeta = entry.from_status ? statusMeta(entry.from_status) : null
                    return (
                      <div className="timeline-item" key={entry.log_id}>
                        <div className="timeline-line" />
                        <div className="timeline-dot-wrap">
                          <div className="timeline-dot" style={{
                            borderColor: toMeta?.color ?? 'var(--border-mid)',
                            background:  i === 0 ? (toMeta?.color ?? 'var(--bg)') : 'var(--bg)',
                          }} />
                        </div>
                        <div className="timeline-card">
                          <div className="timeline-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {fromMeta ? (
                              <span className="badge" style={{ background: fromMeta.color + '18', color: fromMeta.color, border: `1px solid ${fromMeta.color}44` }}>
                                {fromMeta.label}
                              </span>
                            ) : (
                              <span className="badge badge-gray">{entry.from_status ?? 'Initial'}</span>
                            )}
                            <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>→</span>
                            {toMeta ? (
                              <span className="badge" style={{ background: toMeta.color + '18', color: toMeta.color, border: `1px solid ${toMeta.color}44` }}>
                                {toMeta.label}
                              </span>
                            ) : (
                              <span className="badge badge-gray">{entry.to_status}</span>
                            )}
                          </div>
                          <div className="timeline-card-dates" style={{ marginTop: 8 }}>
                            <div className="timeline-date"><strong>When</strong>{formatDateTime(entry.changed_at)}</div>
                            {entry.changed_by && <div className="timeline-date"><strong>By</strong>{entry.changed_by}</div>}
                          </div>
                          {entry.note && (
                            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-mid)', fontStyle: 'italic' }}>
                              &ldquo;{entry.note}&rdquo;
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Drawer>
  )
}
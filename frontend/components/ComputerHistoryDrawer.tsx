'use client'

import { useQuery } from '@tanstack/react-query'
import { historyApi } from '@/lib/api'
import { Computer } from '@/lib/types'
import { Drawer } from '@/components/Drawer'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
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

function statusBadge(status: string) {
  const map: Record<string, string> = {
    available: 'badge-green', assigned: 'badge-amber',
    maintenance: 'badge-blue', retired: 'badge-gray',
  }
  return <span className={`badge ${map[status] ?? 'badge-gray'}`}>{status}</span>
}

interface Props {
  computer: Computer
  onClose: () => void
}

export function ComputerHistoryDrawer({ computer, onClose }: Props) {
  const { data: history, isLoading, isError } = useQuery({
    queryKey: ['computer-history', computer.computer_id],
    queryFn: () => historyApi.forComputer(computer.computer_id),
  })

  const active = history?.filter(h => !h.returned_at) ?? []

  return (
    <Drawer onClose={onClose}>
      <button className="drawer-close" onClick={onClose}>✕</button>

      <div className="drawer-header">
        <div className="drawer-label">Computer · Assignment History</div>
        <div className="drawer-title">{computer.device_type}</div>
        <div className="drawer-meta">
          {computer.model && (
            <span className="drawer-meta-item">{computer.model}</span>
          )}
          {computer.specs && (
            <span className="drawer-meta-item" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              · {computer.specs}
            </span>
          )}
          <span style={{ marginLeft: 4 }}>{statusBadge(computer.status)}</span>
        </div>
      </div>

      <div className="drawer-body">
        {isLoading && (
          <div className="state-loading"><span className="state-icon">◌</span>Loading history...</div>
        )}
        {isError && (
          <div className="state-error"><span className="state-icon">✕</span>Failed to load history.</div>
        )}
        {history && !history.length && (
          <div className="state-empty"><span className="state-icon">○</span>Never assigned.</div>
        )}

        {history && history.length > 0 && (
          <>
            <div className="drawer-section-label">
              {history.length} assignment{history.length !== 1 ? 's' : ''}
              {active.length > 0 && ` · 1 active`}
            </div>

            <div className="timeline">
              {history.map((entry) => {
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
                        {isActive && (
                          <span className="badge badge-amber" style={{ marginLeft: 8, verticalAlign: 'middle' }}>
                            Active
                          </span>
                        )}
                      </div>
                      {entry.employee.job_title && (
                        <div className="timeline-card-sub">{entry.employee.job_title}</div>
                      )}
                      {entry.employee.email && (
                        <div className="timeline-card-sub" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                          {entry.employee.email}
                        </div>
                      )}
                      <div className="timeline-card-dates">
                        <div className="timeline-date">
                          <strong>Assigned</strong>
                          {formatDate(entry.assigned_at)}
                        </div>
                        <div className="timeline-date">
                          <strong>Returned</strong>
                          {entry.returned_at ? formatDate(entry.returned_at) : '—'}
                        </div>
                        <div className="timeline-date">
                          <strong>Duration</strong>
                          {formatDuration(entry.assigned_at, entry.returned_at)}
                        </div>
                        {entry.assigned_by && (
                          <div className="timeline-date">
                            <strong>By</strong>
                            {entry.assigned_by}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </Drawer>
  )
}
'use client'

import { useQuery } from '@tanstack/react-query'
import { historyApi } from '@/lib/api'
import { Employee } from '@/lib/types'
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

interface Props {
  employee: Employee
  onClose: () => void
}

export function EmployeeHistoryDrawer({ employee, onClose }: Props) {
  const { data: history, isLoading, isError } = useQuery({
    queryKey: ['employee-history', employee.employee_id],
    queryFn: () => historyApi.forEmployee(employee.employee_id),
  })

  const active   = history?.filter(h => !h.returned_at) ?? []
  const returned = history?.filter(h =>  h.returned_at) ?? []

  return (
    <Drawer onClose={onClose}>
      <button className="drawer-close" onClick={onClose}>✕</button>

      <div className="drawer-header">
        <div className="drawer-label">Employee · Asset History</div>
        <div className="drawer-title">{employee.first_name} {employee.last_name}</div>
        <div className="drawer-meta">
          {employee.job_title && (
            <span className="drawer-meta-item">{employee.job_title}</span>
          )}
          {employee.email && (
            <span className="drawer-meta-item" style={{ color: 'var(--text-dim)' }}>
              · {employee.email}
            </span>
          )}
          <span className={`badge ${employee.is_active ? 'badge-green' : 'badge-gray'}`}
            style={{ marginLeft: 4 }}>
            {employee.is_active ? 'Active' : 'Inactive'}
          </span>
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
          <div className="state-empty"><span className="state-icon">○</span>No assignments yet.</div>
        )}

        {history && history.length > 0 && (
          <>
            <div className="drawer-section-label">
              {history.length} assignment{history.length !== 1 ? 's' : ''}
              {active.length > 0 && ` · ${active.length} active`}
            </div>

            <div className="timeline">
              {history.map((entry, i) => {
                const isActive = !entry.returned_at
                return (
                  <div className="timeline-item" key={entry.assignment_id}>
                    <div className="timeline-line" />
                    <div className="timeline-dot-wrap">
                      <div className={`timeline-dot ${isActive ? 'active' : 'returned'}`} />
                    </div>
                    <div className={`timeline-card ${isActive ? 'active' : ''}`}>
                      <div className="timeline-card-title">
                        {entry.device.device_type}
                        {isActive && (
                          <span className="badge badge-amber" style={{ marginLeft: 8, verticalAlign: 'middle' }}>
                            Active
                          </span>
                        )}
                      </div>
                      {entry.device.model && (
                        <div className="timeline-card-sub">{entry.device.model}</div>
                      )}
                      {entry.device.specs && (
                        <div className="timeline-card-sub" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                          {entry.device.specs}
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
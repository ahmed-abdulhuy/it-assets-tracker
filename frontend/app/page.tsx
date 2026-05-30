'use client'

import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import Link from 'next/link'
import { computerApi, employeeApi, assignmentApi, statusApi } from '@/lib/api'
import { ToastProvider } from '@/components/Toast'
import {
  Computer, Employee, AssignmentDetailed, DeviceStatus
} from '@/lib/types'

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, color,
}: {
  label: string; value: number | string; sub?: string; color: string
}) {
  return (
    <div className="stat-card" style={{ '--stat-color': color } as React.CSSProperties}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

function UtilizationRing({
  computers, statuses,
}: {
  computers: Computer[]; statuses: DeviceStatus[]
}) {
  const total      = computers.length
  const assigned   = computers.filter(c => c.status === 'assigned').length
  const utilPct    = total > 0 ? Math.round((assigned / total) * 100) : 0
  const statusCounts = statuses.map(status => ({
    ...status,
    count: computers.filter(
      c => c.status === status.status
    ).length
  }))

  // SVG ring
  const R = 54, cx = 64, cy = 64
  const circumference = 2 * Math.PI * R

  const segments = statusCounts
    .filter(item => item.count > 0)
    .reduce<
      {
        arc: number
        color: string
        offset: number
        label: string
        count: number
      }[]
    >((acc, item) => {
      const offset = acc.reduce(
        (sum, seg) => sum + seg.arc,
        0
      )

      const arc =
        (item.count / Math.max(total, 1))
        * circumference

      acc.push({
        arc,
        color: item.color,
        offset,
        label: item.label,
        count: item.count
      })

      return acc
    }, [])

  const legendItems = statusCounts
    .filter(item => item.count > 0)
    .map(item => ({
      color: item.color,
      label: item.label,
      count: item.count
    }))

  return (
    <div className="util-ring-wrap">
      <div className="util-ring-center">
        <svg width="128" height="128" viewBox="0 0 128 128">
          {/* Background track */}
          <circle cx={cx} cy={cy} r={R} fill="none"
            stroke="var(--bg-row)" strokeWidth="12" />
          {/* Colored segments */}
          {segments.map((seg, i) => (
            <circle key={i} cx={cx} cy={cy} r={R} fill="none"
              stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={`${seg.arc} ${circumference - seg.arc}`}
              strokeDashoffset={circumference / 4 - seg.offset}
              strokeLinecap="butt"
              style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1)' }}
            />
          ))}
        </svg>
        <div className="util-ring-text">
          <div className="util-ring-pct">{utilPct}%</div>
          <div className="util-ring-sub">In use</div>
        </div>
      </div>
      <div className="util-legend">
        {legendItems.map(item => (
          <div className="util-legend-item" key={item.label}>
            <div className="util-legend-label">
              <div className="util-legend-dot" style={{ background: item.color }} />
              {item.label}
            </div>
            <div className="util-legend-count">{item.count}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusBreakdown({
  computers, statuses,
}: {
  computers: Computer[]; statuses: DeviceStatus[]
}) {
  const total = computers.length || 1
  const items = statuses.map(s => ({
    ...s,
    count: computers.filter(c => c.status === s.status).length,
  })).sort((a, b) => b.count - a.count)

  return (
    <div className="status-bar-list">
      {items.map(item => (
        <div className="status-bar-item" key={item.status}>
          <div className="status-bar-header">
            <div className="status-bar-name">{item.label}</div>
            <div className="status-bar-count">{item.count}</div>
          </div>
          <div className="status-bar-track">
            <div
              className="status-bar-fill"
              style={{
                width: `${(item.count / total) * 100}%`,
                background: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function ActivityFeed({
  assignments
}: {
  assignments: AssignmentDetailed[]
}) {
  // Build a unified recent activity list from assignments (newest first, last 10)
  const items = useMemo(() => {
    const events: {
      key: string
      type: 'assigned' | 'returned'
      title: React.ReactNode
      sub: string
      time: string
      color: string
      icon: string
    }[] = []

    for (const a of assignments) {
      events.push({
        key:   `assign-${a.assignment_id}`,
        type:  'assigned',
        title: <><strong>{a.computer.device_type}</strong> → {a.employee.first_name} {a.employee.last_name}</>,
        sub:   a.assigned_by ? `by ${a.assigned_by}` : 'Assignment',
        time:  a.assigned_at,
        color: '#f0a500',
        icon:  '⇒',
      })
      if (a.returned_at) {
        events.push({
          key:   `return-${a.assignment_id}`,
          type:  'returned',
          title: <><strong>{a.computer.device_type}</strong> returned by {a.employee.first_name} {a.employee.last_name}</>,
          sub:    'Return',
          time:  a.returned_at,
          color: '#3ecf6e',
          icon:  '↩',
        })
      }
    }

    return events
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10)
  }, [assignments])

  if (!items.length) {
    return <div className="state-empty" style={{ padding: '32px 0' }}><span className="state-icon">○</span>No recent activity.</div>
  }

  return (
    <div className="activity-feed">
      {items.map(item => (
        <div className="activity-item" key={item.key}>
          <div
            className="activity-icon"
            style={{ background: item.color + '18', color: item.color }}
          >
            {item.icon}
          </div>
          <div className="activity-body">
            <div className="activity-title">{item.title}</div>
            <div className="activity-sub">{item.sub}</div>
          </div>
          <div className="activity-time">{timeAgo(item.time)}</div>
        </div>
      ))}
    </div>
  )
}

function AttentionPanel({ computers, statuses }: { computers: Computer[]; statuses: DeviceStatus[] }) {
  const needsAttention = computers.filter(c =>
    c.status === 'maintenance' || c.status === 'lost'
  )

  const statusMeta = (s: string) => statuses.find(x => x.status === s)

  if (!needsAttention.length) {
    return (
      <div className="state-empty" style={{ padding: '32px 0' }}>
        <span className="state-icon" style={{ color: 'var(--green)' }}>✓</span>
        All clear — no devices need attention.
      </div>
    )
  }

  return (
    <div className="attention-list">
      {needsAttention.map(c => {
        const meta = statusMeta(c.status)
        return (
          <div className="attention-item" key={c.computer_id}>
            <div className="attention-item-left">
              <div className="attention-item-name">{c.device_type}</div>
              <div className="attention-item-sub">{c.model ?? 'No model'} · ID #{c.computer_id}</div>
            </div>
            {meta && (
              <span className="badge" style={{
                background: meta.color + '18',
                color: meta.color,
                border: `1px solid ${meta.color}44`,
                flexShrink: 0,
              }}>
                {meta.label}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function UnassignedEmployees({
  employees, assignments,
}: {
  employees: Employee[]; assignments: AssignmentDetailed[]
}) {
  const assignedEmployeeIds = new Set(
    assignments.filter(a => !a.returned_at).map(a => a.employee_id)
  )
  const unassigned = employees.filter(e => e.is_active && !assignedEmployeeIds.has(e.employee_id))

  if (!unassigned.length) {
    return (
      <div className="state-empty" style={{ padding: '32px 0' }}>
        <span className="state-icon" style={{ color: 'var(--green)' }}>✓</span>
        Every active employee has a device.
      </div>
    )
  }

  return (
    <div className="attention-list">
      {unassigned.slice(0, 8).map(emp => (
        <div className="attention-item" key={emp.employee_id}>
          <div className="attention-item-left">
            <div className="attention-item-name">{emp.first_name} {emp.last_name}</div>
            <div className="attention-item-sub">{emp.job_title ?? 'No job title'}</div>
          </div>
          <span className="badge badge-gray" style={{ flexShrink: 0 }}>No device</span>
        </div>
      ))}
      {unassigned.length > 8 && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', textAlign: 'center', padding: '8px 0' }}>
          +{unassigned.length - 8} more ·{' '}
          <Link href="/employees" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            View all
          </Link>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────

function DashboardContent() {
  const results = useQueries({
    queries: [
      { queryKey: ['computers'],   queryFn: computerApi.list   },
      { queryKey: ['employees'],   queryFn: employeeApi.list   },
      { queryKey: ['assignments'], queryFn: assignmentApi.list },
      { queryKey: ['statuses'],    queryFn: statusApi.list, staleTime: Infinity },
    ],
  })

  const [
    { data: computers,   isLoading: lc },
    { data: employees,   isLoading: le },
    { data: assignments, isLoading: la },
    { data: statuses,    isLoading: ls },
  ] = results

  const isLoading = lc || le || la || ls
  const hasError  = results.some(r => r.isError)

  // ── Derived stats ──────────────────────────────────────────
  const stats = useMemo(() => {
    if (!computers || !employees || !assignments || !statuses) return null

    const activeEmployees   = employees.filter(e => e.is_active)
    const activeAssignments = assignments.filter(a => !a.returned_at)
    const assignedEmpIds    = new Set(activeAssignments.map(a => a.employee_id))

    const totalDevices      = computers.length
    const availableDevices  = computers.filter(c => c.status === 'available').length
    const assignedDevices   = computers.filter(c => c.status === 'assigned').length
    const maintenanceDevices = computers.filter(c => c.status === 'maintenance').length
    const lostDevices       = computers.filter(c => c.status === 'lost').length
    const retiredDevices    = computers.filter(c => c.status === 'retired').length
    const utilization       = totalDevices > 0 ? Math.round((assignedDevices / totalDevices) * 100) : 0
    const coveredEmployees  = activeEmployees.filter(e => assignedEmpIds.has(e.employee_id)).length
    const coverageRate      = activeEmployees.length > 0
      ? Math.round((coveredEmployees / activeEmployees.length) * 100) : 0

    return {
      totalDevices, availableDevices, assignedDevices,
      maintenanceDevices, lostDevices, retiredDevices,
      utilization, activeEmployees: activeEmployees.length,
      coveredEmployees, coverageRate,
    }
  }, [computers, employees, assignments, statuses])

  if (isLoading) return (
    <div className="state-loading" style={{ minHeight: 300 }}>
      <span className="state-icon">◌</span>Loading dashboard...
    </div>
  )
  if (hasError || !stats) return (
    <div className="state-error" style={{ minHeight: 300 }}>
      <span className="state-icon">✕</span>Failed to load dashboard data.
    </div>
  )

  const now = new Date()
  
  return (
    <div>
      {/* ── Page header ── */}
      <div className="page-header">
        <div className="page-title">
          <span>Overview</span>
          <strong>Dashboard</strong>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
          {now.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* ── Row 1: Stat cards ── */}
      <div className="dash-section dash-grid dash-grid-4">
        <StatCard
          label="Total Devices"
          value={stats.totalDevices}
          sub={`${stats.retiredDevices} retired`}
          color="var(--text-mid)"
        />
        <StatCard
          label="Available"
          value={stats.availableDevices}
          sub="Ready to assign"
          color="#3ecf6e"
        />
        <StatCard
          label="Assigned"
          value={stats.assignedDevices}
          sub={`${stats.utilization}% utilization`}
          color="#f0a500"
        />
        <StatCard
          label="Needs Attention"
          value={stats.maintenanceDevices + stats.lostDevices}
          sub={`${stats.maintenanceDevices} maintenance · ${stats.lostDevices} lost`}
          color={stats.maintenanceDevices + stats.lostDevices > 0 ? '#f05252' : 'var(--text-dim)'}
        />
      </div>

      {/* ── Row 2: Ring + Status breakdown ── */}
      <div className="dash-section dash-grid dash-grid-2">
        <div className="dash-panel">
          <div className="dash-panel-label">Fleet Utilization</div>
          <UtilizationRing computers={computers!} statuses={statuses!} />
        </div>
        <div className="dash-panel">
          <div className="dash-panel-label">Status Breakdown</div>
          <StatusBreakdown computers={computers!} statuses={statuses!} />
        </div>
      </div>

      {/* ── Row 3: Activity + Workforce coverage ── */}
      <div className="dash-section dash-grid dash-grid-2-1">
        <div className="dash-panel">
          <div className="dash-panel-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Recent Activity</span>
            <Link href="/assignments" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 10 }}>
              View all →
            </Link>
          </div>
          <ActivityFeed assignments={assignments!} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Workforce coverage stat */}
          <div className="dash-panel" style={{ flex: 'none' }}>
            <div className="dash-panel-label">Workforce Coverage</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 600, color: 'var(--text)', lineHeight: 1 }}>
                {stats.coverageRate}%
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                of staff covered
              </span>
            </div>
            {/* Coverage bar */}
            <div style={{ height: 6, background: 'var(--bg-row)', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{
                height: '100%', borderRadius: 3,
                width: `${stats.coverageRate}%`,
                background: stats.coverageRate >= 80 ? '#3ecf6e' : stats.coverageRate >= 50 ? '#f0a500' : '#f05252',
                transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>
                {stats.coveredEmployees} / {stats.activeEmployees} active employees
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div className="dash-panel" style={{ flex: 'none' }}>
            <div className="dash-panel-label">Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { href: '/employees',   label: '+ Add Employee',  sub: `${stats.activeEmployees} active` },
                { href: '/computers',   label: '+ Add Computer',  sub: `${stats.totalDevices} total` },
                { href: '/assignments', label: '+ Assign Device', sub: `${stats.assignedDevices} active` },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '9px 12px',
                    background: 'var(--bg-row)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    textDecoration: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-mid)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', fontWeight: 500 }}>
                    {item.label}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>
                    {item.sub}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 4: Attention + Unassigned ── */}
      <div className="dash-section dash-grid dash-grid-2">
        <div className="dash-panel">
          <div className="dash-panel-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Needs Attention</span>
            {stats.maintenanceDevices + stats.lostDevices > 0 && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)' }}>
                {stats.maintenanceDevices + stats.lostDevices} device{stats.maintenanceDevices + stats.lostDevices !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <AttentionPanel computers={computers!} statuses={statuses!} />
        </div>

        <div className="dash-panel">
          <div className="dash-panel-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Unassigned Employees</span>
            {stats.activeEmployees - stats.coveredEmployees > 0 && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>
                {stats.activeEmployees - stats.coveredEmployees} without device
              </span>
            )}
          </div>
          <UnassignedEmployees employees={employees!} assignments={assignments!} />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return <ToastProvider><DashboardContent /></ToastProvider>
}
'use client'

import { useState } from 'react'
import { Computer, ComputerCreate, ComputerUpdate } from '@/lib/types'

const STATUS_OPTIONS = ['available', 'assigned', 'maintenance', 'retired']

interface Props {
  initial?: Computer
  onSubmit: (data: ComputerCreate | ComputerUpdate) => Promise<void>
  onClose: () => void
  loading?: boolean
}

export function ComputerForm({ initial, onSubmit, onClose, loading }: Props) {
  const [form, setForm] = useState({
    device_type: initial?.device_type ?? '',
    model:       initial?.model       ?? '',
    specs:       initial?.specs       ?? '',
    status:      initial?.status      ?? 'available',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!form.device_type.trim()) e.device_type = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({
      ...form,
      model: form.model || undefined,
      specs: form.specs || undefined,
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span>{initial ? 'Edit record' : 'New record'}</span>
            <strong>{initial ? 'Edit Computer' : 'Add Computer'}</strong>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>Device Type</label>
              <input
                placeholder="e.g. MacBook Pro 14"
                value={form.device_type}
                onChange={e => setForm(f => ({ ...f, device_type: e.target.value }))}
              />
              {errors.device_type && <span className="field-error">{errors.device_type}</span>}
            </div>

            <div className="field">
              <label>Model</label>
              <input
                placeholder="e.g. Apple M3 Pro"
                value={form.model}
                onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
              />
            </div>

            <div className="field">
              <label>Specs</label>
              <input
                placeholder="e.g. 16GB RAM, 512GB SSD"
                value={form.specs}
                onChange={e => setForm(f => ({ ...f, specs: e.target.value }))}
              />
            </div>

            {initial && (
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)',
                background: 'var(--bg-row)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '10px 12px',
                letterSpacing: '0.06em',
              }}>
                ℹ STATUS is managed via the status badge — use Change Status to transition.
              </div>
            )}
          </div>
 
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : initial ? 'Save Changes' : 'Add Computer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
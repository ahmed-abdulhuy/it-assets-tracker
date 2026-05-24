'use client'

import { useEffect } from 'react'

interface Props {
  onClose: () => void
  children: React.ReactNode
}

export function Drawer({ onClose, children }: Props) {
  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="drawer">
        {children}
      </aside>
    </>
  )
}
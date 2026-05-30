'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/',            label: 'Dashboard',   exact: true },
  { href: '/employees',   label: 'Employees',   exact: false },
  { href: '/devices',   label: 'Devices',   exact: false },
  { href: '/assignments', label: 'Assignments', exact: false },
]

export function Navbar() {
  const pathname = usePathname()
  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }


  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        Asset<span>/</span>Mgr
      </Link>
      <div className="navbar-links">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`navbar-link ${isActive(link.href, link.exact) ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
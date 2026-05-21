'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/employees',  label: 'Employees'  },
  { href: '/computers',  label: 'Computers'  },
  { href: '/assignments', label: 'Assignments' },
]

export function Navbar() {
  const pathname = usePathname()

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
            className={`navbar-link ${pathname.startsWith(link.href) ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
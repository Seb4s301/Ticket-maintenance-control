import { useState } from 'react'
import { initialsFromName, ROLE_LABELS } from '../utils.js'
import { logoUrl } from '../logo.js'

export default function Header({ user, onProfile, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoBroken, setLogoBroken] = useState(false)

  function toggleMenu() {
    setMenuOpen((open) => !open)
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  function handleProfile() {
    setMenuOpen(false)
    onProfile()
  }

  return (
    <header className="app-header">
      <div className="app-header-inner">
        {logoBroken ? (
          <span className="brand-logo">
            FR<span className="logo-accent">A</span>CT<span className="logo-accent">A</span>L
          </span>
        ) : (
          <img
            src={logoUrl}
            alt="FRACTAL"
            className="header-logo-img"
            onError={() => setLogoBroken(true)}
          />
        )}
        <span className="breadcrumb">
          Mantenimiento • <strong>Tickets</strong>
        </span>
        <span className="header-spacer" />
        <span className="header-icons">
          <span aria-hidden="true">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M9.5 9a2.6 2.6 0 0 1 5 1c0 1.7-2.5 2-2.5 3.5" />
              <path d="M12 17h.01" />
            </svg>
          </span>
          <span aria-hidden="true">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" />
              <path d="M10.5 20a1.8 1.8 0 0 0 3 0" />
            </svg>
          </span>
          <span className="header-divider" />
          <button type="button" className="header-user" onClick={toggleMenu} aria-haspopup="menu" aria-expanded={menuOpen}>
            <span className="avatar">{initialsFromName(user.name)}</span>
            <span>
              <span className="header-user-name">{user.name}</span>
              <br />
              <span className="header-user-role">{ROLE_LABELS[user.role] ?? user.role}</span>
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </span>
      </div>

      {menuOpen && (
        <>
          <div className="menu-overlay" onClick={closeMenu} />
          <div className="user-menu" role="menu">
            <button type="button" className="user-menu-item" role="menuitem" onClick={handleProfile}>
              Mi perfil
            </button>
            <button type="button" className="user-menu-item danger" role="menuitem" onClick={onLogout}>
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </header>
  )
}

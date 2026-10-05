import { useEffect, useState } from 'react'
import { ApiError } from '../api/client.js'
import { updateProfile } from '../api/auth.js'
import { AlertIcon, CloseIcon } from './icons.jsx'

export default function ProfileModal({ user, onClose, onSaved }) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setNotice(null)

    if (!name.trim()) {
      setError('El nombre es obligatorio.')
      return
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Ingresa un correo electrónico válido.')
      return
    }
    if (newPassword && newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (newPassword && !currentPassword) {
      setError('Ingresa tu contraseña actual para cambiar la contraseña.')
      return
    }

    const body = { name: name.trim(), email: email.trim() }
    if (newPassword) {
      body.currentPassword = currentPassword
      body.newPassword = newPassword
    }

    setSubmitting(true)
    try {
      const auth = await updateProfile(body)
      setCurrentPassword('')
      setNewPassword('')
      setNotice('Perfil actualizado correctamente.')
      onSaved(auth)
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError('No se pudo actualizar el perfil.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="overlay overlay-profile" onClick={onClose} />
      <div className="profile-modal" role="dialog" aria-modal="true" aria-label="Mi perfil">
        <div className="profile-head">
          <h2>Mi perfil</h2>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="profile-name">Nombre</label>
            <input
              id="profile-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
            />
          </div>
          <div className="field">
            <label htmlFor="profile-email">Correo electrónico</label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              maxLength={150}
            />
          </div>

          <p className="profile-section-title">Cambiar contraseña</p>
          <div className="field">
            <label htmlFor="profile-current">Contraseña actual</label>
            <input
              id="profile-current"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
            <p className="field-hint">Opcional: solo si vas a cambiar la contraseña.</p>
          </div>
          <div className="field">
            <label htmlFor="profile-new">Nueva contraseña</label>
            <input
              id="profile-new"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
            <p className="field-hint">Mínimo 8 caracteres.</p>
          </div>

          {notice && <p className="form-success">{notice}</p>}
          {error && (
            <p className="form-error">
              <AlertIcon width={16} height={16} />
              {error}
            </p>
          )}

          <div className="profile-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

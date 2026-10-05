import { useState } from 'react'
import { ApiError } from '../api/client.js'
import { login } from '../api/auth.js'
import { logoUrl } from '../logo.js'
import { AlertIcon } from './icons.jsx'

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [logoBroken, setLogoBroken] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Ingresa tu correo y tu contraseña.')
      return
    }

    setSubmitting(true)
    try {
      const auth = await login(email.trim(), password)
      onLogin(auth)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Correo o contraseña incorrectos.')
      } else if (err instanceof ApiError && err.status === 429) {
        setError('Demasiados intentos. Espera un minuto y vuelve a intentar.')
      } else if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('No se pudo conectar con el servidor.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          {logoBroken ? (
            <span className="brand-logo">
              FR<span className="logo-accent">A</span>CT<span className="logo-accent">A</span>L
            </span>
          ) : (
            <img
              src={logoUrl}
              alt="FRACTAL"
              className="login-logo-img"
              onError={() => setLogoBroken(true)}
            />
          )}
        </div>
        <h1 className="login-title">Iniciar sesión</h1>
        <p className="login-subtitle">Ingresa tus credenciales para acceder al panel.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="login-email">Correo electrónico</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <p className="field-hint">Ejemplo: tu.correo@empresa.com</p>
          </div>
          <div className="field">
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error && (
            <p className="form-error">
              <AlertIcon width={16} height={16} />
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

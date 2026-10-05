import { useState } from 'react'
import { ApiError } from '../api/client.js'

export default function TransitionModal({ targetLabel, required, defaultValue, onConfirm, onClose }) {
  const [text, setText] = useState(defaultValue ?? '')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleConfirm() {
    if (required && !text.trim()) {
      setError('Este campo es obligatorio para completar la transición.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await onConfirm(text.trim())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo completar la transición.')
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-wrap" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-head">
          <h3>Requerimiento de Transición</h3>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
        <p className="modal-sub">
          Completa el diagnóstico o la resolución para avanzar el ticket al siguiente estado
          {targetLabel ? ` (${targetLabel})` : ''}.
        </p>

        <label className="drawer-label" htmlFor="transition-text">
          Diagnóstico / resolución
        </label>
        <textarea
          id="transition-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={2000}
        />
        <p className="field-hint">
          Describe el hallazgo, la acción realizada o el motivo de cancelación.
        </p>
        {error && <p className="modal-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={submitting}>
            {submitting ? 'Confirmando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}

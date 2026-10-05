import { useState } from 'react'
import { ApiError } from '../api/client.js'
import { CATEGORY_LABELS, PRIORITY_LABELS } from '../utils.js'
import { AlertIcon, TicketIcon } from './icons.jsx'

const EMPTY_FORM = {
  title: '',
  priorityId: '',
  categoryId: '',
  description: '',
}

export default function NewTicketForm({ lookups, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function updateField(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
    setSuccess(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSuccess(false)

    if (!form.title.trim() || !form.description.trim() || !form.priorityId || !form.categoryId) {
      setError('Completa título, prioridad, categoría y descripción.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim(),
        priorityId: Number(form.priorityId),
        categoryId: Number(form.categoryId),
      })
      setForm(EMPTY_FORM)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo registrar el ticket.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="new-ticket-card">
      <div className="new-ticket-head">
        <span className="new-ticket-icon">
          <TicketIcon width={22} height={22} />
        </span>
        <h2 className="new-ticket-title">Nuevo ticket</h2>
      </div>
      <p className="new-ticket-hint">Registra una incidencia para iniciar su seguimiento.</p>

      {error && (
        <p className="form-error">
          <AlertIcon width={16} height={16} />
          {error}
        </p>
      )}
      {success && <p className="form-success">Ticket registrado correctamente.</p>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="nt-title">Título</label>
          <input
            id="nt-title"
            name="title"
            value={form.title}
            onChange={updateField}
            maxLength={150}
          />
          <p className="field-hint">Ejemplo: Cajero fuera de servicio</p>
        </div>

        <div className="field">
          <label htmlFor="nt-priority">Prioridad</label>
          <select id="nt-priority" name="priorityId" value={form.priorityId} onChange={updateField}>
            <option value="">Seleccionar prioridad</option>
            {(lookups?.priorities ?? []).map((priority) => (
              <option key={priority.id} value={priority.id}>
                {PRIORITY_LABELS[priority.code] ?? priority.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="nt-category">Categoría</label>
          <select id="nt-category" name="categoryId" value={form.categoryId} onChange={updateField}>
            <option value="">Seleccionar categoría</option>
            {(lookups?.categories ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {CATEGORY_LABELS[category.code] ?? category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="nt-description">Descripción</label>
          <textarea
            id="nt-description"
            name="description"
            value={form.description}
            onChange={updateField}
            maxLength={2000}
          />
          <p className="field-hint">Describe el problema con detalle: pantallas sin respuesta, ruidos, errores…</p>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Registrando...' : 'Registrar ticket'}
        </button>
      </form>
    </section>
  )
}

import { useEffect, useState } from 'react'
import { ApiError } from '../api/client.js'
import { createTicket, getLookups } from '../api/tickets.js'

const EMPTY_FORM = { title: '', description: '', priorityId: '', categoryId: '' }

export default function NewTicketPage({ onCreated, onCancel }) {
  const [lookups, setLookups] = useState({ priorities: [], categories: [] })
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getLookups()
      .then(setLookups)
      .catch(() => setError('Failed to load form options.'))
  }, [])

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const ticket = await createTicket({
        title: form.title,
        description: form.description,
        priorityId: Number(form.priorityId),
        categoryId: Number(form.categoryId),
        createdBy: 1,
      })
      onCreated(ticket.id)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create the ticket.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <h1>New ticket</h1>
      <form className="ticket-form" onSubmit={submit}>
        <label>
          Title
          <input value={form.title} onChange={update('title')} maxLength={150} required />
        </label>
        <label>
          Description
          <textarea
            value={form.description}
            onChange={update('description')}
            maxLength={2000}
            rows={5}
            required
          />
        </label>
        <label>
          Priority
          <select value={form.priorityId} onChange={update('priorityId')} required>
            <option value="" disabled>
              Select…
            </option>
            {lookups.priorities.map((priority) => (
              <option key={priority.id} value={priority.id}>
                {priority.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Category
          <select value={form.categoryId} onChange={update('categoryId')} required>
            <option value="" disabled>
              Select…
            </option>
            {lookups.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="error">{error}</p>}

        <div className="form-actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" disabled={saving}>
            {saving ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </section>
  )
}

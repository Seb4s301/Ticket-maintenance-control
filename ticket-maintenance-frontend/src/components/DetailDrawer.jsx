import { useEffect, useState } from 'react'
import { ApiError } from '../api/client.js'
import { getTicket, getTicketHistory } from '../api/tickets.js'
import {
  CANCELLABLE_STATUSES,
  CATEGORY_LABELS,
  NEXT_STATUS,
  PRIORITY_LABELS,
  advanceLabel,
  formatDateTime,
  priorityLabel,
  readDraft,
  statusLabel,
  writeDraft,
} from '../utils.js'
import HistoryTimeline from './HistoryTimeline.jsx'
import StatusBadge from './StatusBadge.jsx'
import TransitionModal from './TransitionModal.jsx'
import { AlertIcon, CloseIcon } from './icons.jsx'

export default function DetailDrawer({
  ticketId,
  reloadKey,
  lookups,
  suspended,
  onClose,
  onAssign,
  onTransition,
  onUpdate,
}) {
  const [loaded, setLoaded] = useState({ id: null, ticket: null, history: [] })
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [transition, setTransition] = useState(null)
  const [diagnosisDraft, setDiagnosisDraft] = useState({ id: null, value: null })
  const [resolutionDraft, setResolutionDraft] = useState({ id: null, value: null })
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([getTicket(ticketId), getTicketHistory(ticketId)])
      .then(([ticketData, historyData]) => {
        if (cancelled) return
        setLoaded({ id: ticketId, ticket: ticketData, history: historyData })
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof ApiError ? err.message : 'No se pudo cargar el ticket.')
      })
    return () => {
      cancelled = true
    }
  }, [ticketId, reloadKey])

  useEffect(() => {
    if (suspended) return undefined
    function onKeyDown(event) {
      if (event.key !== 'Escape') return
      if (transition) setTransition(null)
      else onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [transition, suspended, onClose])

  const isLoading = loaded.id !== ticketId || !loaded.ticket
  const ticket = isLoading ? null : loaded.ticket
  const history = isLoading ? [] : loaded.history
  const diagnosisValue =
    diagnosisDraft.id === ticketId ? diagnosisDraft.value : (readDraft(ticketId, 'diagnosis') ?? '')
  const resolutionValue =
    resolutionDraft.id === ticketId
      ? resolutionDraft.value
      : (ticket?.resolution ?? readDraft(ticketId, 'resolution') ?? '')

  function changeDiagnosis(value) {
    setDiagnosisDraft({ id: ticketId, value })
    writeDraft(ticketId, 'diagnosis', value)
  }

  function changeResolution(value) {
    setResolutionDraft({ id: ticketId, value })
    writeDraft(ticketId, 'resolution', value)
  }

  function clearDrafts() {
    setDiagnosisDraft({ id: null, value: null })
    setResolutionDraft({ id: null, value: null })
    writeDraft(ticketId, 'diagnosis', '')
    writeDraft(ticketId, 'resolution', '')
  }

  async function handleAssign(operatorId) {
    if (!operatorId) return
    setActionError(null)
    setNotice(null)
    try {
      await onAssign(ticketId, Number(operatorId))
      setNotice('Operador asignado correctamente.')
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'No se pudo asignar el operador.')
    }
  }

  function openAdvance() {
    const targetCode = NEXT_STATUS[ticket.statusCode]
    if (!targetCode) return
    const isResolve = targetCode === 'RESOLVED'
    const isReopen = targetCode === 'IN_PROGRESS' && ticket.statusCode === 'RESOLVED'
    setActionError(null)
    setNotice(null)
    setTransition({
      targetCode,
      required: isResolve || isReopen,
      field: isResolve ? 'resolution' : 'comment',
      prefill: isResolve ? resolutionValue : diagnosisValue,
    })
  }

  function openCancel() {
    setActionError(null)
    setNotice(null)
    setTransition({ targetCode: 'CANCELLED', required: true, field: 'comment', prefill: '' })
  }

  async function confirmTransition(text) {
    const targetStatus = lookups.statuses.find((status) => status.code === transition.targetCode)
    if (!targetStatus) throw new Error('Estado destino no disponible.')
    const payload =
      transition.field === 'resolution'
        ? {
            targetStatusId: targetStatus.id,
            resolution: text,
            comment: diagnosisValue || undefined,
          }
        : { targetStatusId: targetStatus.id, comment: text }
    await onTransition(ticketId, payload)
    clearDrafts()
    setTransition(null)
    setNotice('Transición registrada correctamente.')
  }

  function startEdit() {
    setActionError(null)
    setNotice(null)
    setEditForm({
      title: ticket.title,
      description: ticket.description,
      priorityId: String(
        lookups.priorities.find((priority) => priority.code === ticket.priorityCode)?.id ?? '',
      ),
      categoryId: String(
        lookups.categories.find((category) => category.code === ticket.categoryCode)?.id ?? '',
      ),
    })
    setEditing(true)
  }

  async function saveEdit() {
    if (
      !editForm.title.trim() ||
      !editForm.description.trim() ||
      !editForm.priorityId ||
      !editForm.categoryId
    ) {
      setActionError('Completa título, descripción, prioridad y categoría.')
      return
    }
    setActionError(null)
    try {
      await onUpdate(ticketId, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        priorityId: Number(editForm.priorityId),
        categoryId: Number(editForm.categoryId),
      })
      setEditing(false)
      setNotice('Ticket actualizado correctamente.')
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'No se pudo actualizar el ticket.')
    }
  }

  function updateEditField(event) {
    setEditForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  if (error && isLoading) {
    return (
      <>
        <div className="overlay" onClick={onClose} />
        <aside className="drawer">
          <div className="drawer-head">
            <h2>Detalle del ticket</h2>
            <button type="button" className="drawer-close" onClick={onClose} aria-label="Cerrar">
              <CloseIcon />
            </button>
          </div>
          <p className="drawer-error">
            <AlertIcon width={16} height={16} />
            {error}
          </p>
        </aside>
      </>
    )
  }

  if (isLoading) {
    return (
      <>
        <div className="overlay" onClick={onClose} />
        <aside className="drawer">
          <div className="drawer-head">
            <h2>Detalle del ticket</h2>
            <button type="button" className="drawer-close" onClick={onClose} aria-label="Cerrar">
              <CloseIcon />
            </button>
          </div>
          <p className="center-state">Cargando…</p>
        </aside>
      </>
    )
  }

  const nextCode = NEXT_STATUS[ticket.statusCode]
  const canAdvance = Boolean(nextCode) && !(ticket.statusCode === 'PENDING' && !ticket.assignedTo)
  const canCancel = CANCELLABLE_STATUSES.includes(ticket.statusCode)

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <aside className="drawer">
        <div className="drawer-head">
          <h2>Detalle del ticket</h2>
          <StatusBadge status={ticket.statusCode} />
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>

        <p className="drawer-label">ID del ticket</p>
        <p className="drawer-ticket-id">{ticket.ticketNumber}</p>

        <div className="drawer-section">
          <p className="drawer-label drawer-field-label">Asignar operador</p>
          <select
            value={ticket.assignedTo ? String(ticket.assignedTo) : ''}
            onChange={(event) => handleAssign(event.target.value)}
            disabled={Boolean(ticket.assignedTo)}
          >
            {!ticket.assignedTo && <option value="">Seleccionar operador</option>}
            {(lookups.operators ?? []).map((operator) => (
              <option key={operator.id} value={operator.id}>
                {operator.name}
              </option>
            ))}
          </select>
        </div>

        <div className="drawer-section">
          <p className="drawer-section-title">Datos del ticket</p>
          <dl className="data-list">
            <div>
              <dt>Título</dt>
              <dd>{ticket.title}</dd>
            </div>
            <div>
              <dt>Prioridad</dt>
              <dd>{priorityLabel(ticket.priorityCode)}</dd>
            </div>
            <div>
              <dt>Categoría</dt>
              <dd>{CATEGORY_LABELS[ticket.categoryCode] ?? ticket.categoryCode}</dd>
            </div>
            <div>
              <dt>Descripción</dt>
              <dd>{ticket.description}</dd>
            </div>
            <div>
              <dt>Fecha de apertura</dt>
              <dd>{formatDateTime(ticket.createdAt)}</dd>
            </div>
          </dl>
        </div>

        {editing && editForm && (
          <div className="drawer-section">
            <p className="drawer-section-title">Editar ticket</p>
            <div className="field">
              <label htmlFor="edit-title">Título</label>
              <input
                id="edit-title"
                name="title"
                value={editForm.title}
                onChange={updateEditField}
                maxLength={150}
              />
            </div>
            <div className="field">
              <label htmlFor="edit-priority">Prioridad</label>
              <select
                id="edit-priority"
                name="priorityId"
                value={editForm.priorityId}
                onChange={updateEditField}
              >
                <option value="">Seleccionar prioridad</option>
                {(lookups.priorities ?? []).map((priority) => (
                  <option key={priority.id} value={priority.id}>
                    {PRIORITY_LABELS[priority.code] ?? priority.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="edit-category">Categoría</label>
              <select
                id="edit-category"
                name="categoryId"
                value={editForm.categoryId}
                onChange={updateEditField}
              >
                <option value="">Seleccionar categoría</option>
                {(lookups.categories ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {CATEGORY_LABELS[category.code] ?? category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="edit-description">Descripción</label>
              <textarea
                id="edit-description"
                name="description"
                value={editForm.description}
                onChange={updateEditField}
                maxLength={2000}
              />
            </div>
            <div className="drawer-actions">
              <button type="button" className="btn btn-primary" onClick={saveEdit}>
                Guardar cambios
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="drawer-section">
          <p className="drawer-section-title">Campos de resolución</p>
          <label className="drawer-label" htmlFor="drawer-diagnosis">
            Diagnóstico
          </label>
          <textarea
            id="drawer-diagnosis"
            value={diagnosisValue}
            onChange={(event) => changeDiagnosis(event.target.value)}
            maxLength={2000}
          />
          <p className="field-hint">Describe el diagnóstico técnico.</p>
          <label className="drawer-label drawer-label-gap" htmlFor="drawer-resolution">
            Resolución
          </label>
          <textarea
            id="drawer-resolution"
            value={resolutionValue}
            onChange={(event) => changeResolution(event.target.value)}
            maxLength={2000}
          />
          <p className="field-hint">Describe la solución aplicada.</p>
        </div>

        <div className="drawer-actions">
          <button type="button" className="btn btn-primary" onClick={openAdvance} disabled={!canAdvance}>
            {nextCode ? advanceLabel(ticket.statusCode) : 'Flujo completado'}
          </button>
          {canCancel && (
            <button type="button" className="btn btn-danger" onClick={openCancel}>
              Cancelar ticket
            </button>
          )}
          {!editing && (
            <button type="button" className="btn btn-secondary" onClick={startEdit}>
              Editar
            </button>
          )}
        </div>
        {ticket.statusCode === 'PENDING' && !ticket.assignedTo && (
          <p className="drawer-hint">Asigna un operador para iniciar la atención.</p>
        )}
        {notice && <p className="form-success drawer-notice">{notice}</p>}
        {actionError && (
          <p className="drawer-error">
            <AlertIcon width={16} height={16} />
            {actionError}
          </p>
        )}
        {error && (
          <p className="drawer-error">
            <AlertIcon width={16} height={16} />
            {error}
          </p>
        )}

        <div className="drawer-section drawer-history">
          <p className="drawer-section-title">Historial</p>
          <HistoryTimeline entries={history} />
        </div>
      </aside>

      {transition && (
        <TransitionModal
          targetLabel={statusLabel(transition.targetCode)}
          required={transition.required}
          defaultValue={transition.prefill}
          onConfirm={confirmTransition}
          onClose={() => setTransition(null)}
        />
      )}
    </>
  )
}

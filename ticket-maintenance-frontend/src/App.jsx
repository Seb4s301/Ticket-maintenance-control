import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import { ApiError } from './api/client.js'
import {
  assignTicket,
  createTicket,
  getLookups,
  listTickets,
  transitionTicket,
  updateTicket,
} from './api/tickets.js'
import DetailDrawer from './components/DetailDrawer.jsx'
import Header from './components/Header.jsx'
import KanbanBoard from './components/KanbanBoard.jsx'
import LoginScreen from './components/LoginScreen.jsx'
import NewTicketForm from './components/NewTicketForm.jsx'
import ProfileModal from './components/ProfileModal.jsx'
import StatCards from './components/StatCards.jsx'
import { useAuth } from './hooks/useAuth.js'
import { clearAllDrafts, formatUpdated } from './utils.js'
import { AlertIcon, RefreshIcon } from './components/icons.jsx'

const PAGE_SIZE = 200

function App() {
  const { user, token, saveAuth, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const [lookups, setLookups] = useState(null)
  const [tickets, setTickets] = useState([])
  const [updatedAt, setUpdatedAt] = useState(() => new Date())
  const [loadError, setLoadError] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [search, setSearch] = useState('')
  const [assignedTo, setAssignedTo] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const fetchSeq = useRef(0)

  const resetBoard = useCallback(() => {
    fetchSeq.current += 1
    setProfileOpen(false)
    setSelectedId(null)
    setLookups(null)
    setTickets([])
    setSearch('')
    setAssignedTo(null)
    setLoadError(null)
    setLoadingMore(false)
    clearAllDrafts()
  }, [])

  useEffect(() => {
    function onUnauthorized() {
      resetBoard()
    }
    window.addEventListener('tm:unauthorized', onUnauthorized)
    return () => window.removeEventListener('tm:unauthorized', onUnauthorized)
  }, [resetBoard])

  function handleLogout() {
    resetBoard()
    logout()
  }

  const loadData = useCallback(
    (pages = 1) => {
      const pageCount = Number.isInteger(pages) && pages > 0 ? pages : 1
      const seq = ++fetchSeq.current
      const filters = assignedTo != null ? { assignedTo } : {}
      const pageLoads = Array.from({ length: pageCount }, (_, index) =>
        listTickets({ limit: PAGE_SIZE, offset: index * PAGE_SIZE, ...filters }),
      )
      return Promise.all([getLookups(), ...pageLoads])
        .then(([lookupData, ...ticketPages]) => {
          if (seq !== fetchSeq.current) return
          const lastPage = ticketPages[ticketPages.length - 1]
          setLookups(lookupData)
          setTickets(ticketPages.flat())
          setPage(pageCount)
          setHasMore(lastPage.length === PAGE_SIZE)
          setUpdatedAt(new Date())
          setLoadError(null)
          setLoadingMore(false)
        })
        .catch((err) => {
          if (seq !== fetchSeq.current) return
          setLoadError(
            err instanceof ApiError ? err.message : 'No se pudo cargar el panel de mantenimiento.',
          )
          setLoadingMore(false)
        })
    },
    [assignedTo],
  )

  useEffect(() => {
    if (!token) return
    loadData()
  }, [token, loadData])

  function handleLoadMore() {
    const seq = fetchSeq.current
    const filters = assignedTo != null ? { assignedTo } : {}
    setLoadingMore(true)
    listTickets({ limit: PAGE_SIZE, offset: page * PAGE_SIZE, ...filters })
      .then((more) => {
        if (seq !== fetchSeq.current) return
        setTickets((prev) => [...prev, ...more])
        setPage((prev) => prev + 1)
        setHasMore(more.length === PAGE_SIZE)
        setUpdatedAt(new Date())
      })
      .catch((err) => {
        if (seq !== fetchSeq.current) return
        setLoadError(err instanceof ApiError ? err.message : 'No se pudieron cargar más tickets.')
      })
      .finally(() => {
        if (seq === fetchSeq.current) setLoadingMore(false)
      })
  }

  const closeDrawer = useCallback(() => setSelectedId(null), [])

  async function handleCreate(body) {
    await createTicket(body)
    await loadData(page)
  }

  async function handleAssign(id, operatorId) {
    await assignTicket(id, { operatorId })
    await loadData(page)
    setReloadKey((key) => key + 1)
  }

  async function handleTransition(id, payload) {
    await transitionTicket(id, {
      targetStatusId: payload.targetStatusId,
      comment: payload.comment,
      resolution: payload.resolution,
    })
    await loadData(page)
    setReloadKey((key) => key + 1)
  }

  async function handleUpdate(id, payload) {
    await updateTicket(id, {
      title: payload.title,
      description: payload.description,
      priorityId: payload.priorityId,
      categoryId: payload.categoryId,
    })
    await loadData(page)
    setReloadKey((key) => key + 1)
  }

  if (!token) {
    return <LoginScreen onLogin={saveAuth} />
  }

  if (!lookups && loadError) {
    return (
      <div className="center-state error">
        <p>{loadError}</p>
        <button type="button" className="btn btn-primary retry-btn" onClick={() => loadData()}>
          Reintentar
        </button>
      </div>
    )
  }

  if (!lookups) {
    return <div className="center-state">Cargando panel de mantenimiento…</div>
  }

  return (
    <div className="app-shell">
      <Header user={user} onProfile={() => setProfileOpen(true)} onLogout={handleLogout} />
      <main className="app-main">
        <div className="page-title-row">
          <div>
            <h1 className="page-title">Panel de mantenimiento</h1>
            <p className="page-subtitle">
              Supervisa incidencias y mantén tus activos en funcionamiento.
            </p>
          </div>
          <div className="updated-pill">
            <span className="updated-dot" />
            {formatUpdated(updatedAt)}
            <button
              type="button"
              className="refresh-btn"
              onClick={() => loadData(page)}
              aria-label="Actualizar lista"
            >
              <RefreshIcon width={16} height={16} />
            </button>
          </div>
        </div>

        {loadError && (
          <p className="form-error">
            <AlertIcon width={16} height={16} />
            {loadError}
          </p>
        )}

        <StatCards tickets={tickets} />

        <div className="board-layout">
          <NewTicketForm lookups={lookups} onSubmit={handleCreate} />
          <KanbanBoard
            statuses={lookups.statuses}
            operators={lookups.operators}
            tickets={tickets}
            search={search}
            onSearchChange={setSearch}
            assignedTo={assignedTo}
            onAssignedToChange={setAssignedTo}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={handleLoadMore}
            onOpen={setSelectedId}
          />
        </div>
      </main>

      {selectedId != null && (
        <DetailDrawer
          ticketId={selectedId}
          reloadKey={reloadKey}
          lookups={lookups}
          suspended={profileOpen}
          onClose={closeDrawer}
          onAssign={handleAssign}
          onTransition={handleTransition}
          onUpdate={handleUpdate}
        />
      )}

      {profileOpen && (
        <ProfileModal
          user={user}
          onClose={() => setProfileOpen(false)}
          onSaved={saveAuth}
        />
      )}
    </div>
  )
}

export default App

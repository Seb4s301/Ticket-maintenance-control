import { useState } from 'react'
import './App.css'
import NewTicketPage from './pages/NewTicketPage.jsx'
import TicketDetailPage from './pages/TicketDetailPage.jsx'
import TicketListPage from './pages/TicketListPage.jsx'

function App() {
  const [view, setView] = useState({ page: 'list' })

  if (view.page === 'new') {
    return (
      <main className="app">
        <NewTicketPage
          onCreated={(id) => setView({ page: 'detail', id })}
          onCancel={() => setView({ page: 'list' })}
        />
      </main>
    )
  }

  if (view.page === 'detail') {
    return (
      <main className="app">
        <TicketDetailPage ticketId={view.id} onBack={() => setView({ page: 'list' })} />
      </main>
    )
  }

  return (
    <main className="app">
      <TicketListPage
        onOpen={(id) => setView({ page: 'detail', id })}
        onNew={() => setView({ page: 'new' })}
      />
    </main>
  )
}

export default App

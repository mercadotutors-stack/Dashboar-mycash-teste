import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ROUTES } from './constants'
import { Layout } from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Cards from './pages/Cards'
import Accounts from './pages/Accounts'
import Transactions from './pages/Transactions'
import Profile from './pages/Profile'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.CARDS} element={<Cards />} />
          <Route path={ROUTES.ACCOUNTS} element={<Accounts />} />
          <Route path={ROUTES.TRANSACTIONS} element={<Transactions />} />
          <Route path={ROUTES.PROFILE} element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from './constants'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Cards from './pages/Cards'
import Accounts from './pages/Accounts'
import Transactions from './pages/Transactions'
import Profile from './pages/Profile'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.SIGNUP} element={<Signup />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />

        {/* Rotas protegidas */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.CARDS} element={<Cards />} />
          <Route path={ROUTES.ACCOUNTS} element={<Accounts />} />
          <Route path={ROUTES.TRANSACTIONS} element={<Transactions />} />
          <Route path={ROUTES.PROFILE} element={<Profile />} />
        </Route>

        {/* Redireciona rotas desconhecidas para login */}
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

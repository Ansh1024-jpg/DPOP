import { Navigate, Route, Routes } from 'react-router-dom'

import { useAuthStore } from './store/authStore'
import type { AuthUser } from './types/index'

import Login from './pages/Login'
import Upload from './pages/applicant/Upload'
import ReviewCorrect from './pages/applicant/ReviewCorrect'
import PolicyManagerDashboard from './pages/policy-manager/Dashboard'
import PolicyManagerApplicationDetail from './pages/policy-manager/ApplicationDetail'
import ManagerDashboard from './pages/manager/Dashboard'
import ManagerApplicationDetail from './pages/manager/ApplicationDetail'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: AuthUser['role'][]
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(user.role)) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RootRedirect() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'applicant') return <Navigate to="/applicant/upload" replace />
  if (user.role === 'policy_manager') return <Navigate to="/policy-manager/dashboard" replace />
  return <Navigate to="/manager/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RootRedirect />} />

      <Route
        path="/applicant/upload"
        element={
          <ProtectedRoute allowedRoles={['applicant']}>
            <Upload />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applicant/review/:id"
        element={
          <ProtectedRoute allowedRoles={['applicant']}>
            <ReviewCorrect />
          </ProtectedRoute>
        }
      />

      <Route
        path="/policy-manager/dashboard"
        element={
          <ProtectedRoute allowedRoles={['policy_manager']}>
            <PolicyManagerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/policy-manager/application/:id"
        element={
          <ProtectedRoute allowedRoles={['policy_manager']}>
            <PolicyManagerApplicationDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/application/:id"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <ManagerApplicationDetail />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

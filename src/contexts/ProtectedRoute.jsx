import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '@/store/useAuthStore'

const ProtectedRoute = ({ children }) => {
  const user = useAuthStore((s) => s.user)
  const { pathname } = useLocation()

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  if (user.must_change_password && pathname !== '/admin/reset-password') {
    return <Navigate to="/admin/reset-password" replace />
  }

  return children
}

export default ProtectedRoute

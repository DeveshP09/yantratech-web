import { Navigate } from 'react-router-dom'
import useAuthStore from '@/store/useAuthStore'

const AuthRedirect = ({ children }) => {
  const user = useAuthStore((s) => s.user)

  if (user) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return children
}

export default AuthRedirect

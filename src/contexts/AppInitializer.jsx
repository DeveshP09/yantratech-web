import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { setSessionExpiredHandler } from '@/services/Apiservice'
import useAuthStore from '@/store/useAuthStore'

const AppInitializer = ({ children }) => {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()

  useEffect(() => {
    setSessionExpiredHandler(() => {
      clearAuth()
      navigate('/admin/login', { replace: true })
    })

    return () => setSessionExpiredHandler(null)
  }, [clearAuth, navigate])

  return children
}

export default AppInitializer

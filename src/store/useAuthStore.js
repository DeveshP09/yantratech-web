import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { hasStoredTokens } from '@/services/tokenStorage'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearAuth: () => set({ user: null }),
    }),
    {
      name: 'auth_user',
      onRehydrateStorage: () => (state) => {
        // The persisted user outlives the tokens (cleared on session expiry, or
        // by a logout in another tab). Without a token pair there is no session
        // to restore, so drop the user instead of letting ProtectedRoute admit
        // a request that would 401 straight away.
        if (state?.user && !hasStoredTokens()) state.clearAuth()
      },
    }
  )
)

export default useAuthStore

import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import ProtectedRoute from '../contexts/ProtectedRoute'
import AuthRedirect from '../contexts/AuthRedirect'
import AppInitializer from '../contexts/AppInitializer'
import AdminLayout from '../layouts/app-layout'

const AdminLogin    = lazy(() => import('./on-boarding/admin-login'))
const ResetPassword = lazy(() => import('./on-boarding/reset-password'))
const Dashboard     = lazy(() => import('./admin-view/dashboard'))
const Attendance    = lazy(() => import('./admin-view/attendance'))
const Batch         = lazy(() => import('./admin-view/batch'))
const BatchList        = lazy(() => import('./admin-view/batch/batch-list'))
const BatchStudentList = lazy(() => import('./admin-view/batch/batch-student-list'))
const MarkAttendance   = lazy(() => import('./admin-view/attendance/mark-attendence'))
const Settings         = lazy(() => import('./admin-view/settings'))

const wrap = (Component) => (
  <Suspense fallback={null}>
    <Component />
  </Suspense>
)

const router = createBrowserRouter([
  {
    // Root wrapper — provides session expiry handler to all routes
    element: <AppInitializer><Outlet /></AppInitializer>,
    children: [
      { path: '/', element: <Navigate to="/admin/login" replace /> },

      // Public — onboarding
      {
        path: '/admin/login',
        element: <AuthRedirect>{wrap(AdminLogin)}</AuthRedirect>,
      },
      {
        // Public-ish: accessible to anyone with `mode: 'forgot'` (logged-out)
        // and to authenticated users who have must_change_password = true.
        // The page itself bounces fully-authenticated users to dashboard.
        path: '/admin/reset-password',
        element: wrap(ResetPassword),
      },

      // Protected — admin panel
      {
        path: '/admin',
        element: (
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard',  element: wrap(Dashboard) },
          {
            path: 'attendance',
            element: wrap(Attendance),
            children: [
              { index: true, element: <Navigate to="mark" replace /> },
              { path: 'mark', element: wrap(MarkAttendance) },
            ],
          },
          {
            path: 'batch',
            element: wrap(Batch),
            children: [
              { index: true, element: <Navigate to="list" replace /> },
              { path: 'list', element: wrap(BatchList) },
              { path: ':id',  element: wrap(BatchStudentList) },
            ],
          },
          { path: 'settings',   element: wrap(Settings) },
        ],
      },

      { path: '*', element: <Navigate to="/admin/login" replace /> },
    ],
  },
])

export default router

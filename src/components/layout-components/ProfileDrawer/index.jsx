import { useState } from 'react'
import { Avatar, Button, Drawer, Divider } from 'antd'
import {
  UserOutlined,
  LogoutOutlined,
  PhoneOutlined,
  IdcardOutlined,
  BankOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '@/store/useAuthStore'
import { logout } from '@/services/AuthApiService'

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 py-3">
    <div className="w-8 h-8 rounded-lg bg-[#f0e6ec] flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div className="leading-tight min-w-0">
      <div className="text-[11px] text-[#6b6b75] mb-0.5">{label}</div>
      <div className="text-[13px] font-semibold text-[#1c1b1f] truncate">{value || '—'}</div>
    </div>
  </div>
)

const ProfileDrawer = ({ open, onClose }) => {
  const [loggingOut, setLoggingOut] = useState(false)
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    clearAuth()
    navigate('/admin/login', { replace: true })
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      width="35%"
      styles={{ header: { display: 'none' }, body: { padding: 0 } }}
    >
      {/* Gradient top section */}
      <div
        className="px-6 pt-8 pb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #a04880 0%, #7a3559 100%)' }}
      >
        <div className="absolute -top-10 -right-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white/[0.07]" />

        <Avatar
          size={64}
          icon={<UserOutlined />}
          style={{
            backgroundColor: 'rgba(255,255,255,0.25)',
            border: '2px solid rgba(255,255,255,0.4)',
          }}
          className="relative z-10"
        />
        <div className="mt-3 relative z-10">
          <div className="text-white font-bold text-[18px] leading-tight">
            {user?.name || 'Admin User'}
          </div>
          <div className="text-white/70 text-[13px] capitalize mt-0.5">
            {user?.role ? user.role.replace('_', ' ') : 'Super Admin'}
          </div>
        </div>
      </div>

      {/* Details section */}
      <div className="px-6 py-2">
        <p className="text-[11px] font-semibold text-[#6b6b75] tracking-widest mt-4 mb-1">
          ACCOUNT DETAILS
        </p>

        <InfoRow
          icon={<UserOutlined style={{ fontSize: 14, color: '#ba558f' }} />}
          label="Full Name"
          value={user?.name}
        />
        <Divider style={{ margin: 0 }} />

        <InfoRow
          icon={<IdcardOutlined style={{ fontSize: 14, color: '#ba558f' }} />}
          label="Role"
          value={user?.role ? user.role.replace('_', ' ') : null}
        />
        <Divider style={{ margin: 0 }} />

        <InfoRow
          icon={<PhoneOutlined style={{ fontSize: 14, color: '#ba558f' }} />}
          label="User ID"
          value={user?.id ? `#${user.id}` : null}
        />
        <Divider style={{ margin: 0 }} />

        <InfoRow
          icon={<BankOutlined style={{ fontSize: 14, color: '#ba558f' }} />}
          label="Institute"
          value={user?.institute_name || (user?.institute_id ? `#${user.institute_id}` : null)}
        />

        {/* Students only — null for teachers and the operator */}
        {(user?.batch_name || user?.batch_id) && (
          <>
            <Divider style={{ margin: 0 }} />
            <InfoRow
              icon={<TeamOutlined style={{ fontSize: 14, color: '#ba558f' }} />}
              label="Batch"
              value={user?.batch_name || `#${user.batch_id}`}
            />
          </>
        )}
      </div>

      {/* Logout pinned to bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-[#e3e1e6] bg-white">
        <Button
          danger
          icon={<LogoutOutlined />}
          size="large"
          block
          loading={loggingOut}
          onClick={handleLogout}
          style={{ borderRadius: 10, height: 44, fontWeight: 600, fontSize: 14 }}
        >
          {loggingOut ? 'Signing out…' : 'Sign Out'}
        </Button>
      </div>
    </Drawer>
  )
}

export default ProfileDrawer

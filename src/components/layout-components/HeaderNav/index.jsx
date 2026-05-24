import { useState } from 'react'
import { Layout, Avatar, Badge, Button } from 'antd'
import { BellOutlined, QuestionCircleOutlined, UserOutlined } from '@ant-design/icons'
import { useLocation } from 'react-router-dom'
import { MENU_ITEMS } from '@/configs/appConfig'
import useAuthStore from '@/store/useAuthStore'
import ProfileDrawer from '@/components/layout-components/ProfileDrawer'

const { Header } = Layout

const HeaderNav = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const user = useAuthStore((s) => s.user)

  const activeItem = MENU_ITEMS.find((item) =>
    location.pathname.startsWith(item.path)
  )
  const title = activeItem?.label ?? 'Dashboard'

  return (
    <>
      <Header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e3e1e6',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        {/* Page title */}
        <h1 className="text-[#1c1b1f] font-semibold text-lg m-0">{title}</h1>

        {/* Right cluster */}
        <div className="flex items-center gap-3">
          <Badge dot color="#dc2626">
            <Button
              type="text"
              shape="circle"
              icon={<BellOutlined style={{ fontSize: 18, color: '#1c1b1f' }} />}
            />
          </Badge>

          <Button
            type="text"
            shape="circle"
            icon={<QuestionCircleOutlined style={{ fontSize: 18, color: '#1c1b1f' }} />}
          />

          {/* User chip — opens profile drawer */}
          <div
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 pl-3 border-l border-[#e3e1e6] cursor-pointer group"
          >
            <div className="text-right leading-tight">
              <div className="text-[13px] font-semibold text-[#1c1b1f] group-hover:text-[#ba558f] transition-colors">
                {user?.name || 'Admin User'}
              </div>
              <div className="text-[11px] text-[#6b6b75] capitalize">
                {user?.role ? user.role.replace('_', ' ') : 'Super Admin'}
              </div>
            </div>
            <Avatar
              size={36}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#ba558f' }}
            />
          </div>
        </div>
      </Header>

      <ProfileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}

export default HeaderNav

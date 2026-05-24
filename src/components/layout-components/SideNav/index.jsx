import { Layout, Menu, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { MENU_ITEMS } from '@/configs/appConfig'

const { Sider } = Layout

const SideNav = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate()
  const location = useLocation()

  // Resolve which menu key is active from the current pathname
  const activeKey =
    MENU_ITEMS.find((item) => location.pathname.startsWith(item.path))?.key ?? 'dashboard'

  // AntD Menu expects { key, icon, label } — map from MENU_ITEMS
  const items = MENU_ITEMS.map(({ key, icon, label }) => ({ key, icon, label }))

  const handleClick = ({ key }) => {
    const target = MENU_ITEMS.find((item) => item.key === key)
    if (target) navigate(target.path)
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      breakpoint="lg"
      width={240}
      collapsedWidth={72}
      theme="light"
      style={{
        borderRight: '1px solid #e3e1e6',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
      }}
    >
      {/* Brand */}
      <div className="px-5 py-5 border-b border-[#e3e1e6] h-[64px] flex flex-col justify-center overflow-hidden">
        {!collapsed ? (
          <>
            <div className="text-[#ba558f] font-bold text-[15px] leading-tight whitespace-nowrap">
              YantraTech
            </div>
            <div className="text-[#6b6b75] text-[11px] mt-0.5 whitespace-nowrap">
              Admin Console
            </div>
          </>
        ) : (
          <div className="text-[#ba558f] font-bold text-lg text-center">Y</div>
        )}
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[activeKey]}
        onClick={handleClick}
        items={items}
        style={{ border: 'none', padding: '12px 8px', fontSize: 14 }}
      />

      {/* Bottom action — pinned above AntD's collapse trigger */}
      {/* <div className="absolute bottom-12 left-0 right-0 px-3 py-3 border-t border-[#e3e1e6]">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          block
          size="large"
          style={{
            background: 'linear-gradient(90deg, #ba558f 0%, #8f3f6d 100%)',
            border: 'none',
            borderRadius: 10,
            height: 40,
            fontWeight: 500,
            fontSize: 13,
          }}
        >
          {!collapsed && 'New Report'}
        </Button>
      </div> */}
    </Sider>
  )
}

export default SideNav

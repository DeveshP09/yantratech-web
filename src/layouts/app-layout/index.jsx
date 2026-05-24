import { useState } from 'react'
import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import SideNav from '@/components/layout-components/SideNav'
import HeaderNav from '@/components/layout-components/HeaderNav'

const { Content } = Layout

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Layout style={{ minHeight: '100vh', background: '#f7f7fb' }}>
      <SideNav collapsed={collapsed} onCollapse={setCollapsed} />

      <Layout style={{ background: '#f7f7fb' }}>
        <HeaderNav />

        <Content style={{ padding: 24, overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout

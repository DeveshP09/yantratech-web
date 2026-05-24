import {
  AppstoreOutlined,
  CalendarOutlined,
  TeamOutlined,
  SettingOutlined,
} from '@ant-design/icons'

export const MENU_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <AppstoreOutlined />,
    path: '/admin/dashboard',
  },
  {
    key: 'batch',
    label: 'Batch',
    icon: <TeamOutlined />,
    path: '/admin/batch',
  },
  {
    key: 'attendance',
    label: 'Attendance',
    icon: <CalendarOutlined />,
    path: '/admin/attendance',
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <SettingOutlined />,
    path: '/admin/settings',
  },
]

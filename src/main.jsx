import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ConfigProvider } from 'antd'
import queryClient from './configs/queryClient'
import { buttonTokens, inputTokens, datePickerTokens, selectTokens, tableTokens } from './assets/component-tokens'
import './global.css'
import './custom.scss'
import './assets/scss/index.scss'
import App from './App.jsx'

const theme = {
  token: {
    colorPrimary: '#ba558f',
    colorError: '#dc2626',
    colorSuccess: '#16a34a',
    colorWarning: '#ea9217',
    colorInfo: '#2563eb',
    borderRadius: 8,
    fontFamily: 'Poppins, sans-serif',
    colorBgBase: '#ffffff',
    colorTextBase: '#1c1b1f',
    colorBorder: '#e3e1e6',
    colorBgLayout: '#f7f7fb',
  },
  components: {
    Button: buttonTokens,
    Input: inputTokens,
    DatePicker: datePickerTokens,
    Select: selectTokens,
    Table: tableTokens,
  },
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={theme}>
        <App />
      </ConfigProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)

import { Form, Input, Button, Divider } from 'antd'
import {
  LockOutlined,
  SafetyCertificateOutlined,
  CustomerServiceOutlined,
  PhoneOutlined,
} from '@ant-design/icons'
import { MdSchool } from 'react-icons/md'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { login } from '@/services/AuthApiService'
import useAuthStore from '@/store/useAuthStore'
import { notifyError } from '@/utilities/notification'
import { ERROR_CODES, parseApiError, toFormFields } from '@/utilities/apiError'

const AdminLogin = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const { mutate: doLogin, isPending } = useMutation({
    // The service normalises `phone` to E.164 (+91…) before it hits the API.
    mutationFn: ({ phone, password }) =>
      login({ phone, role: 'admin', password }),
    onSuccess: (data) => {
      setUser(data.user)
      if (data.user?.must_change_password) {
        navigate('/admin/reset-password', { replace: true, state: { mode: 'change' } })
      } else {
        navigate('/admin/dashboard', { replace: true })
      }
    },
    onError: (error) => {
      const { code, message, fieldErrors } = parseApiError(
        error,
        'Invalid credentials. Please try again.'
      )

      // 400 validation shape — surface inline under the offending field.
      const formFields = toFormFields(fieldErrors)
      if (formFields.length) form.setFields(formFields)

      const title =
        code === ERROR_CODES.RATE_LIMITED ? 'Too Many Attempts' : 'Login Failed'
      notifyError(title, message)
    },
  })

  return (
    <div className="min-h-screen w-full flex">

      {/* ── Left panel ── */}
      <div
        className="hidden md:flex flex-col flex-1 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #a04880 0%, #7a3559 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-white/10" />
        <div className="absolute top-1/3 right-0 w-44 h-44 rounded-full bg-white/[0.07]" />
        <div className="absolute -bottom-24 -left-12 w-80 h-80 rounded-full bg-white/10" />

        {/* Logo */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <MdSchool size={20} color="#fff" />
          </div>
          <span className="text-white font-semibold text-lg tracking-wide">YantraTech</span>
        </div>

        {/* Heading — centered vertically */}
        <div className="flex-1 flex flex-col justify-center relative z-10 py-8">
          <h1 className="text-white font-bold text-[34px] leading-[1.15] mb-5">
            Advanced<br />Administrative<br />Control Center
          </h1>
          <p className="text-white/70 text-[15px] leading-relaxed max-w-md">
            Secure access for YantraTech portal administrators. Manage learning
            journeys, system security, and platform performance from a unified
            scholarly interface.
          </p>
        </div>

        {/* Dots */}
        <div className="flex gap-2 relative z-10">
          <div className="w-2 h-2 rounded-full bg-white/70" />
          <div className="w-2 h-2 rounded-full bg-white/30" />
          <div className="w-2 h-2 rounded-full bg-white/30" />
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="w-full md:w-[40%] shrink-0 bg-white flex flex-col justify-between px-12 py-10">
        {/* Top spacer for vertical balance */}
        <div />

        {/* Form block — vertically centered */}
        <div className="w-full max-w-md mx-auto">
          <h2 className="text-[28px] font-bold text-[#1c1b1f] mb-1.5">Welcome Back!</h2>
          <p className="text-[#6b6b75] text-sm mb-8">Sign in to your administrative dashboard.</p>

          <Form
            form={form}
            layout="vertical"
            onFinish={doLogin}
            requiredMark={false}
          >
            {/* Phone */}
            <Form.Item
              label={<span className="text-xs font-semibold text-[#1c1b1f]">Phone Number</span>}
              name="phone"
              rules={[
                { required: true, message: 'Phone number is required' },
                {
                  pattern: /^\d{10}$/,
                  message: 'Enter a valid 10-digit phone number',
                },
              ]}
            >
              <Input
                prefix={
                  <span className="flex items-center gap-1.5 text-[#6b6b75]">
                    <PhoneOutlined />
                    <span className="text-[13px]">+91</span>
                  </span>
                }
                placeholder="9999900001"
                maxLength={10}
                inputMode="numeric"
                size="large"
                style={{ borderRadius: 10, backgroundColor: '#f7f7fb' }}
              />
            </Form.Item>

            {/* Password — manual label row */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-[#1c1b1f]">Password</span>
              <button
                type="button"
                onClick={() => navigate('/admin/reset-password', { state: { mode: 'forgot' } })}
                className="text-xs font-medium text-[#ba558f] hover:text-[#8f3f6d] bg-transparent border-none cursor-pointer p-0 leading-none"
              >
                Forgot Password?
              </button>
            </div>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Password is required' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-[#6b6b75]" />}
                placeholder="Enter your secure password"
                size="large"
                style={{ borderRadius: 10, backgroundColor: '#f7f7fb' }}
              />
            </Form.Item>

            {/* Submit */}
            <Form.Item className="mt-6 mb-0">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={isPending}
                block
                style={{
                  background: isPending
                    ? '#ba558f'
                    : 'linear-gradient(90deg, #ba558f 0%, #8f3f6d 100%)',
                  border: 'none',
                  borderRadius: 10,
                  height: 48,
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {isPending ? 'Signing in…' : 'Sign In to Portal →'}
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: '24px 0' }}>
            <span className="text-[10px] tracking-widest font-semibold text-[#6b6b75]">
              INTERNAL USE ONLY
            </span>
          </Divider>

          <div className="flex gap-3">
            <Button
              icon={<SafetyCertificateOutlined />}
              size="large"
              block
              style={{
                borderColor: '#e3e1e6',
                color: '#1c1b1f',
                borderRadius: 10,
                height: 44,
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              SSO Login
            </Button>
            <Button
              icon={<CustomerServiceOutlined />}
              size="large"
              block
              style={{
                borderColor: '#e3e1e6',
                color: '#1c1b1f',
                borderRadius: 10,
                height: 44,
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              IT Support
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full max-w-md mx-auto flex items-center justify-between pt-6 border-t border-[#e3e1e6]">
          <span className="text-[11px] text-[#6b6b75]">© 2024 YantraTech Admin.</span>
          <div className="flex gap-4">
            <button type="button" className="text-[11px] text-[#6b6b75] hover:text-[#ba558f] bg-transparent border-none cursor-pointer p-0">
              Privacy
            </button>
            <button type="button" className="text-[11px] text-[#6b6b75] hover:text-[#ba558f] bg-transparent border-none cursor-pointer p-0">
              Standards
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}

export default AdminLogin

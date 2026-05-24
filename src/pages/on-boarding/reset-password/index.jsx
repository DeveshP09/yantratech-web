import { useMemo } from 'react'
import { Form, Input, Button } from 'antd'
import { LockOutlined, PhoneOutlined, HistoryOutlined } from '@ant-design/icons'
import { MdSchool } from 'react-icons/md'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { changePassword } from '@/services/AuthApiService'
import useAuthStore from '@/store/useAuthStore'
import { notifyError, notifySuccess } from '@/utilities/notification'

const ResetPassword = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  // Resolve mode: explicit route state wins, else infer from auth state
  const mode = useMemo(() => {
    if (location.state?.mode) return location.state.mode
    if (user?.must_change_password) return 'change'
    return 'forgot'
  }, [location.state, user])

  // If a fully-authenticated user lands here without `must_change_password`, bounce
  if (user && !user.must_change_password && mode !== 'forgot') {
    return <Navigate to="/admin/dashboard" replace />
  }

  // ── Change-password mutation (after-login, must_change_password=true)
  const changeMutation = useMutation({
    mutationFn: ({ old_password, new_password }) =>
      changePassword({ old_password, new_password }),
    onSuccess: (data) => {
      if (data?.user) setUser(data.user)
      notifySuccess('Password Updated', 'Your password has been changed successfully.')
      navigate('/admin/dashboard', { replace: true })
    },
    onError: (error) => {
      const message = error?.response?.data?.detail || 'Failed to update password.'
      notifyError('Update Failed', message)
    },
  })

  // ── Forgot-password mutation (stub — API to be wired later)
  const forgotMutation = useMutation({
    mutationFn: async () => {
      // TODO: integrate forgot-password API
      await new Promise((r) => setTimeout(r, 600))
      return true
    },
    onSuccess: () => {
      notifySuccess('Password Reset', 'Please sign in with your new password.')
      navigate('/admin/login', { replace: true })
    },
    onError: () => {
      notifyError('Reset Failed', 'Unable to reset password. Please try again.')
    },
  })

  const isChange = mode === 'change'
  const isPending = isChange ? changeMutation.isPending : forgotMutation.isPending

  const handleSubmit = (values) => {
    if (isChange) {
      changeMutation.mutate({
        old_password: values.old_password,
        new_password: values.new_password,
      })
    } else {
      forgotMutation.mutate({
        phone: values.phone,
        new_password: values.new_password,
      })
    }
  }

  return (
    <div className="min-h-screen w-full flex">

      {/* ── Left panel ── */}
      <div
        className="hidden md:flex flex-col flex-1 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #a04880 0%, #7a3559 100%)' }}
      >
        <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-white/10" />
        <div className="absolute top-1/3 right-0 w-44 h-44 rounded-full bg-white/[0.07]" />
        <div className="absolute -bottom-24 -left-12 w-80 h-80 rounded-full bg-white/10" />

        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <MdSchool size={20} color="#fff" />
          </div>
          <span className="text-white font-semibold text-lg tracking-wide">YantraTech</span>
        </div>

        <div className="flex-1 flex flex-col justify-center relative z-10 py-8">
          <h1 className="text-white font-bold text-[34px] leading-[1.15] mb-5">
            {isChange ? (
              <>Secure<br />Your Account<br />First</>
            ) : (
              <>Recover<br />Your Access<br />Securely</>
            )}
          </h1>
          <p className="text-white/70 text-[15px] leading-relaxed max-w-md">
            {isChange
              ? 'For your security, please update the temporary password assigned to your account before proceeding to the dashboard.'
              : 'Enter your registered phone number and a new password to regain access to your YantraTech administrative account.'}
          </p>
        </div>

        <div className="flex gap-2 relative z-10">
          <div className="w-2 h-2 rounded-full bg-white/70" />
          <div className="w-2 h-2 rounded-full bg-white/30" />
          <div className="w-2 h-2 rounded-full bg-white/30" />
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="w-full md:w-[40%] shrink-0 bg-white flex flex-col justify-between px-12 py-10">
        <div />

        <div className="w-full max-w-md mx-auto">
          <h2 className="text-[28px] font-bold text-[#1c1b1f] mb-1.5">Reset Password</h2>
          <p className="text-[#6b6b75] text-sm mb-8">
            Please enter your details to update your account security.
          </p>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            {isChange ? (
              <>
                {/* Old Password */}
                <Form.Item
                  label={<span className="text-xs font-semibold text-[#1c1b1f]">Old Password</span>}
                  name="old_password"
                  rules={[{ required: true, message: 'Old password is required' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-[#6b6b75]" />}
                    placeholder="Enter old password"
                    size="large"
                    style={{ borderRadius: 10, backgroundColor: '#f7f7fb' }}
                  />
                </Form.Item>
              </>
            ) : (
              <>
                {/* Phone */}
                <Form.Item
                  label={<span className="text-xs font-semibold text-[#1c1b1f]">Phone Number</span>}
                  name="phone"
                  rules={[
                    { required: true, message: 'Phone number is required' },
                    {
                      pattern: /^\+[1-9]\d{7,14}$/,
                      message: 'Enter E.164 format, e.g. +919999900001',
                    },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined className="text-[#6b6b75]" />}
                    placeholder="Enter your phone number"
                    size="large"
                    style={{ borderRadius: 10, backgroundColor: '#f7f7fb' }}
                  />
                </Form.Item>
              </>
            )}

            {/* New Password (shared) */}
            <Form.Item
              label={<span className="text-xs font-semibold text-[#1c1b1f]">New Password</span>}
              name="new_password"
              rules={[
                { required: true, message: 'New password is required' },
                { min: 8, message: 'Password must be at least 8 characters' },
              ]}
            >
              <Input.Password
                prefix={<HistoryOutlined className="text-[#6b6b75]" />}
                placeholder="Enter new password"
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
                {isPending ? 'Updating…' : 'Reset Password →'}
              </Button>
            </Form.Item>
          </Form>

          {/* Back to login */}
          {!isChange && (
            <div className="text-center mt-5">
              <button
                type="button"
                onClick={() => navigate('/admin/login')}
                className="text-xs font-medium text-[#ba558f] hover:text-[#8f3f6d] bg-transparent border-none cursor-pointer p-0"
              >
                ← Back to Sign In
              </button>
            </div>
          )}
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

export default ResetPassword

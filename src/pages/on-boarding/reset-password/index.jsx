import { useMemo } from 'react'
import { Form, Input, Button, Alert } from 'antd'
import { LockOutlined, HistoryOutlined, SafetyOutlined } from '@ant-design/icons'
import { MdSchool } from 'react-icons/md'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { changePassword } from '@/services/AuthApiService'
import useAuthStore from '@/store/useAuthStore'
import { notifyError, notifySuccess } from '@/utilities/notification'
import { ERROR_CODES, parseApiError, toFormFields } from '@/utilities/apiError'

// Mirrors the server-side rules for `new_password`.
const PASSWORD_POLICY = [
  { test: (v) => v.length >= 8, message: 'Password must be at least 8 characters long.' },
  { test: (v) => /[A-Za-z]/.test(v), message: 'Password must contain at least one letter.' },
  { test: (v) => /\d/.test(v), message: 'Password must contain at least one digit.' },
]

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

  const isChange = mode === 'change'

  // ── Change-password mutation (after-login, must_change_password=true)
  const { mutate: doChangePassword, isPending } = useMutation({
    mutationFn: ({ old_password, new_password }) =>
      changePassword({ old_password, new_password }),
    onSuccess: (data) => {
      // Tokens were already replaced by the service; refresh the user snapshot
      // so `must_change_password: false` unblocks the protected routes.
      if (data?.user) setUser(data.user)
      notifySuccess('Password Updated', 'Your password has been changed successfully.')
      navigate('/admin/dashboard', { replace: true })
    },
    onError: (error) => {
      const { code, message, fieldErrors } = parseApiError(error, 'Failed to update password.')

      // 400 { new_password: [...] } lands on its own field; wrong_old_password
      // arrives as an application error, so map it onto the old-password input.
      const fields = toFormFields(fieldErrors)
      if (code === ERROR_CODES.WRONG_OLD_PASSWORD) {
        fields.push({ name: 'old_password', errors: [message] })
      }

      if (fields.length) form.setFields(fields)
      else notifyError('Update Failed', message)
    },
  })

  // If a fully-authenticated user lands here without `must_change_password`, bounce.
  // Kept below the hooks so hook order stays stable across renders.
  if (user && !user.must_change_password && isChange) {
    return <Navigate to="/admin/dashboard" replace />
  }

  const validateNewPassword = ({ getFieldValue }) => ({
    validator(_, value) {
      if (!value) return Promise.resolve() // the `required` rule covers empty
      const failed = PASSWORD_POLICY.find((rule) => !rule.test(value))
      if (failed) return Promise.reject(new Error(failed.message))
      if (isChange && value === getFieldValue('old_password')) {
        return Promise.reject(new Error('New password must be different from the old one.'))
      }
      return Promise.resolve()
    },
  })

  const validateConfirmPassword = ({ getFieldValue }) => ({
    validator(_, value) {
      if (!value || value === getFieldValue('new_password')) return Promise.resolve()
      return Promise.reject(new Error('Passwords do not match.'))
    },
  })

  const handleSubmit = (values) => {
    doChangePassword({
      old_password: values.old_password,
      new_password: values.new_password,
    })
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
              : 'Password recovery for YantraTech administrators is handled by your platform administrator.'}
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
          <h2 className="text-[28px] font-bold text-[#1c1b1f] mb-1.5">
            {isChange ? 'Change Password' : 'Forgot Password'}
          </h2>
          <p className="text-[#6b6b75] text-sm mb-8">
            {isChange
              ? 'Please enter your details to update your account security.'
              : 'Self-service reset is not available for this portal.'}
          </p>

          {isChange ? (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
            >
              {/* Old Password */}
              <Form.Item
                label={<span className="text-xs font-semibold text-[#1c1b1f]">Current Password</span>}
                name="old_password"
                rules={[{ required: true, message: 'Current password is required' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-[#6b6b75]" />}
                  placeholder="Enter current password"
                  size="large"
                  style={{ borderRadius: 10, backgroundColor: '#f7f7fb' }}
                />
              </Form.Item>

              {/* New Password */}
              <Form.Item
                label={<span className="text-xs font-semibold text-[#1c1b1f]">New Password</span>}
                name="new_password"
                dependencies={['old_password']}
                rules={[
                  { required: true, message: 'New password is required' },
                  validateNewPassword,
                ]}
                extra={
                  <span className="text-[11px] text-[#6b6b75]">
                    At least 8 characters, with one letter and one digit.
                  </span>
                }
              >
                <Input.Password
                  prefix={<HistoryOutlined className="text-[#6b6b75]" />}
                  placeholder="Enter new password"
                  size="large"
                  style={{ borderRadius: 10, backgroundColor: '#f7f7fb' }}
                />
              </Form.Item>

              {/* Confirm New Password */}
              <Form.Item
                label={<span className="text-xs font-semibold text-[#1c1b1f]">Confirm New Password</span>}
                name="confirm_password"
                dependencies={['new_password']}
                rules={[
                  { required: true, message: 'Please confirm your new password' },
                  validateConfirmPassword,
                ]}
              >
                <Input.Password
                  prefix={<SafetyOutlined className="text-[#6b6b75]" />}
                  placeholder="Re-enter new password"
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
                  {isPending ? 'Updating…' : 'Update Password →'}
                </Button>
              </Form.Item>
            </Form>
          ) : (
            <Alert
              type="info"
              showIcon
              title="Contact your administrator"
              description="The portal does not expose a self-service password reset. Ask your platform administrator to issue a temporary password — you will be prompted to change it at your next sign-in."
              style={{ borderRadius: 10 }}
            />
          )}

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

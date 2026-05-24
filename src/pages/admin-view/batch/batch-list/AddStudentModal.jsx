import { Form, Input, Select, Modal, Button } from 'antd'
import { UserOutlined, PhoneOutlined, MailOutlined, HomeOutlined } from '@ant-design/icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createStudent } from '@/services/BatchApiService'
import { notifySuccess, notifyError } from '@/utilities/notification'

const AddStudentModal = ({ open, onClose, batches = [] }) => {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: ({ name, phone, email, address, batch_id }) =>
      createStudent({
        name: name.trim(),
        phone: phone,
        email: email?.trim() || undefined,
        address: address?.trim() || undefined,
        batch_id,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['students', data.batch_id] })
      notifySuccess('Student Added', `${data.name} has been enrolled successfully.`)
      form.resetFields()
      onClose()
    },
    onError: (error) => {
      const errCode = error?.response?.data?.error
      const fieldErrors = error?.response?.data

      if (errCode === 'invalid_batch') {
        notifyError('Invalid Batch', 'Selected batch is not valid. Please refresh and try again.')
      } else if (fieldErrors?.phone) {
        notifyError('Phone Taken', 'This phone number is already registered.')
      } else {
        const message = error?.response?.data?.detail || 'Failed to add student.'
        notifyError('Failed', message)
      }
    },
  })

  const handleClose = () => {
    form.resetFields()
    onClose()
  }

  const batchOptions = batches.map((b) => ({
    value: b.id,
    label: b.section ? `${b.name} — ${b.section}` : b.name,
  }))

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <span className="text-[16px] font-semibold text-[#1c1b1f]">Add New Student</span>
      }
      footer={null}
      width={480}
      destroyOnHide
    >
      <p className="text-[#6b6b75] text-sm mb-6 mt-1">
        Student will be enrolled with a temporary password <strong>Welcome@123</strong> and prompted to change it on first login.
      </p>

      <Form form={form} layout="vertical" onFinish={mutate} requiredMark={false}>
        <Form.Item
          label={<span className="text-xs font-semibold text-[#1c1b1f]">Full Name</span>}
          name="name"
          rules={[{ required: true, message: 'Student name is required' }]}
        >
          <Input
            prefix={<UserOutlined className="text-[#6b6b75]" />}
            placeholder="e.g. Priya Patil"
            size="large"
            style={{ borderRadius: 8, backgroundColor: '#f7f7fb' }}
          />
        </Form.Item>

        <Form.Item
          label={<span className="text-xs font-semibold text-[#1c1b1f]">Phone Number</span>}
          name="phone"
          rules={[
            { required: true, message: 'Phone number is required' },
            { pattern: /^\d{10}$/, message: 'Enter a valid 10-digit number' },
          ]}
        >
          <Input
            prefix={
              <span className="flex items-center gap-1.5">
                <PhoneOutlined className="text-[#6b6b75]" />
                <span className="text-[#6b6b75] text-sm border-r border-[#e3e1e6] pr-2">+91</span>
              </span>
            }
            placeholder="9999900001"
            maxLength={10}
            size="large"
            style={{ borderRadius: 8, backgroundColor: '#f7f7fb' }}
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-xs font-semibold text-[#1c1b1f]">
              Email <span className="text-[#6b6b75] font-normal">(optional)</span>
            </span>
          }
          name="email"
          rules={[{ type: 'email', message: 'Enter a valid email address' }]}
        >
          <Input
            prefix={<MailOutlined className="text-[#6b6b75]" />}
            placeholder="priya@example.com"
            size="large"
            style={{ borderRadius: 8, backgroundColor: '#f7f7fb' }}
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-xs font-semibold text-[#1c1b1f]">
              Address <span className="text-[#6b6b75] font-normal">(optional)</span>
            </span>
          }
          name="address"
        >
          <Input
            prefix={<HomeOutlined className="text-[#6b6b75]" />}
            placeholder="123 Main St, Pune"
            size="large"
            style={{ borderRadius: 8, backgroundColor: '#f7f7fb' }}
          />
        </Form.Item>

        <Form.Item
          label={<span className="text-xs font-semibold text-[#1c1b1f]">Assign Batch</span>}
          name="batch_id"
          rules={[{ required: true, message: 'Please select a batch' }]}
        >
          <Select
            placeholder="Select a batch"
            size="large"
            options={batchOptions}
            style={{ borderRadius: 8 }}
            notFoundContent={
              <span className="text-[#6b6b75] text-sm">No batches found. Create a batch first.</span>
            }
          />
        </Form.Item>

        <div className="flex gap-3 mt-6">
          <Button
            size="large"
            block
            onClick={handleClose}
            style={{ borderRadius: 8, borderColor: '#e3e1e6', color: '#1c1b1f', height: 44 }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={isPending}
            style={{
              background: 'linear-gradient(90deg, #ba558f 0%, #8f3f6d 100%)',
              border: 'none',
              borderRadius: 8,
              height: 44,
              fontWeight: 600,
            }}
          >
            {isPending ? 'Enrolling…' : 'Enroll Student'}
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export default AddStudentModal

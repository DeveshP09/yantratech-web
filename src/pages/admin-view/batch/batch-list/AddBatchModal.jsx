import { Form, Input, Modal, Button } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createBatch } from '@/services/BatchApiService'
import { notifySuccess, notifyError } from '@/utilities/notification'

const AddBatchModal = ({ open, onClose }) => {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: ({ name, section }) =>
      createBatch({ name: name.trim(), section: section?.trim() ?? '' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] })
      notifySuccess('Batch Created', 'New batch has been added successfully.')
      form.resetFields()
      onClose()
    },
    onError: (error) => {
      const errCode = error?.response?.data?.error
      if (errCode === 'batch_exists') {
        notifyError('Already Exists', 'A batch with this name and section already exists.')
      } else {
        const message = error?.response?.data?.detail || 'Failed to create batch.'
        notifyError('Creation Failed', message)
      }
    },
  })

  const handleClose = () => {
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <span className="text-[16px] font-semibold text-[#1c1b1f]">Add New Batch</span>
      }
      footer={null}
      width={440}
      destroyOnHide
    >
      <p className="text-[#6b6b75] text-sm mb-6 mt-1">
        Create a new batch under your institute. Section is optional.
      </p>

      <Form form={form} layout="vertical" onFinish={mutate} requiredMark={false}>
        <Form.Item
          label={<span className="text-xs font-semibold text-[#1c1b1f]">Batch Name</span>}
          name="name"
          rules={[{ required: true, message: 'Batch name is required' }]}
        >
          <Input
            placeholder='e.g. Class 10, JEE Main Batch 1, XII'
            size="large"
            style={{ borderRadius: 8, backgroundColor: '#f7f7fb' }}
          />
        </Form.Item>

        <Form.Item
          label={<span className="text-xs font-semibold text-[#1c1b1f]">Section <span className="text-[#6b6b75] font-normal">(optional)</span></span>}
          name="section"
        >
          <Input
            placeholder='e.g. A, B, C'
            size="large"
            style={{ borderRadius: 8, backgroundColor: '#f7f7fb' }}
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
            {isPending ? 'Creating…' : 'Create Batch'}
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export default AddBatchModal

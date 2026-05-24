import { Button, Table, Tag, Avatar } from 'antd'
import { ArrowLeftOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { getStudentsByBatch } from '@/services/BatchApiService'


const BatchStudentList = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  // Batch info from navigation state — avoids an extra fetch
  const batch = location.state?.batch

  const { data: students, isLoading } = useQuery({
    queryKey: ['students', Number(id)],
    queryFn: () => getStudentsByBatch(id),
    staleTime: 5 * 60 * 1000,
  })

  const batchLabel = batch
    ? batch.section
      ? `${batch.name} — ${batch.section}`
      : batch.name
    : `Batch #${id}`

  const columns = [
  {
    title: '#',
    key: 'index',
    width: 52,
    render: (_, __, i) => (
      <span className="text-[13px] text-[#6b6b75] font-medium">{i + 1}</span>
    ),
  },
  {
    title: 'Student',
    key: 'name',
    render: (_, record) => (
      <div className="flex items-center gap-3">
        <Avatar
          size={34}
          icon={<UserOutlined />}
          style={{ backgroundColor: '#ba558f', flexShrink: 0 }}
        />
        <div className="leading-tight">
          <div className="text-[13px] font-semibold text-[#1c1b1f]">{record.name}</div>
          <div className="text-[11px] text-[#6b6b75]">{record.email || '—'}</div>
        </div>
      </div>
    ),
  },
  {
    title: 'Phone',
    dataIndex: 'phone',
    key: 'phone',
    render: (phone) => (
      <span className="text-[13px] text-[#1c1b1f] font-mono tracking-wide">{phone}</span>
    ),
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    render: (address) => (
      <span className="text-[13px] text-[#6b6b75]">{address || '—'}</span>
    ),
  },
  {
    title: 'Batch',
    dataIndex: 'batch_name',
    key: 'batch_name',
    render: (name) => (
      <Tag
        style={{
          background: '#f0e6ec',
          color: '#8f3f6d',
          border: 'none',
          borderRadius: 6,
          fontWeight: 500,
          fontSize: 12,
        }}
      >
        {name}
      </Tag>
    ),
  },
]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/admin/batch/list')}
            style={{ color: '#6b6b75', padding: '0 8px' }}
          />
          <div>
            <h2 className="text-[20px] font-bold text-[#1c1b1f] mb-0.5">{batchLabel}</h2>
            <div className="flex items-center gap-1.5">
              <TeamOutlined style={{ fontSize: 12, color: '#6b6b75' }} />
              <span className="text-[13px] text-[#6b6b75]">
                {isLoading ? 'Loading…' : `${students?.length ?? 0} ${students?.length === 1 ? 'student' : 'students'}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e3e1e6] overflow-hidden">
        <Table
          rowKey="id"
          dataSource={students ?? []}
          columns={columns}
          loading={isLoading}
          pagination={
            students?.length > 10
              ? { pageSize: 10, showSizeChanger: false, style: { padding: '12px 16px' } }
              : false
          }
          locale={{
            emptyText: (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#f0e6ec] flex items-center justify-center mx-auto mb-3">
                  <UserOutlined style={{ fontSize: 20, color: '#ba558f' }} />
                </div>
                <p className="text-[14px] font-medium text-[#1c1b1f] mb-1">No students yet</p>
                <p className="text-[12px] text-[#6b6b75]">Add students to this batch from the Batch list page.</p>
              </div>
            ),
          }}
          style={{ fontSize: 13 }}
        />
      </div>
    </div>
  )
}

export default BatchStudentList

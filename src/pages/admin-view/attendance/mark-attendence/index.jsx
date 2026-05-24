import { useState, useEffect, useMemo } from 'react'
import { Select, DatePicker, Button, Table, Avatar } from 'antd'
import { UserOutlined, SaveOutlined } from '@ant-design/icons'
import { useQuery, useMutation } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { getBatches } from '@/services/BatchApiService'
import { getAttendance, markAttendance } from '@/services/AttendanceApiService'
import { notifySuccess, notifyError } from '@/utilities/notification'

const MarkAttendance = () => {
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [localAttendance, setLocalAttendance] = useState({})

  const { data: batches } = useQuery({
    queryKey: ['batches'],
    queryFn: getBatches,
  })

  // Default to first batch once batches load
  useEffect(() => {
    if (batches?.length > 0 && !selectedBatch) {
      setSelectedBatch(batches[0].id)
    }
  }, [batches, selectedBatch])

  const dateStr = selectedDate?.format('YYYY-MM-DD')

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['attendance', selectedBatch, dateStr],
    queryFn: () => getAttendance(selectedBatch, dateStr),
    enabled: !!selectedBatch,
    staleTime: 2 * 60 * 1000,
  })

  // Sync local state on filter change OR when data arrives for the current key
  useEffect(() => {
    if (attendanceData?.students) {
      const map = {}
      attendanceData.students.forEach((s) => {
        map[s.student_id] = s.is_present
      })
      setLocalAttendance(map)
    } else {
      setLocalAttendance({})
    }
  }, [selectedBatch, dateStr, attendanceData])

  const students = attendanceData?.students ?? []

  const presentCount = useMemo(
    () => Object.values(localAttendance).filter(Boolean).length,
    [localAttendance]
  )
  const absentCount = students.length - presentCount

  const toggle = (studentId, isPresent) =>
    setLocalAttendance((prev) => ({ ...prev, [studentId]: isPresent }))

  const markAll = (isPresent) => {
    const map = {}
    students.forEach((s) => { map[s.student_id] = isPresent })
    setLocalAttendance(map)
  }

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: () =>
      markAttendance({
        batch_id: selectedBatch,
        date: dateStr,
        records: students.map((s) => ({
          student_id: s.student_id,
          is_present: localAttendance[s.student_id] ?? false,
        })),
      }),
    onSuccess: () => {
      notifySuccess('Attendance Saved', `Attendance for ${dateStr} has been recorded.`)
    },
    onError: (error) => {
      const message = error?.response?.data?.detail || 'Failed to save attendance.'
      notifyError('Save Failed', message)
    },
  })

  const batchOptions = (batches ?? []).map((b) => ({
    value: b.id,
    label: b.section ? `${b.name} — ${b.section}` : b.name,
  }))

  const columns = [
    {
      title: 'Roll',
      dataIndex: 'roll_number',
      key: 'roll_number',
      width: 64,
      render: (roll) => (
        <span className="text-[13px] text-[#6b6b75] font-medium">{roll}</span>
      ),
    },
    {
      title: 'Student',
      key: 'student',
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
      title: 'Attendance',
      key: 'attendance',
      width: 200,
      render: (_, record) => {
        const isPresent = localAttendance[record.student_id] ?? false
        return (
          <div className="flex gap-2">
            <button
              onClick={() => toggle(record.student_id, true)}
              className={`px-3 py-1 rounded-lg text-[12px] font-semibold border transition-all duration-150 ${
                isPresent
                  ? 'bg-[#e8f5e9] text-[#2e7d32] border-[#a5d6a7]'
                  : 'bg-white text-[#6b6b75] border-[#e3e1e6] hover:border-[#a5d6a7] hover:text-[#2e7d32]'
              }`}
            >
              ✓ Present
            </button>
            <button
              onClick={() => toggle(record.student_id, false)}
              className={`px-3 py-1 rounded-lg text-[12px] font-semibold border transition-all duration-150 ${
                !isPresent
                  ? 'bg-[#ffebee] text-[#c62828] border-[#ef9a9a]'
                  : 'bg-white text-[#6b6b75] border-[#e3e1e6] hover:border-[#ef9a9a] hover:text-[#c62828]'
              }`}
            >
              ✗ Absent
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-[20px] font-bold text-[#1c1b1f] mb-0.5">Mark Attendance</h2>
          <p className="text-[13px] text-[#6b6b75]">Select a batch and date, then mark each student.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Select
            value={selectedBatch}
            onChange={(val) => setSelectedBatch(val)}
            options={batchOptions}
            placeholder="Select batch"
            // size="large"
            style={{ width: 190 }}
            loading={!batches}
          />
          <DatePicker
            value={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            // size="large"
            format="DD MMM YYYY"
            allowClear={false}
            disabledDate={(d) => d && d.isAfter(dayjs(), 'day')}
          />
        </div>
      </div>

      {/* Summary + bulk actions bar */}
      {students.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-[#e3e1e6] px-5 py-3 mb-4">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#4caf50]" />
              <span className="text-[13px] font-semibold text-[#1c1b1f]">{presentCount} Present</span>
            </div>
            <div className="w-px h-4 bg-[#e3e1e6]" />
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#f44336]" />
              <span className="text-[13px] font-semibold text-[#1c1b1f]">{absentCount} Absent</span>
            </div>
            <div className="w-px h-4 bg-[#e3e1e6]" />
            <span className="text-[12px] text-[#6b6b75]">{students.length} total</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => markAll(true)}
              className="text-[12px] font-semibold text-[#2e7d32] bg-[#e8f5e9] border border-[#a5d6a7] px-3 py-1.5 rounded-lg hover:bg-[#c8e6c9] transition-colors"
            >
              Mark All Present
            </button>
            <button
              onClick={() => markAll(false)}
              className="text-[12px] font-semibold text-[#c62828] bg-[#ffebee] border border-[#ef9a9a] px-3 py-1.5 rounded-lg hover:bg-[#ffcdd2] transition-colors"
            >
              Mark All Absent
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e3e1e6] overflow-hidden">
        <Table
          rowKey="student_id"
          dataSource={students}
          columns={columns}
          loading={isLoading}
          pagination={students.length > 15 ? { pageSize: 15, showSizeChanger: false, style: { padding: '12px 16px' } } : false}
          locale={{
            emptyText: (
              <div className="py-14 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#f0e6ec] flex items-center justify-center mx-auto mb-3">
                  <UserOutlined style={{ fontSize: 20, color: '#ba558f' }} />
                </div>
                <p className="text-[14px] font-medium text-[#1c1b1f] mb-1">
                  {selectedBatch ? 'No students in this batch' : 'Select a batch to begin'}
                </p>
                <p className="text-[12px] text-[#6b6b75]">
                  {selectedBatch ? 'Add students from the Batch page first.' : 'Choose a batch from the filter above.'}
                </p>
              </div>
            ),
          }}
          style={{ fontSize: 13 }}
        />

        {/* Save footer */}
        {students.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#e3e1e6]">
            <span className="text-[12px] text-[#6b6b75]">
              Changes are not auto-saved — click Save when done.
            </span>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="large"
              loading={isSaving}
              onClick={() => save()}
              style={{
                background: 'linear-gradient(90deg, #ba558f 0%, #8f3f6d 100%)',
                border: 'none',
                borderRadius: 10,
                height: 40,
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              {isSaving ? 'Saving…' : 'Save Attendance'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MarkAttendance

import { useState, useMemo } from 'react'
import { Button, Skeleton, Empty } from 'antd'
import { PlusOutlined, TeamOutlined, UserAddOutlined, BookOutlined } from '@ant-design/icons'
import { useQuery, useQueries } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getBatches, getStudentsByBatch } from '@/services/BatchApiService'
import AddBatchModal from './AddBatchModal'
import AddStudentModal from './AddStudentModal'

const CARD_COLORS = [
  { bg: 'linear-gradient(135deg, #ba558f 0%, #8f3f6d 100%)', light: '#f0e6ec' },
  { bg: 'linear-gradient(135deg, #4a5b7a 0%, #334266 100%)', light: '#e8ebf0' },
  { bg: 'linear-gradient(135deg, #7c5cbf 0%, #5a3d9e 100%)', light: '#ede8f7' },
  { bg: 'linear-gradient(135deg, #2e8b6e 0%, #1f6b52 100%)', light: '#e0f2ec' },
  { bg: 'linear-gradient(135deg, #c0703a 0%, #9e4f22 100%)', light: '#f7ece4' },
  { bg: 'linear-gradient(135deg, #4a8fc0 0%, #2d6e9e 100%)', light: '#e4eff7' },
]

const BatchCard = ({ batch, studentCount, colorIndex }) => {
  const navigate = useNavigate()
  const color = CARD_COLORS[colorIndex % CARD_COLORS.length]
  const displayName = batch.section ? `${batch.name} — ${batch.section}` : batch.name

  return (
    <div
      onClick={() => navigate(`/admin/batch/${batch.id}`, { state: { batch } })}
      className="rounded-2xl overflow-hidden border border-[#e3e1e6] bg-white shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group"
    >
      {/* Colored top strip with icon */}
      <div
        className="h-24 flex items-center justify-center relative"
        style={{ background: color.bg }}
      >
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
          <BookOutlined style={{ fontSize: 22, color: '#fff' }} />
        </div>
        {batch.section && (
          <div className="absolute top-3 right-3 bg-white/25 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full tracking-wide">
            {batch.section}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3
          className="text-[15px] font-bold text-[#1c1b1f] leading-snug mb-1 truncate group-hover:text-[#ba558f] transition-colors"
          title={displayName}
        >
          {displayName}
        </h3>

        <div className="flex items-center gap-1.5 mt-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: color.light }}
          >
            <TeamOutlined style={{ fontSize: 13, color: '#ba558f' }} />
          </div>
          <span className="text-[13px] text-[#6b6b75]">
            {studentCount === null ? (
              <span className="inline-block w-16 h-3 bg-[#e3e1e6] rounded animate-pulse" />
            ) : (
              <><strong className="text-[#1c1b1f]">{studentCount}</strong> {studentCount === 1 ? 'student' : 'students'}</>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

const BatchList = () => {
  const [batchModal, setBatchModal] = useState(false)
  const [studentModal, setStudentModal] = useState(false)

  const { data: batches, isLoading, isError } = useQuery({
    queryKey: ['batches'],
    queryFn: getBatches,
  })

  // Parallel student-count queries for each batch
  const studentQueries = useQueries({
    queries: (batches ?? []).map((b) => ({
      queryKey: ['students', b.id],
      queryFn: () => getStudentsByBatch(b.id),
      staleTime: 5 * 60 * 1000,
    })),
  })

  const studentCountMap = useMemo(() => {
    if (!batches) return {}
    return batches.reduce((acc, b, i) => {
      const q = studentQueries[i]
      acc[b.id] = q?.data ? q.data.length : null
      return acc
    }, {})
  }, [batches, studentQueries])

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[20px] font-bold text-[#1c1b1f] mb-0.5">Batches</h2>
          <p className="text-[13px] text-[#6b6b75]">
            {batches ? `${batches.length} ${batches.length === 1 ? 'batch' : 'batches'} in your institute` : 'Manage your institute batches'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            icon={<UserAddOutlined />}
            size="large"
            onClick={() => setStudentModal(true)}
            style={{
              borderColor: '#ba558f',
              color: '#ba558f',
              borderRadius: 10,
              height: 40,
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            Add Student
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setBatchModal(true)}
            style={{
              background: 'linear-gradient(90deg, #ba558f 0%, #8f3f6d 100%)',
              border: 'none',
              borderRadius: 10,
              height: 40,
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            Add Batch
          </Button>
        </div>
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[#e3e1e6] overflow-hidden bg-white">
              <Skeleton.Input active block style={{ height: 96, borderRadius: 0 }} />
              <div className="p-4 space-y-2">
                <Skeleton.Input active style={{ width: '70%', height: 18 }} />
                <Skeleton.Input active style={{ width: '45%', height: 14 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="flex items-center justify-center py-24">
          <Empty
            description={
              <span className="text-[#6b6b75] text-sm">Failed to load batches. Please try again.</span>
            }
          />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && batches?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#f0e6ec] flex items-center justify-center">
            <BookOutlined style={{ fontSize: 28, color: '#ba558f' }} />
          </div>
          <div className="text-center">
            <p className="text-[15px] font-semibold text-[#1c1b1f] mb-1">No batches yet</p>
            <p className="text-[13px] text-[#6b6b75]">Create your first batch to get started.</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setBatchModal(true)}
            style={{
              background: 'linear-gradient(90deg, #ba558f 0%, #8f3f6d 100%)',
              border: 'none',
              borderRadius: 10,
              height: 40,
              fontWeight: 500,
            }}
          >
            Add Batch
          </Button>
        </div>
      )}

      {/* Batch grid */}
      {!isLoading && !isError && batches?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {batches.map((batch, i) => (
            <BatchCard
              key={batch.id}
              batch={batch}
              studentCount={studentCountMap[batch.id] ?? null}
              colorIndex={i}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AddBatchModal
        open={batchModal}
        onClose={() => setBatchModal(false)}
      />
      <AddStudentModal
        open={studentModal}
        onClose={() => setStudentModal(false)}
        batches={batches ?? []}
      />
    </div>
  )
}

export default BatchList

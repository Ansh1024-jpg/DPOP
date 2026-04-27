import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { useAuthStore } from '../../store/authStore'
import { listApplications } from '../../services/api'
import type { ApplicationStatusType, RiskLevelType } from '../../types/index'
import ManagementSidebar from '../../components/ManagementSidebar'
import StatusBadge from '../../components/StatusBadge'

const STATUS_FILTERS: { label: string; value: ApplicationStatusType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending Review', value: 'pending_review' },
  { label: 'Flagged', value: 'flagged' },
  { label: 'Corrections Made', value: 'corrections_made' },
]

function RiskPill({ risk }: { risk: RiskLevelType | null }) {
  if (!risk) return <span className="text-grey-400 text-sm">—</span>
  const cls =
    risk === 'high'
      ? 'bg-red-100 text-red-700'
      : risk === 'medium'
        ? 'bg-orange-100 text-orange-700'
        : 'bg-green-100 text-green-700'
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${cls}`}>
      {risk}
    </span>
  )
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function PolicyManagerDashboard() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const [statusFilter, setStatusFilter] = useState<ApplicationStatusType | 'all'>('all')
  const [search, setSearch] = useState('')

  const { data: allApps = [], isLoading } = useQuery({
    queryKey: ['applications', user?.user_id],
    queryFn: () => listApplications(user!.user_id),
    enabled: !!user,
  })

  const filteredByStatus =
    statusFilter === 'all' ? allApps : allApps.filter((a) => a.status === statusFilter)

  const filtered = filteredByStatus.filter(
    (a) => !search || a.applicant_name.toLowerCase().includes(search.toLowerCase()),
  )

  const counts = {
    all: allApps.length,
    pending_review: allApps.filter((a) => a.status === 'pending_review').length,
    flagged: allApps.filter((a) => a.status === 'flagged').length,
    corrections_made: allApps.filter((a) => a.status === 'corrections_made').length,
  }

  const metricCards = [
    {
      label: 'Total Applications',
      value: counts.all,
      icon: 'description',
      accent: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Pending Review',
      value: counts.pending_review,
      icon: 'pending',
      accent: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Flagged',
      value: counts.flagged,
      icon: 'flag',
      accent: 'text-warning-text',
      bg: 'bg-warning-bg',
    },
    {
      label: 'Corrections Made',
      value: counts.corrections_made,
      icon: 'edit',
      accent: 'text-info-text',
      bg: 'bg-info-bg',
    },
  ]

  return (
    <div className="min-h-screen bg-grey-50">
      <ManagementSidebar activeItem="applications" />

      <div className="ml-[240px] min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-2xl">
          {/* Page header */}
          <div className="mb-2xl">
            <p className="font-label-overline text-label-overline text-grey-400 uppercase tracking-widest mb-xs">
              Policy Manager
            </p>
            <h1 className="font-display-title text-display-title text-grey-900">
              Applications Queue
            </h1>
            <p className="font-body-regular text-grey-600 mt-xs">
              Review and process submitted applications for policy issuance.
            </p>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-xl mb-2xl">
            {metricCards.map((card) => (
              <div
                key={card.label}
                className="bg-white border border-grey-200 rounded-xl p-lg shadow-card"
              >
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-md`}>
                  <span className={`material-symbols-outlined text-[20px] ${card.accent}`}>
                    {card.icon}
                  </span>
                </div>
                <p className="text-2xl font-bold text-grey-900">{card.value}</p>
                <p className="font-body-small text-grey-500 mt-xs">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Filter + search bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-md mb-lg">
            <div className="flex items-center gap-sm flex-wrap">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-md py-1.5 rounded-full text-sm font-medium transition-all ${
                    statusFilter === f.value
                      ? 'bg-primary text-white'
                      : 'bg-white border border-grey-200 text-grey-600 hover:bg-grey-50'
                  }`}
                >
                  {f.label}
                  {f.value !== 'all' && (
                    <span
                      className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                        statusFilter === f.value
                          ? 'bg-white/20 text-white'
                          : 'bg-grey-100 text-grey-500'
                      }`}
                    >
                      {counts[f.value as keyof typeof counts]}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-grey-400">
                search
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search applicant…"
                className="pl-9 pr-md h-9 w-56 border border-grey-200 rounded-lg font-body-small text-grey-700 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-white"
              />
            </div>
          </div>

          {/* Applications table */}
          <div className="bg-white border border-grey-200 rounded-xl shadow-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-grey-50 border-b border-grey-200">
                <tr>
                  {['#', 'Applicant Name', 'Submitted', 'Status', 'Risk Level', 'Action'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-lg py-md text-left font-body-small font-semibold text-grey-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-grey-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-lg py-2xl text-center">
                      <span className="material-symbols-outlined text-[32px] text-grey-300 animate-spin">
                        progress_activity
                      </span>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-lg py-2xl text-center">
                      <span className="material-symbols-outlined text-[40px] text-grey-300 block mb-sm">
                        inbox
                      </span>
                      <p className="font-body-small text-grey-400">No applications found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-grey-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/policy-manager/application/${app.id}`)}
                    >
                      <td className="px-lg py-md">
                        <span className="font-body-small font-semibold text-grey-500">
                          #{app.id}
                        </span>
                      </td>
                      <td className="px-lg py-md">
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                            {app.applicant_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <span className="font-body-small font-semibold text-grey-900">
                            {app.applicant_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-lg py-md">
                        <span className="font-body-small text-grey-500">
                          {formatDate(app.submitted_at)}
                        </span>
                      </td>
                      <td className="px-lg py-md">
                        <StatusBadge status={app.status} size="sm" />
                      </td>
                      <td className="px-lg py-md">
                        <RiskPill risk={app.risk_level} />
                      </td>
                      <td className="px-lg py-md">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/policy-manager/application/${app.id}`)
                          }}
                          className="px-md h-8 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-container transition-all flex items-center gap-1"
                        >
                          Review
                          <span className="material-symbols-outlined text-[16px]">
                            chevron_right
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {!isLoading && filtered.length > 0 && (
              <div className="px-lg py-md border-t border-grey-100 flex items-center justify-between">
                <p className="font-body-small text-grey-500">
                  Showing {filtered.length} of {allApps.length} application
                  {allApps.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

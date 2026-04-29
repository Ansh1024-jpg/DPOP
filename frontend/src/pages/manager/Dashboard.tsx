import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { useAuthStore } from '../../store/authStore'
import { listApplications, logout as logoutApi } from '../../services/api'
import type { RiskLevelType } from '../../types/index'
import ManagementSidebar from '../../components/ManagementSidebar'
import StatusBadge from '../../components/StatusBadge'

const RISK_SCORE: Record<RiskLevelType, number> = { high: 87, medium: 62, low: 38 }

function RiskScore({ risk }: { risk: RiskLevelType | null }) {
  if (!risk) return <span className="text-grey-400 text-sm">—</span>
  const score = RISK_SCORE[risk]
  const dotCls =
    risk === 'high' ? 'bg-red-500' : risk === 'medium' ? 'bg-orange-400' : 'bg-green-500'
  const textCls =
    risk === 'high' ? 'text-red-600' : risk === 'medium' ? 'text-orange-600' : 'text-green-600'
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotCls}`} />
      <span className={`font-semibold text-sm ${textCls}`}>{score}</span>
      <span className="text-grey-400 text-sm">/100</span>
    </div>
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

export default function ManagerDashboard() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logoutStore = useAuthStore((s) => s.logout)

  const [search, setSearch] = useState('')

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ['applications', user?.user_id, 'escalated'],
    queryFn: () => listApplications(user!.user_id),
    enabled: !!user,
  })

  const { data: approvedApps = [], isLoading: isLoadingApproved } = useQuery({
    queryKey: ['applications', user?.user_id, 'approved'],
    queryFn: () => listApplications(user!.user_id, 'approved'),
    enabled: !!user,
  })

  const filtered = apps.filter(
    (a) => !search || a.applicant_name.toLowerCase().includes(search.toLowerCase()),
  )

  const filteredApproved = approvedApps.filter(
    (a) => !search || a.applicant_name.toLowerCase().includes(search.toLowerCase()),
  )

  const riskCounts = {
    high: apps.filter((a) => a.risk_level === 'high').length,
    medium: apps.filter((a) => a.risk_level === 'medium').length,
    low: apps.filter((a) => a.risk_level === 'low').length,
  }

  const statCards = [
    {
      label: 'Total Escalated',
      value: apps.length,
      icon: 'trending_up',
      bg: 'bg-escalated-bg',
      accent: 'text-escalated-text',
      border: 'border-escalated-border',
    },
    {
      label: 'High Risk',
      value: riskCounts.high,
      icon: 'crisis_alert',
      bg: 'bg-red-50',
      accent: 'text-red-600',
      border: 'border-red-200',
    },
    {
      label: 'Medium Risk',
      value: riskCounts.medium,
      icon: 'warning',
      bg: 'bg-orange-50',
      accent: 'text-orange-600',
      border: 'border-orange-200',
    },
    {
      label: 'Approved',
      value: approvedApps.length,
      icon: 'verified',
      bg: 'bg-success-bg',
      accent: 'text-success-text',
      border: 'border-success-border',
    },
  ]

  async function handleLogout() {
    await logoutApi().catch(() => {})
    logoutStore()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-grey-50">
      {/* Fixed top bar */}
      <header className="fixed top-0 left-0 w-full h-16 bg-[#1E3A5F] text-white flex items-center justify-between px-6 z-50 shadow-sm border-b border-white/10">
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold">Management Portal</span>
          {apps.length > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 border border-red-400/30 rounded-full text-red-300 text-xs font-semibold">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
              Priority Queue
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-full hover:bg-white/10 transition-all relative"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {apps.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                {apps.length > 9 ? '9+' : apps.length}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2 pl-3 border-l border-white/20">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold select-none">
              {user?.full_name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <span className="text-sm text-slate-300 hidden sm:block">{user?.full_name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-white/10 transition-all"
            aria-label="Logout"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </header>

      <ManagementSidebar activeItem="applications" hasTopBar />

      <div className="ml-[240px] pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-2xl">
          {/* Page header */}
          <div className="mb-2xl">
            <p className="font-label-overline text-label-overline text-grey-400 uppercase tracking-widest mb-xs">
              Senior Management
            </p>
            <h1 className="font-display-title text-display-title text-grey-900">
              Escalated Applications
            </h1>
            <p className="font-body-regular text-grey-600 mt-xs">
              Applications requiring final management decision.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-xl mb-2xl">
            {statCards.map((card) => (
              <div
                key={card.label}
                className={`bg-white border ${card.border} rounded-xl p-lg shadow-card`}
              >
                <div
                  className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-md`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${card.accent}`}>
                    {card.icon}
                  </span>
                </div>
                <p className="text-2xl font-bold text-grey-900">{card.value}</p>
                <p className="font-body-small text-grey-500 mt-xs">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center justify-between mb-lg">
            <h2 className="font-card-heading text-card-heading text-grey-900">
              Queue ({filtered.length})
            </h2>
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

          {/* Table */}
          <div className="bg-white border border-grey-200 rounded-xl shadow-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-grey-50 border-b border-grey-200">
                <tr>
                  {[
                    'Application',
                    'Applicant',
                    'Risk Score',
                    'Status',
                    'Submitted',
                    '',
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="px-lg py-md text-left font-body-small font-semibold text-grey-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
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
                      <p className="font-body-small text-grey-400">
                        {apps.length === 0
                          ? 'No escalated applications at this time.'
                          : 'No results match your search.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-grey-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/manager/application/${app.id}`)}
                    >
                      <td className="px-lg py-md">
                        <span className="font-body-small font-semibold text-grey-500">
                          #{app.id}
                        </span>
                      </td>
                      <td className="px-lg py-md">
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 rounded-full bg-escalated-bg border border-escalated-border flex items-center justify-center text-escalated-text text-xs font-bold flex-shrink-0">
                            {app.applicant_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="font-body-small font-semibold text-grey-900">
                              {app.applicant_name}
                            </p>
                            <p className="text-xs text-grey-400">Insurance Applicant</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-lg py-md">
                        <RiskScore risk={app.risk_level} />
                      </td>
                      <td className="px-lg py-md">
                        <StatusBadge status={app.status} size="sm" />
                      </td>
                      <td className="px-lg py-md">
                        <span className="font-body-small text-grey-500">
                          {formatDate(app.submitted_at)}
                        </span>
                      </td>
                      <td className="px-lg py-md">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/manager/application/${app.id}`)
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-grey-200 hover:bg-grey-50 transition-all"
                          aria-label={`Review application ${app.id}`}
                        >
                          <span className="material-symbols-outlined text-[18px] text-grey-500">
                            chevron_right
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Approved applications section */}
          <div className="mt-3xl">
            <div className="flex items-center gap-sm mb-lg">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <h2 className="font-card-heading text-card-heading text-grey-900">
                Approved Applications
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-success-bg text-success-text text-xs font-semibold">
                {approvedApps.length}
              </span>
            </div>

            <div className="bg-white border border-grey-200 rounded-xl shadow-card overflow-hidden">
              <table className="w-full">
                <thead className="bg-grey-50 border-b border-grey-200">
                  <tr>
                    {['Application', 'Applicant', 'Risk Score', 'Submitted'].map((h) => (
                      <th
                        key={h}
                        className="px-lg py-md text-left font-body-small font-semibold text-grey-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-100">
                  {isLoadingApproved ? (
                    <tr>
                      <td colSpan={4} className="px-lg py-2xl text-center">
                        <span className="material-symbols-outlined text-[32px] text-grey-300 animate-spin">
                          progress_activity
                        </span>
                      </td>
                    </tr>
                  ) : filteredApproved.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-lg py-2xl text-center">
                        <span className="material-symbols-outlined text-[40px] text-grey-300 block mb-sm">
                          verified
                        </span>
                        <p className="font-body-small text-grey-400">No approved applications yet</p>
                      </td>
                    </tr>
                  ) : (
                    filteredApproved.map((app) => (
                      <tr
                        key={app.id}
                        className="hover:bg-grey-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/manager/application/${app.id}`)}
                      >
                        <td className="px-lg py-md">
                          <span className="font-body-small font-semibold text-grey-500">
                            #{app.id}
                          </span>
                        </td>
                        <td className="px-lg py-md">
                          <div className="flex items-center gap-sm">
                            <div className="w-8 h-8 rounded-full bg-success-bg flex items-center justify-center text-success-text text-xs font-bold flex-shrink-0">
                              {app.applicant_name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div>
                              <p className="font-body-small font-semibold text-grey-900">
                                {app.applicant_name}
                              </p>
                              <p className="text-xs text-grey-400">Insurance Applicant</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-lg py-md">
                          <RiskScore risk={app.risk_level} />
                        </td>
                        <td className="px-lg py-md">
                          <span className="font-body-small text-grey-500">
                            {formatDate(app.submitted_at)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

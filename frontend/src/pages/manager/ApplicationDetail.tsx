import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useAuthStore } from '../../store/authStore'
import {
  approveApplication,
  getApplication,
  logout as logoutApi,
  rejectApplication,
} from '../../services/api'
import type { RiskLevelType } from '../../types/index'
import ManagementSidebar from '../../components/ManagementSidebar'
import StatusBadge from '../../components/StatusBadge'

const RISK_SCORE: Record<RiskLevelType, number> = { high: 87, medium: 62, low: 38 }

interface AiSummaryParsed {
  extracted_overview?: string
  flag_breakdown?: string
  narrative?: {
    completeness?: string
    risk_factors?: string
    income_cover_assessment?: string
    health_summary?: string
    nominee_assessment?: string
    overall_risk_profile?: string
  }
}

function AiSummaryContent({ summary }: { summary: string }) {
  let parsed: AiSummaryParsed | null = null
  try {
    parsed = JSON.parse(summary)
  } catch {
    return <p className="font-body-small text-info-text leading-relaxed">{summary}</p>
  }

  const rows = (
    [
      ['Completeness', parsed?.narrative?.completeness],
      ['Risk Factors', parsed?.narrative?.risk_factors],
      ['Income & Coverage', parsed?.narrative?.income_cover_assessment],
      ['Health Summary', parsed?.narrative?.health_summary],
      ['Nominee', parsed?.narrative?.nominee_assessment],
      ['Overall Risk', parsed?.narrative?.overall_risk_profile],
    ] as [string, string | undefined][]
  ).filter(([, v]) => v)

  return (
    <div className="space-y-sm">
      {parsed?.extracted_overview && (
        <p className="font-body-small text-info-text leading-relaxed">{parsed.extracted_overview}</p>
      )}
      {parsed?.flag_breakdown && (
        <p className="font-body-small text-info-text/70 italic leading-relaxed">
          {parsed.flag_breakdown}
        </p>
      )}
      {rows.length > 0 && (
        <div className="space-y-sm pt-sm border-t border-info-border">
          {rows.map(([label, value]) => (
            <div key={label}>
              <p className="text-xs font-semibold text-info-text/60 uppercase tracking-wide mb-0.5">
                {label}
              </p>
              <p className="font-body-small text-info-text">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex justify-between py-sm border-b border-grey-100 last:border-0">
      <span className="font-body-small text-grey-500">{label}</span>
      <span className="font-body-small font-semibold text-grey-900 text-right max-w-[60%] break-words">
        {value ?? '—'}
      </span>
    </div>
  )
}

export default function ManagerApplicationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logoutStore = useAuthStore((s) => s.logout)

  const appId = id ? parseInt(id) : 0

  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectionRemarks, setRejectionRemarks] = useState('')
  const [apiError, setApiError] = useState('')

  const { data: app, isLoading } = useQuery({
    queryKey: ['application', appId],
    queryFn: () => getApplication(user!.user_id, appId),
    enabled: !!user && !!appId,
    retry: false,
  })

  const approveMutation = useMutation({
    mutationFn: () => approveApplication(user!.user_id, appId),
    onSuccess: () => navigate('/manager/dashboard'),
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setApiError(msg || 'Approval failed.')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: () => rejectApplication(user!.user_id, appId, rejectionRemarks),
    onSuccess: () => navigate('/manager/dashboard'),
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setApiError(msg || 'Rejection failed.')
      setRejectModalOpen(false)
    },
  })

  async function handleLogout() {
    await logoutApi().catch(() => {})
    logoutStore()
    navigate('/login', { replace: true })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-grey-50 flex items-center justify-center">
        <span className="material-symbols-outlined text-[48px] text-accent animate-spin">
          progress_activity
        </span>
      </div>
    )
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-grey-50 flex items-center justify-center">
        <div className="text-center space-y-md">
          <p className="font-body-regular text-grey-600">Application not found.</p>
          <button
            onClick={() => navigate('/manager/dashboard')}
            className="px-lg py-sm bg-primary text-white rounded-lg font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const riskScore = app.risk_level ? RISK_SCORE[app.risk_level as RiskLevelType] : null
  const canDecide = app.status === 'escalated'

  const timeline: { label: string; date: string | null; icon: string }[] = [
    { label: 'Application Uploaded', date: app.updated_at, icon: 'upload_file' },
    { label: 'Submitted for Review', date: app.submitted_at, icon: 'send' },
    { label: 'Escalated to Management', date: app.updated_at, icon: 'trending_up' },
  ]

  return (
    <div className="min-h-screen bg-grey-50">
      {/* Fixed top bar */}
      <header className="fixed top-0 left-0 w-full h-16 bg-[#1E3A5F] text-white flex items-center justify-between px-6 z-50 shadow-sm border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/manager/dashboard')}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-all"
            aria-label="Back"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <span className="text-lg font-bold">Management Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pl-3 border-l border-white/20">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold select-none">
              {user?.full_name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
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
        {/* Sub-header */}
        <div className="bg-white border-b border-grey-200 px-6 py-md shadow-sm">
          <nav aria-label="breadcrumb" className="mb-xs">
            <ol className="flex items-center gap-1 font-body-small text-grey-500">
              <li>
                <button
                  onClick={() => navigate('/manager/dashboard')}
                  className="hover:text-primary transition-colors"
                >
                  Escalated Applications
                </button>
              </li>
              <li>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </li>
              <li className="text-grey-900 font-semibold">Application #{app.id}</li>
            </ol>
          </nav>
          <div className="flex items-center justify-between">
            <h1 className="font-card-heading text-card-heading text-grey-900">
              {app.applicant_name}
            </h1>
            <StatusBadge status={app.status} size="md" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-2xl">
          {apiError && (
            <div className="mb-lg p-md bg-danger-bg border border-danger-border rounded-lg flex items-start gap-sm">
              <span className="material-symbols-outlined text-danger-text text-[18px] mt-0.5">
                error
              </span>
              <p className="font-body-small text-danger-text">{apiError}</p>
            </div>
          )}

          {/* Escalation info panel */}
          {(app.escalation_reason || app.escalation_remarks) && (
            <div className="bg-escalated-bg border border-escalated-border rounded-xl p-xl mb-2xl">
              <div className="flex items-start gap-lg">
                <div className="w-10 h-10 rounded-full bg-escalated-text/20 flex items-center justify-center text-escalated-text font-bold text-sm flex-shrink-0 select-none">
                  PM
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body-small text-escalated-text/70 mb-xs">
                    Escalated by Policy Manager
                  </p>
                  <h3 className="font-card-heading text-card-heading text-escalated-text">
                    {app.escalation_reason ?? 'Requires senior management review'}
                  </h3>
                  {app.escalation_remarks && (
                    <p className="font-body-small text-escalated-text/80 mt-xs">
                      {app.escalation_remarks}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Document Preview */}
          <div className="bg-grey-900 rounded-xl overflow-hidden mb-xl">
            <div className="px-lg py-md border-b border-white/10">
              <h2 className="font-card-heading text-card-heading text-white">Application Document</h2>
            </div>
            <iframe
              src={`/api/applications/${appId}/pdf?user_id=${user!.user_id}`}
              title="Application document"
              className="w-full h-[520px] border-0"
            />
          </div>

          {/* Three-column grid */}
          <div className="grid grid-cols-12 gap-xl">
            {/* Applicant Profile */}
            <div className="col-span-4">
              <div className="bg-white border border-grey-200 rounded-xl shadow-card p-lg h-full">
                <div className="flex items-center gap-sm mb-lg pb-lg border-b border-grey-100">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm select-none">
                    {app.applicant_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="font-body-small font-bold text-grey-900">{app.applicant_name}</p>
                    <p className="text-xs text-grey-500">Applicant ID #{app.applicant_id}</p>
                  </div>
                </div>
                <h3 className="font-card-heading text-card-heading text-grey-900 mb-md">
                  Applicant Profile
                </h3>
                <div className="space-y-0">
                  <DetailRow label="Full Name" value={app.full_name} />
                  <DetailRow label="Date of Birth" value={app.date_of_birth} />
                  <DetailRow label="PAN Number" value={app.pan_number} />
                  <DetailRow label="Phone" value={app.phone} />
                  <DetailRow label="Email" value={app.email} />
                  <DetailRow label="Address" value={app.address} />
                  <DetailRow label="Nominee" value={app.nominee_name} />
                  <DetailRow label="Relation" value={app.nominee_relation} />
                </div>
              </div>
            </div>

            {/* Risk Analysis */}
            <div className="col-span-5">
              <div className="bg-white border border-grey-200 rounded-xl shadow-card p-lg h-full">
                <div className="flex items-center justify-between mb-lg pb-lg border-b border-grey-100">
                  <h3 className="font-card-heading text-card-heading text-grey-900">
                    Risk Analysis
                  </h3>
                  {app.risk_level && (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold capitalize border ${
                        app.risk_level === 'high'
                          ? 'bg-red-100 text-red-700 border-red-200'
                          : app.risk_level === 'medium'
                            ? 'bg-orange-100 text-orange-700 border-orange-200'
                            : 'bg-green-100 text-green-700 border-green-200'
                      }`}
                    >
                      {app.risk_level} risk
                    </span>
                  )}
                </div>

                {/* Risk score bar */}
                {riskScore !== null && (
                  <div className="mb-xl">
                    <div className="flex justify-between mb-xs">
                      <span className="font-body-small text-grey-600">Risk Score</span>
                      <span className="font-body-small font-bold text-grey-900">
                        {riskScore}/100
                      </span>
                    </div>
                    <div className="h-2 bg-grey-100 rounded-full overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          app.risk_level === 'high'
                            ? 'bg-red-500'
                            : app.risk_level === 'medium'
                              ? 'bg-orange-400'
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${riskScore}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-0 mb-lg">
                  <DetailRow
                    label="Coverage Amount"
                    value={
                      app.coverage_amount != null
                        ? `₹${app.coverage_amount.toLocaleString('en-IN')}`
                        : null
                    }
                  />
                  <DetailRow
                    label="Policy Term"
                    value={app.policy_term != null ? `${app.policy_term} years` : null}
                  />
                </div>

                {/* AI summary */}
                {app.ai_summary && (
                  <div className="bg-info-bg border border-info-border rounded-lg p-md mb-lg">
                    <div className="flex items-center gap-sm mb-xs">
                      <span className="material-symbols-outlined text-info-text text-[16px]">
                        smart_toy
                      </span>
                      <span className="font-body-small font-semibold text-info-text">
                        AI Narrative
                      </span>
                    </div>
                    <AiSummaryContent summary={app.ai_summary} />
                  </div>
                )}

                {/* Flag summary */}
                {app.flags.length > 0 && (
                  <div>
                    <p className="font-body-small font-semibold text-grey-700 mb-sm">
                      Validation Flags ({app.flags.length})
                    </p>
                    <div className="space-y-sm">
                      {app.flags.map((flag) => (
                        <div
                          key={flag.id}
                          className={`flex items-start gap-sm p-sm rounded-lg border ${
                            flag.severity === 'high'
                              ? 'bg-red-50 border-red-200'
                              : flag.severity === 'medium'
                                ? 'bg-orange-50 border-orange-200'
                                : 'bg-grey-50 border-grey-200'
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-[14px] mt-0.5 flex-shrink-0 ${
                              flag.severity === 'high'
                                ? 'text-red-500'
                                : flag.severity === 'medium'
                                  ? 'text-orange-500'
                                  : 'text-grey-400'
                            }`}
                          >
                            flag
                          </span>
                          <div>
                            <p className="font-body-small font-semibold text-grey-700 capitalize">
                              {flag.field_name.replace(/_/g, ' ')}
                            </p>
                            <p className="font-body-small text-grey-600">{flag.issue}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Final Decision */}
            <div className="col-span-3">
              <div className="bg-white border border-grey-200 rounded-xl shadow-card p-lg sticky top-6">
                <h3 className="font-card-heading text-card-heading text-grey-900 mb-lg">
                  Final Decision
                </h3>

                {canDecide ? (
                  <>
                    <div className="p-md bg-warning-bg border border-warning-border rounded-lg mb-lg flex items-start gap-sm">
                      <span className="material-symbols-outlined text-warning-text text-[16px] mt-0.5 flex-shrink-0">
                        gavel
                      </span>
                      <p className="font-body-small text-warning-text">
                        Final authority — this decision is irreversible and will immediately notify
                        the applicant.
                      </p>
                    </div>
                    <div className="space-y-sm">
                      <button
                        onClick={() => {
                          setApiError('')
                          approveMutation.mutate()
                        }}
                        disabled={approveMutation.isPending}
                        className="w-full h-10 bg-[#022448] text-white font-semibold rounded-lg hover:bg-[#033a72] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {approveMutation.isPending ? (
                          <span className="material-symbols-outlined text-[18px] animate-spin">
                            progress_activity
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        )}
                        Approve Application
                      </button>
                      <button
                        onClick={() => {
                          setApiError('')
                          setRejectModalOpen(true)
                        }}
                        className="w-full h-10 border-2 border-danger-border text-danger-text font-semibold rounded-lg hover:bg-danger-bg transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                        Reject Application
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-md bg-grey-50 border border-grey-200 rounded-lg text-center">
                    <p className="font-body-small text-grey-500">Decision already recorded.</p>
                  </div>
                )}

                {/* Action history */}
                <div className="mt-xl pt-lg border-t border-grey-100">
                  <p className="font-body-small font-semibold text-grey-700 mb-md">
                    Timeline
                  </p>
                  <ol className="space-y-md">
                    {timeline.map((event, i) => (
                      <li key={i} className="flex items-start gap-sm">
                        <div className="w-6 h-6 rounded-full bg-grey-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[12px] text-grey-500">
                            {event.icon}
                          </span>
                        </div>
                        <div>
                          <p className="font-body-small font-semibold text-grey-700">
                            {event.label}
                          </p>
                          {event.date && (
                            <p className="text-xs text-grey-400">
                              {new Date(event.date).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-xl">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-danger-bg px-xl pt-xl pb-lg border-b border-danger-border rounded-t-xl">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-danger-text text-[24px]">
                  cancel
                </span>
                <h2 className="font-card-heading text-card-heading text-danger-text">
                  Confirm Final Rejection
                </h2>
              </div>
              <p className="font-body-small text-danger-text/80 mt-xs">
                This is a final decision and cannot be reversed.
              </p>
            </div>
            <div className="px-xl py-lg space-y-lg">
              <div>
                <label
                  htmlFor="manager-rejection-remarks"
                  className="block font-body-small font-semibold text-grey-700 mb-xs"
                >
                  Rejection Reason{' '}
                  <span className="font-normal text-grey-500">(internal record)</span>
                </label>
                <textarea
                  id="manager-rejection-remarks"
                  value={rejectionRemarks}
                  onChange={(e) => setRejectionRemarks(e.target.value)}
                  rows={4}
                  placeholder="Provide reason for final rejection…"
                  className="w-full border border-grey-200 rounded-lg p-md font-body-small resize-none focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div className="flex items-start gap-sm p-md bg-grey-50 border border-grey-200 rounded-lg">
                <span className="material-symbols-outlined text-[16px] text-grey-500 mt-0.5">
                  info
                </span>
                <p className="font-body-small text-grey-600">
                  This reason is for internal records only and will not be shared with the
                  applicant.
                </p>
              </div>
              <div className="flex gap-md justify-end">
                <button
                  onClick={() => setRejectModalOpen(false)}
                  className="px-lg h-10 border border-grey-200 text-grey-600 font-medium rounded-lg hover:bg-grey-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => rejectMutation.mutate()}
                  disabled={!rejectionRemarks.trim() || rejectMutation.isPending}
                  className="px-lg h-10 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rejectMutation.isPending && (
                    <span className="material-symbols-outlined text-[18px] animate-spin">
                      progress_activity
                    </span>
                  )}
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

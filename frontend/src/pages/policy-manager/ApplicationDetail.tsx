import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useAuthStore } from '../../store/authStore'
import {
  approveApplication,
  escalateApplication,
  getApplication,
  rejectApplication,
} from '../../services/api'
import type { RiskLevelType } from '../../types/index'
import ManagementSidebar from '../../components/ManagementSidebar'
import StatusBadge from '../../components/StatusBadge'

const ESCALATION_REASONS = [
  'High Risk Score (>85)',
  'Policy Exception Required',
  'Coverage Threshold Breach',
  'Complex Case Structure',
  'Other',
]

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
    return <p className="font-body-small text-grey-700 leading-relaxed">{summary}</p>
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
    <div className="space-y-md">
      {parsed?.extracted_overview && (
        <p className="font-body-small text-grey-700 leading-relaxed">{parsed.extracted_overview}</p>
      )}
      {parsed?.flag_breakdown && (
        <p className="font-body-small text-grey-500 italic leading-relaxed">
          {parsed.flag_breakdown}
        </p>
      )}
      {rows.length > 0 && (
        <div className="space-y-sm pt-sm border-t border-grey-100">
          {rows.map(([label, value]) => (
            <div key={label}>
              <p className="text-xs font-semibold text-grey-500 uppercase tracking-wide mb-0.5">
                {label}
              </p>
              <p className="font-body-small text-grey-700">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RiskPill({ risk }: { risk: RiskLevelType | null }) {
  if (!risk) return null
  const cls =
    risk === 'high'
      ? 'bg-red-100 text-red-700 border-red-200'
      : risk === 'medium'
        ? 'bg-orange-100 text-orange-700 border-orange-200'
        : 'bg-green-100 text-green-700 border-green-200'
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize border ${cls}`}>
      {risk} risk
    </span>
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

export default function PolicyManagerApplicationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const appId = id ? parseInt(id) : 0

  const [decisionNotes, setDecisionNotes] = useState('')
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [escalateModalOpen, setEscalateModalOpen] = useState(false)
  const [rejectionRemarks, setRejectionRemarks] = useState('')
  const [escalationReason, setEscalationReason] = useState('')
  const [escalationRemarks, setEscalationRemarks] = useState('')
  const [apiError, setApiError] = useState('')

  const { data: app, isLoading } = useQuery({
    queryKey: ['application', appId],
    queryFn: () => getApplication(user!.user_id, appId),
    enabled: !!user && !!appId,
    retry: false,
  })

  const approveMutation = useMutation({
    mutationFn: () => approveApplication(user!.user_id, appId, decisionNotes || undefined),
    onSuccess: () => navigate('/policy-manager/dashboard'),
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setApiError(msg || 'Approval failed.')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: () => rejectApplication(user!.user_id, appId, rejectionRemarks),
    onSuccess: () => navigate('/policy-manager/dashboard'),
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setApiError(msg || 'Rejection failed.')
      setRejectModalOpen(false)
    },
  })

  const escalateMutation = useMutation({
    mutationFn: () =>
      escalateApplication(user!.user_id, appId, escalationReason, escalationRemarks),
    onSuccess: () => navigate('/policy-manager/dashboard'),
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setApiError(msg || 'Escalation failed.')
      setEscalateModalOpen(false)
    },
  })

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
            onClick={() => navigate('/policy-manager/dashboard')}
            className="px-lg py-sm bg-primary text-white rounded-lg font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const canDecide = app.status === 'pending_review'

  return (
    <div className="min-h-screen bg-grey-50">
      <ManagementSidebar activeItem="applications" />

      <div className="ml-[240px] min-h-screen">
        {/* Sticky sub-header */}
        <div className="sticky top-0 bg-white border-b border-grey-200 z-30 px-6 py-md shadow-sm">
          <nav aria-label="breadcrumb" className="mb-xs">
            <ol className="flex items-center gap-1 font-body-small text-grey-500">
              <li>
                <button
                  onClick={() => navigate('/policy-manager/dashboard')}
                  className="hover:text-primary transition-colors"
                >
                  Applications
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
            <div className="flex items-center gap-sm">
              <StatusBadge status={app.status} size="md" />
              <RiskPill risk={app.risk_level} />
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 py-2xl">
          {apiError && (
            <div className="mb-lg p-md bg-danger-bg border border-danger-border rounded-lg flex items-start gap-sm">
              <span className="material-symbols-outlined text-danger-text text-[18px] mt-0.5">
                error
              </span>
              <p className="font-body-small text-danger-text">{apiError}</p>
            </div>
          )}

          <div className="grid grid-cols-12 gap-xl">
            {/* Left: Document viewer */}
            <div className="col-span-4">
              <div className="bg-grey-900 rounded-xl overflow-hidden sticky top-[72px]">
                <div className="px-lg py-md border-b border-white/10">
                  <h2 className="font-card-heading text-card-heading text-white">Document</h2>
                </div>
                <div className="p-2xl flex flex-col items-center justify-center min-h-[320px] gap-lg">
                  <span
                    className="material-symbols-outlined text-[56px] text-grey-500"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    picture_as_pdf
                  </span>
                  <div className="text-center">
                    <p className="font-body-small font-semibold text-white break-all">
                      {app.document_path
                        ? app.document_path.split(/[\\/]/).pop()
                        : 'document.pdf'}
                    </p>
                    <p className="font-body-small text-grey-500 mt-xs">Applicant upload</p>
                  </div>
                </div>
                <div className="px-lg pb-lg space-y-sm border-t border-white/10 pt-lg">
                  <DetailRow label="Applicant ID" value={`#${app.applicant_id}`} />
                  <DetailRow label="Application ID" value={`#${app.id}`} />
                  {app.submitted_at && (
                    <DetailRow
                      label="Submitted"
                      value={new Date(app.submitted_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Center: AI summary + extracted details + flags */}
            <div className="col-span-5 space-y-xl">
              {/* AI summary */}
              {app.ai_summary && (
                <div className="bg-white border border-grey-200 rounded-xl shadow-card p-lg">
                  <div className="flex items-center gap-sm mb-md">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      smart_toy
                    </span>
                    <h3 className="font-card-heading text-card-heading text-grey-900">
                      AI Assessment
                    </h3>
                  </div>
                  <AiSummaryContent summary={app.ai_summary} />
                </div>
              )}

              {/* Extracted details */}
              <div className="bg-white border border-grey-200 rounded-xl shadow-card p-lg">
                <h3 className="font-card-heading text-card-heading text-grey-900 mb-md">
                  Extracted Details
                </h3>
                <div className="space-y-0">
                  <DetailRow label="Full Name" value={app.full_name} />
                  <DetailRow label="Date of Birth" value={app.date_of_birth} />
                  <DetailRow label="PAN Number" value={app.pan_number} />
                  <DetailRow label="Address" value={app.address} />
                  <DetailRow label="Phone" value={app.phone} />
                  <DetailRow label="Email" value={app.email} />
                  <DetailRow label="Nominee Name" value={app.nominee_name} />
                  <DetailRow label="Nominee Relation" value={app.nominee_relation} />
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
              </div>

              {/* Flag breakdown */}
              {app.flags.length > 0 && (
                <div className="bg-white border border-grey-200 rounded-xl shadow-card overflow-hidden">
                  <div className="px-lg py-md border-b border-grey-100">
                    <h3 className="font-card-heading text-card-heading text-grey-900">
                      Validation Flags
                    </h3>
                  </div>
                  <table className="w-full">
                    <thead className="bg-grey-50">
                      <tr>
                        {['Field', 'Issue', 'Severity'].map((h) => (
                          <th
                            key={h}
                            className="px-md py-sm text-left font-body-small font-semibold text-grey-500 uppercase tracking-wide text-xs"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-grey-100">
                      {app.flags.map((flag) => (
                        <tr key={flag.id}>
                          <td className="px-md py-sm">
                            <span className="font-body-small text-grey-700 font-medium">
                              {flag.field_name.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-md py-sm">
                            <span className="font-body-small text-grey-600">{flag.issue}</span>
                          </td>
                          <td className="px-md py-sm">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                flag.severity === 'high'
                                  ? 'bg-red-100 text-red-700'
                                  : flag.severity === 'medium'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-grey-100 text-grey-600'
                              }`}
                            >
                              {flag.severity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right: Action card */}
            <div className="col-span-3">
              <div className="bg-white border border-grey-200 rounded-xl shadow-card p-lg sticky top-[72px]">
                <h3 className="font-card-heading text-card-heading text-grey-900 mb-lg">
                  Decision
                </h3>

                <div className="mb-lg">
                  <label
                    htmlFor="decision-notes"
                    className="block font-body-small font-semibold text-grey-700 mb-xs"
                  >
                    Decision Notes
                  </label>
                  <textarea
                    id="decision-notes"
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    disabled={!canDecide}
                    rows={4}
                    placeholder="Add notes for this decision…"
                    className="w-full border border-grey-200 rounded-lg p-md font-body-small resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:bg-grey-50 disabled:text-grey-400"
                  />
                </div>

                {canDecide ? (
                  <div className="space-y-sm">
                    <button
                      onClick={() => {
                        setApiError('')
                        approveMutation.mutate()
                      }}
                      disabled={approveMutation.isPending}
                      className="w-full h-10 bg-primary text-white font-semibold rounded-lg hover:bg-primary-container transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
                        setEscalateModalOpen(true)
                      }}
                      className="w-full h-10 bg-escalated-bg border border-escalated-border text-escalated-text font-semibold rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">trending_up</span>
                      Escalate to Manager
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
                ) : (
                  <div className="p-md bg-grey-50 border border-grey-200 rounded-lg">
                    <p className="font-body-small text-grey-500 text-center">
                      No actions available for this status.
                    </p>
                  </div>
                )}
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
                  Confirm Rejection
                </h2>
              </div>
              <p className="font-body-small text-danger-text/80 mt-xs">
                This action cannot be undone.
              </p>
            </div>
            <div className="px-xl py-lg space-y-lg">
              <div>
                <label
                  htmlFor="rejection-remarks"
                  className="block font-body-small font-semibold text-grey-700 mb-xs"
                >
                  Rejection Reason{' '}
                  <span className="font-normal text-grey-500">(internal only)</span>
                </label>
                <textarea
                  id="rejection-remarks"
                  value={rejectionRemarks}
                  onChange={(e) => setRejectionRemarks(e.target.value)}
                  rows={4}
                  placeholder="Provide reason for rejection…"
                  className="w-full border border-grey-200 rounded-lg p-md font-body-small resize-none focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div className="flex items-start gap-sm p-md bg-grey-50 border border-grey-200 rounded-lg">
                <span className="material-symbols-outlined text-[16px] text-grey-500 mt-0.5">
                  info
                </span>
                <p className="font-body-small text-grey-600">
                  This reason will be recorded internally and will not be shared with the applicant.
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

      {/* Escalate Modal */}
      {escalateModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-xl">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-escalated-bg px-xl pt-xl pb-lg border-b border-escalated-border rounded-t-xl">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-escalated-text text-[24px]">
                  trending_up
                </span>
                <h2 className="font-card-heading text-card-heading text-escalated-text">
                  Escalate to Manager
                </h2>
              </div>
              <p className="font-body-small text-escalated-text/80 mt-xs">
                This application will be sent to senior management for final decision.
              </p>
            </div>
            <div className="px-xl py-lg space-y-lg">
              <div>
                <label
                  htmlFor="escalation-reason"
                  className="block font-body-small font-semibold text-grey-700 mb-xs"
                >
                  Escalation Reason
                </label>
                <select
                  id="escalation-reason"
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  className="w-full h-10 px-md border border-grey-200 rounded-lg font-body-small focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white"
                >
                  <option value="">Select a reason…</option>
                  {ESCALATION_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="escalation-remarks"
                  className="block font-body-small font-semibold text-grey-700 mb-xs"
                >
                  Escalation Remarks
                </label>
                <textarea
                  id="escalation-remarks"
                  value={escalationRemarks}
                  onChange={(e) => setEscalationRemarks(e.target.value)}
                  rows={4}
                  placeholder="Provide additional context for the manager…"
                  className="w-full border border-grey-200 rounded-lg p-md font-body-small resize-none focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div className="flex items-start gap-sm p-md bg-escalated-bg border border-escalated-border rounded-lg">
                <span className="material-symbols-outlined text-escalated-text text-[16px] mt-0.5">
                  lock
                </span>
                <p className="font-body-small text-escalated-text">
                  Once escalated, this application will be locked and you will no longer be able to
                  approve or reject it directly.
                </p>
              </div>
              <div className="flex gap-md justify-end">
                <button
                  onClick={() => setEscalateModalOpen(false)}
                  className="px-lg h-10 border border-grey-200 text-grey-600 font-medium rounded-lg hover:bg-grey-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => escalateMutation.mutate()}
                  disabled={!escalationReason || escalateMutation.isPending}
                  className="px-lg h-10 bg-[#022448] text-white font-semibold rounded-lg hover:bg-[#033a72] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {escalateMutation.isPending && (
                    <span className="material-symbols-outlined text-[18px] animate-spin">
                      progress_activity
                    </span>
                  )}
                  Confirm Escalation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

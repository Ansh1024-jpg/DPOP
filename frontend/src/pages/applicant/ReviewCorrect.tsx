import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuthStore } from '../../store/authStore'
import {
  correctApplication,
  deleteApplication,
  getApplication,
  logout as logoutApi,
  submitApplication,
} from '../../services/api'
import type { FlagResponse } from '../../types/index'
import StatusBadge from '../../components/StatusBadge'

interface FormFields {
  full_name: string
  date_of_birth: string
  pan_number: string
  address: string
  phone: string
  email: string
  occupation: string
  employer_name: string
  annual_income: string
  employment_type: string
  pre_existing_conditions: string
  smoker: string
  height_cm: string
  weight_kg: string
  coverage_amount: string
  policy_term: string
  premium_payment_mode: string
  nominee_name: string
  nominee_relation: string
  nominee_dob: string
}

const EMPTY_FORM: FormFields = {
  full_name: '',
  date_of_birth: '',
  pan_number: '',
  address: '',
  phone: '',
  email: '',
  occupation: '',
  employer_name: '',
  annual_income: '',
  employment_type: '',
  pre_existing_conditions: '',
  smoker: '',
  height_cm: '',
  weight_kg: '',
  coverage_amount: '',
  policy_term: '',
  premium_payment_mode: '',
  nominee_name: '',
  nominee_relation: '',
  nominee_dob: '',
}

type SectionKey = 'personal' | 'contact' | 'occupation' | 'health' | 'insurance' | 'nominee'

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
    return <p className="font-body-small text-info-text">{summary}</p>
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
        <p className="font-body-small text-info-text">{parsed.extracted_overview}</p>
      )}
      {parsed?.flag_breakdown && (
        <p className="font-body-small text-info-text/70 italic">{parsed.flag_breakdown}</p>
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

function SectionAccordion({
  open,
  onToggle,
  icon,
  title,
  flagCount,
  children,
}: {
  open: boolean
  onToggle: () => void
  icon: string
  title: string
  flagCount: number
  children: ReactNode
}) {
  return (
    <div className="bg-surface-container-lowest border border-grey-200 rounded-xl shadow-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-lg hover:bg-grey-50 transition-colors"
      >
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
          <h3 className="font-card-heading text-card-heading text-grey-900">{title}</h3>
          {flagCount > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
              {flagCount} issue{flagCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <span
          className={`material-symbols-outlined text-grey-400 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          expand_more
        </span>
      </button>
      {open && (
        <div className="px-lg pb-lg border-t border-grey-100 pt-lg">{children}</div>
      )}
    </div>
  )
}

export default function ReviewCorrect() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logoutStore = useAuthStore((s) => s.logout)
  const queryClient = useQueryClient()

  const [form, setForm] = useState<FormFields>(EMPTY_FORM)
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    personal: true,
    contact: true,
    occupation: false,
    health: false,
    insurance: true,
    nominee: false,
  })
  const [apiError, setApiError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const initialized = useRef(false)

  const appId = id ? parseInt(id) : 0

  const { data: app, isLoading } = useQuery({
    queryKey: ['application', appId],
    queryFn: () => getApplication(user!.user_id, appId),
    enabled: !!user && !!appId,
    retry: false,
  })

  useEffect(() => {
    if (app && !initialized.current) {
      initialized.current = true
      setForm({
        full_name: app.full_name ?? '',
        date_of_birth: app.date_of_birth ?? '',
        pan_number: app.pan_number ?? '',
        address: app.address ?? '',
        phone: app.phone ?? '',
        email: app.email ?? '',
        occupation: app.occupation ?? '',
        employer_name: app.employer_name ?? '',
        annual_income: app.annual_income?.toString() ?? '',
        employment_type: app.employment_type ?? '',
        pre_existing_conditions: app.pre_existing_conditions ?? '',
        smoker: app.smoker === true ? 'true' : app.smoker === false ? 'false' : '',
        height_cm: app.height_cm?.toString() ?? '',
        weight_kg: app.weight_kg?.toString() ?? '',
        coverage_amount: app.coverage_amount?.toString() ?? '',
        policy_term: app.policy_term?.toString() ?? '',
        premium_payment_mode: app.premium_payment_mode ?? '',
        nominee_name: app.nominee_name ?? '',
        nominee_relation: app.nominee_relation ?? '',
        nominee_dob: app.nominee_dob ?? '',
      })
    }
  }, [app])

  const saveMutation = useMutation({
    mutationFn: (corrections: Record<string, unknown>) =>
      correctApplication(user!.user_id, appId, corrections),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', appId] })
      setApiError('')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setApiError(msg || 'Failed to save corrections.')
    },
  })

  const submitMutation = useMutation({
    mutationFn: () => submitApplication(user!.user_id, appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', appId] })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setApiError(msg || 'Submit failed. Resolve all issues first.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteApplication(user!.user_id, appId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['myApplication', user?.user_id] })
      navigate('/applicant/upload', { replace: true })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setApiError(msg || 'Could not delete the application. Please try again.')
      setConfirmDelete(false)
    },
  })

  async function handleLogout() {
    await logoutApi().catch(() => {})
    logoutStore()
    navigate('/login', { replace: true })
  }

  function handleSave() {
    setApiError('')
    const raw: Record<string, unknown> = {
      full_name: form.full_name || undefined,
      date_of_birth: form.date_of_birth || undefined,
      pan_number: form.pan_number || undefined,
      address: form.address || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      occupation: form.occupation || undefined,
      employer_name: form.employer_name || undefined,
      annual_income:
        form.annual_income && !isNaN(parseFloat(form.annual_income))
          ? parseFloat(form.annual_income)
          : undefined,
      employment_type: form.employment_type || undefined,
      pre_existing_conditions: form.pre_existing_conditions || undefined,
      smoker:
        form.smoker === 'true' ? true : form.smoker === 'false' ? false : undefined,
      height_cm:
        form.height_cm && !isNaN(parseFloat(form.height_cm))
          ? parseFloat(form.height_cm)
          : undefined,
      weight_kg:
        form.weight_kg && !isNaN(parseFloat(form.weight_kg))
          ? parseFloat(form.weight_kg)
          : undefined,
      coverage_amount:
        form.coverage_amount && !isNaN(parseFloat(form.coverage_amount))
          ? parseFloat(form.coverage_amount)
          : undefined,
      policy_term:
        form.policy_term && !isNaN(parseInt(form.policy_term))
          ? parseInt(form.policy_term)
          : undefined,
      premium_payment_mode: form.premium_payment_mode || undefined,
      nominee_name: form.nominee_name || undefined,
      nominee_relation: form.nominee_relation || undefined,
      nominee_dob: form.nominee_dob || undefined,
    }
    const corrections = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined))
    saveMutation.mutate(corrections)
  }

  function getFlag(fieldName: string): FlagResponse | undefined {
    return app?.flags.find(
      (f) =>
        !f.is_resolved &&
        (f.field_name === fieldName || f.field_name.endsWith(`.${fieldName}`)),
    )
  }

  function fieldBorderClass(fieldName: string): string {
    return getFlag(fieldName)
      ? 'border-red-400 bg-red-50 focus:ring-red-300 focus:border-red-400'
      : 'border-grey-200 focus:ring-accent/30 focus:border-accent'
  }

  function toggleSection(key: SectionKey) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function flagCountInSection(fields: string[]): number {
    return (
      app?.flags.filter(
        (f) =>
          !f.is_resolved &&
          fields.some((fn) => f.field_name === fn || f.field_name.endsWith(`.${fn}`)),
      ).length ?? 0
    )
  }

  function renderField(
    label: string,
    name: keyof FormFields,
    type = 'text',
    placeholder?: string,
  ) {
    const flag = getFlag(name)
    const isEditable = app?.status === 'flagged' || app?.status === 'corrections_made'
    return (
      <div className="space-y-1.5">
        <label htmlFor={name} className="block font-body-small font-semibold text-grey-700">
          {label}
        </label>
        <input
          id={name}
          type={type}
          value={form[name]}
          onChange={(e) => setForm((prev) => ({ ...prev, [name]: e.target.value }))}
          disabled={!isEditable}
          placeholder={placeholder}
          className={`w-full h-10 px-md border rounded-lg font-body-small focus:outline-none focus:ring-2 transition-all disabled:bg-grey-50 disabled:text-grey-400 disabled:cursor-not-allowed ${fieldBorderClass(name)}`}
        />
        {flag && (
          <p className="flex items-center gap-1 font-body-small text-red-600">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {flag.issue}
          </p>
        )}
      </div>
    )
  }

  function renderSelect(
    label: string,
    name: keyof FormFields,
    options: { value: string; label: string }[],
  ) {
    const flag = getFlag(name)
    const isEditable = app?.status === 'flagged' || app?.status === 'corrections_made'
    const borderCls = flag
      ? 'border-red-400 bg-red-50 focus:ring-red-300 focus:border-red-400'
      : 'border-grey-200 focus:ring-accent/30 focus:border-accent'
    return (
      <div className="space-y-1.5">
        <label htmlFor={name} className="block font-body-small font-semibold text-grey-700">
          {label}
        </label>
        <select
          id={name}
          value={form[name]}
          onChange={(e) => setForm((prev) => ({ ...prev, [name]: e.target.value }))}
          disabled={!isEditable}
          className={`w-full h-10 px-md border rounded-lg font-body-small focus:outline-none focus:ring-2 transition-all disabled:bg-grey-50 disabled:text-grey-400 disabled:cursor-not-allowed bg-white ${borderCls}`}
        >
          <option value="">— Select —</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {flag && (
          <p className="flex items-center gap-1 font-body-small text-red-600">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {flag.issue}
          </p>
        )}
      </div>
    )
  }

  const unresolvedFlags = app?.flags.filter((f) => !f.is_resolved) ?? []
  const isEditable = app?.status === 'flagged' || app?.status === 'corrections_made'

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="material-symbols-outlined text-[48px] text-accent animate-spin">
          progress_activity
        </span>
      </div>
    )
  }

  if (!app) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-md">
          <p className="font-body-regular text-grey-600">Application not found.</p>
          <button
            onClick={() => navigate('/applicant/upload')}
            className="px-lg py-sm bg-primary text-white rounded-lg font-medium"
          >
            Back to Upload
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 w-full h-16 bg-[#1E3A5F] text-white flex items-center justify-between px-6 z-50 shadow-sm border-b border-white/10">
        <div className="flex items-center gap-8">
          <span className="text-lg font-bold">InsureTrust</span>
          <nav className="hidden md:flex items-center gap-6">
            <span className="text-sm text-white font-semibold border-b border-white/60 pb-0.5">
              My Application
            </span>
            <button
              onClick={() => navigate('/applicant/history')}
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              History
            </button>
            <a className="text-sm text-slate-300 hover:text-white transition-colors">Support</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-300 hidden sm:block">{user?.full_name}</span>
          <button
            onClick={() => navigate('/applicant/upload')}
            className="p-2 rounded-full hover:bg-white/10 transition-all"
            aria-label="Go to upload page"
            title="Back to Upload"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-white/10 transition-all"
            aria-label="Logout"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </header>

      <main className="pt-16 min-h-screen">
        {/* Status banners */}
        {app.status === 'flagged' && (
          <div className="w-full bg-warning-bg border-b border-warning-border px-6 py-3 flex items-center gap-sm">
            <span className="material-symbols-outlined text-warning-text text-[20px]">warning</span>
            <p className="font-body-small font-semibold text-warning-text">
              Action Required —{' '}
              {unresolvedFlags.length} issue{unresolvedFlags.length !== 1 ? 's' : ''} found. Correct
              the highlighted fields and save your progress.
            </p>
          </div>
        )}
        {app.status === 'corrections_made' && (
          <div className="w-full bg-info-bg border-b border-info-border px-6 py-3 flex items-center gap-sm">
            <span className="material-symbols-outlined text-info-text text-[20px]">info</span>
            <p className="font-body-small font-semibold text-info-text">
              {unresolvedFlags.length > 0
                ? `${unresolvedFlags.length} issue${unresolvedFlags.length !== 1 ? 's' : ''} remaining — resolve all issues before submitting.`
                : 'All issues resolved — you can now submit your application.'}
            </p>
          </div>
        )}
        {app.status === 'pending_review' && (
          <div className="w-full bg-info-bg border-b border-info-border px-6 py-3 flex items-center gap-sm">
            <span className="material-symbols-outlined text-info-text text-[20px]">schedule</span>
            <p className="font-body-small font-semibold text-info-text">
              Application Submitted — Under policy manager review. You will be notified once a
              decision is made.
            </p>
          </div>
        )}
        {app.status === 'approved' && (
          <div className="w-full bg-success-bg border-b border-success-border px-6 py-3 flex items-center gap-sm">
            <span className="material-symbols-outlined text-success-text text-[20px]">
              check_circle
            </span>
            <p className="font-body-small font-semibold text-success-text">
              Application Approved — Congratulations! Your policy will be issued shortly.
            </p>
          </div>
        )}
        {app.status === 'rejected' && (
          <div className="w-full bg-danger-bg border-b border-danger-border px-6 py-3 flex items-center gap-sm">
            <span className="material-symbols-outlined text-danger-text text-[20px]">cancel</span>
            <p className="font-body-small font-semibold text-danger-text">
              Application Rejected — Unfortunately your application was not approved.
            </p>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 py-2xl">
          {/* Page header */}
          <div className="flex items-start justify-between mb-2xl">
            <div>
              <p className="font-label-overline text-label-overline text-grey-400 uppercase tracking-widest mb-xs">
                Application #{app.id}
              </p>
              <h1 className="font-display-title text-display-title text-grey-900">
                Review Your Application
              </h1>
            </div>
            <div className="flex items-center gap-md">
              {confirmDelete ? (
                <div className="flex items-center gap-sm bg-red-50 border border-red-200 rounded-xl px-md py-sm">
                  <span className="font-body-small text-red-700 font-semibold">Delete this application?</span>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-sm h-8 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                    className="px-sm h-8 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all flex items-center gap-1.5 text-sm disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? (
                      <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-[15px]">delete_forever</span>
                    )}
                    Yes, delete
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="px-md h-9 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-all flex items-center gap-1.5 text-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  Delete Application
                </button>
              )}
              <StatusBadge status={app.status} size="md" />
            </div>
          </div>

          {apiError && (
            <div className="mb-lg p-md bg-danger-bg border border-danger-border rounded-lg flex items-start gap-sm">
              <span className="material-symbols-outlined text-danger-text text-[18px] mt-0.5">
                error
              </span>
              <p className="font-body-small text-danger-text">{apiError}</p>
            </div>
          )}

          {/* Two-panel layout — extra bottom padding for the sticky action bar */}
          <div className="grid lg:grid-cols-12 gap-2xl pb-24">
            {/* Left: Document viewer */}
            <div className="lg:col-span-5">
              <div className="bg-grey-900 rounded-xl overflow-hidden sticky top-6">
                <div className="px-lg py-md border-b border-white/10">
                  <h2 className="font-card-heading text-card-heading text-white">
                    Uploaded Document
                  </h2>
                </div>
                {app.document_path ? (
                  <iframe
                    src={`/api/applications/${app.id}/pdf?user_id=${user!.user_id}`}
                    className="w-full border-0"
                    style={{ height: '480px' }}
                    title={`Application ${app.id} document`}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-lg" style={{ height: '480px' }}>
                    <span
                      className="material-symbols-outlined text-[64px] text-grey-500"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      picture_as_pdf
                    </span>
                    <p className="font-body-small text-grey-500">No document available</p>
                  </div>
                )}
                <div className="px-lg pb-lg border-t border-white/10 pt-lg space-y-sm">
                  <div className="flex justify-between">
                    <span className="font-body-small text-grey-500">Application ID</span>
                    <span className="font-body-small text-white">#{app.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body-small text-grey-500">Status</span>
                    <StatusBadge status={app.status} size="sm" />
                  </div>
                  {app.risk_level && (
                    <div className="flex justify-between">
                      <span className="font-body-small text-grey-500">Risk Level</span>
                      <span
                        className={`font-body-small font-semibold capitalize ${
                          app.risk_level === 'high'
                            ? 'text-red-400'
                            : app.risk_level === 'medium'
                              ? 'text-orange-400'
                              : 'text-green-400'
                        }`}
                      >
                        {app.risk_level}
                      </span>
                    </div>
                  )}
                  {app.flags.length > 0 && (
                    <div className="flex justify-between">
                      <span className="font-body-small text-grey-500">Issues</span>
                      <span className="font-body-small text-warning-text font-semibold">
                        {unresolvedFlags.length} unresolved / {app.flags.length} total
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Accordion form sections */}
            <div className="lg:col-span-7 space-y-lg">
              {/* AI Assessment */}
              {app.ai_summary && (
                <div className="bg-info-bg border border-info-border rounded-xl p-lg">
                  <div className="flex items-center gap-sm mb-sm">
                    <span className="material-symbols-outlined text-info-text text-[20px]">
                      smart_toy
                    </span>
                    <h3 className="font-card-heading text-card-heading text-info-text">
                      AI Assessment
                    </h3>
                  </div>
                  <AiSummaryContent summary={app.ai_summary} />
                </div>
              )}

              {/* Personal Information */}
              <SectionAccordion
                open={openSections.personal}
                onToggle={() => toggleSection('personal')}
                icon="person"
                title="Personal Information"
                flagCount={flagCountInSection(['full_name', 'date_of_birth', 'pan_number', 'address'])}
              >
                <div className="grid grid-cols-2 gap-lg">
                  {renderField('Full Name', 'full_name', 'text', 'Enter full name')}
                  {renderField('Date of Birth', 'date_of_birth', 'date')}
                  {renderField('PAN Number', 'pan_number', 'text', 'e.g. ABCDE1234F')}
                  <div className="col-span-2">
                    {renderField('Address', 'address', 'text', 'Enter full address')}
                  </div>
                </div>
              </SectionAccordion>

              {/* Contact Details */}
              <SectionAccordion
                open={openSections.contact}
                onToggle={() => toggleSection('contact')}
                icon="call"
                title="Contact Details"
                flagCount={flagCountInSection(['phone', 'email'])}
              >
                <div className="grid grid-cols-2 gap-lg">
                  {renderField('Phone Number', 'phone', 'tel', '+91 XXXXX XXXXX')}
                  {renderField('Email Address', 'email', 'email', 'name@example.com')}
                </div>
              </SectionAccordion>

              {/* Occupation Details */}
              <SectionAccordion
                open={openSections.occupation}
                onToggle={() => toggleSection('occupation')}
                icon="work"
                title="Occupation Details"
                flagCount={flagCountInSection(['occupation', 'employer_name', 'annual_income', 'employment_type'])}
              >
                <div className="grid grid-cols-2 gap-lg">
                  {renderField('Occupation / Job Title', 'occupation', 'text', 'e.g. Software Engineer')}
                  {renderField('Employer Name', 'employer_name', 'text', 'e.g. Acme Corp')}
                  {renderField('Annual Income (₹)', 'annual_income', 'number', 'e.g. 1200000')}
                  {renderSelect('Employment Type', 'employment_type', [
                    { value: 'Salaried', label: 'Salaried' },
                    { value: 'Self-Employed', label: 'Self-Employed' },
                    { value: 'Business', label: 'Business' },
                    { value: 'Retired', label: 'Retired' },
                    { value: 'Other', label: 'Other' },
                  ])}
                </div>
              </SectionAccordion>

              {/* Health Information */}
              <SectionAccordion
                open={openSections.health}
                onToggle={() => toggleSection('health')}
                icon="favorite"
                title="Health Information"
                flagCount={flagCountInSection(['pre_existing_conditions', 'smoker', 'height_cm', 'weight_kg'])}
              >
                <div className="grid grid-cols-2 gap-lg">
                  <div className="col-span-2">
                    {renderField(
                      'Pre-existing Conditions',
                      'pre_existing_conditions',
                      'text',
                      'e.g. Diabetes, Hypertension or None',
                    )}
                  </div>
                  {renderSelect('Smoker', 'smoker', [
                    { value: 'false', label: 'No' },
                    { value: 'true', label: 'Yes' },
                  ])}
                  {renderField('Height (cm)', 'height_cm', 'number', 'e.g. 170')}
                  {renderField('Weight (kg)', 'weight_kg', 'number', 'e.g. 70')}
                </div>
              </SectionAccordion>

              {/* Insurance Coverage */}
              <SectionAccordion
                open={openSections.insurance}
                onToggle={() => toggleSection('insurance')}
                icon="description"
                title="Insurance Coverage"
                flagCount={flagCountInSection(['coverage_amount', 'policy_term', 'premium_payment_mode'])}
              >
                <div className="grid grid-cols-2 gap-lg">
                  {renderField('Coverage Amount (₹)', 'coverage_amount', 'number', 'e.g. 5000000')}
                  {renderField('Policy Term (years)', 'policy_term', 'number', 'e.g. 20')}
                  {renderSelect('Premium Payment Mode', 'premium_payment_mode', [
                    { value: 'Annual', label: 'Annual' },
                    { value: 'Semi-Annual', label: 'Semi-Annual' },
                    { value: 'Quarterly', label: 'Quarterly' },
                    { value: 'Monthly', label: 'Monthly' },
                  ])}
                </div>
              </SectionAccordion>

              {/* Nominee Details */}
              <SectionAccordion
                open={openSections.nominee}
                onToggle={() => toggleSection('nominee')}
                icon="group"
                title="Nominee Details"
                flagCount={flagCountInSection(['nominee_name', 'nominee_relation', 'nominee_dob'])}
              >
                <div className="grid grid-cols-2 gap-lg">
                  {renderField('Nominee Name', 'nominee_name', 'text', 'Enter nominee full name')}
                  {renderSelect('Nominee Relation', 'nominee_relation', [
                    { value: 'Spouse', label: 'Spouse' },
                    { value: 'Parent', label: 'Parent' },
                    { value: 'Child', label: 'Child' },
                    { value: 'Sibling', label: 'Sibling' },
                    { value: 'Other', label: 'Other' },
                  ])}
                  {renderField('Nominee Date of Birth', 'nominee_dob', 'date')}
                </div>
              </SectionAccordion>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky bottom action bar — shown only when application is editable */}
      {isEditable && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-grey-200 shadow-lg z-40 px-6 py-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-sm">
              {unresolvedFlags.length > 0 ? (
                <>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-warning-bg border border-warning-border rounded-full font-body-small font-semibold text-warning-text">
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    {unresolvedFlags.length} unresolved issue
                    {unresolvedFlags.length !== 1 ? 's' : ''}
                  </span>
                  <span className="font-body-small text-grey-500 hidden sm:block">
                    Resolve all issues to enable submission
                  </span>
                </>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-success-bg border border-success-border rounded-full font-body-small font-semibold text-success-text">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  All issues resolved
                </span>
              )}
            </div>
            <div className="flex items-center gap-md">
              <button
                type="button"
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="px-lg h-10 border border-grey-300 text-grey-700 font-medium rounded-lg hover:bg-grey-50 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saveMutation.isPending ? (
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    progress_activity
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">save</span>
                )}
                Save Progress
              </button>
              <button
                type="button"
                onClick={() => submitMutation.mutate()}
                disabled={unresolvedFlags.length > 0 || submitMutation.isPending}
                className="px-xl h-10 bg-primary text-white font-semibold rounded-lg hover:bg-primary-container transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitMutation.isPending ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">
                      progress_activity
                    </span>
                    Submitting…
                  </>
                ) : (
                  <>
                    Submit Application
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

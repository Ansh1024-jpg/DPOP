import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuthStore } from '../../store/authStore'
import { deleteApplication, getMyApplicationHistory, logout as logoutApi } from '../../services/api'
import StatusBadge from '../../components/StatusBadge'

const RISK_COLOR: Record<string, string> = {
  low: 'text-green-600',
  medium: 'text-orange-500',
  high: 'text-red-600',
}

export default function ApplicationHistory() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logoutStore = useAuthStore((s) => s.logout)
  const queryClient = useQueryClient()
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [apiError, setApiError] = useState('')

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ['myApplicationHistory', user?.user_id],
    queryFn: () => getMyApplicationHistory(user!.user_id),
    enabled: !!user,
    retry: false,
  })

  const deleteMutation = useMutation({
    mutationFn: (appId: number) => deleteApplication(user!.user_id, appId),
    onSuccess: (_data, appId) => {
      queryClient.removeQueries({ queryKey: ['myApplication', user?.user_id] })
      queryClient.removeQueries({ queryKey: ['application', appId] })
      queryClient.invalidateQueries({ queryKey: ['myApplicationHistory', user?.user_id] })
      setConfirmDeleteId(null)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setApiError(msg || 'Could not delete the application. Please try again.')
      setConfirmDeleteId(null)
    },
  })

  async function handleLogout() {
    await logoutApi().catch(() => {})
    logoutStore()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full h-16 bg-[#1E3A5F] text-white flex items-center justify-between px-6 z-50 shadow-sm border-b border-white/10">
        <div className="flex items-center gap-8">
          <span className="text-lg font-bold">InsureTrust</span>
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate('/applicant/upload')}
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              My Application
            </button>
            <span className="text-sm text-white font-semibold border-b border-white/60 pb-0.5">
              History
            </span>
            <a className="text-sm text-slate-300 hover:text-white transition-colors">Support</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-300 hidden sm:block">{user?.full_name}</span>
          <button
            onClick={() => navigate('/applicant/upload')}
            className="p-2 rounded-full hover:bg-white/10 transition-all"
            aria-label="Go to upload page"
            title="Upload page"
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
        <div className="max-w-4xl mx-auto px-6 py-3xl">
          {/* Page header */}
          <div className="mb-2xl flex items-start justify-between">
            <div>
              <p className="font-label-overline text-label-overline text-grey-400 uppercase tracking-widest mb-xs">
                My Account
              </p>
              <h1 className="font-display-title text-display-title text-grey-900">
                Application History
              </h1>
              <p className="font-body-regular text-grey-600 mt-sm">
                All your insurance applications, past and present.
              </p>
            </div>
            <button
              onClick={() => navigate('/applicant/upload')}
              className="px-lg h-10 bg-primary text-white font-semibold rounded-lg hover:bg-primary-container transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Application
            </button>
          </div>

          {apiError && (
            <div className="mb-lg p-md bg-danger-bg border border-danger-border rounded-lg flex items-start gap-sm">
              <span className="material-symbols-outlined text-danger-text text-[18px] mt-0.5">
                error
              </span>
              <p className="font-body-small text-danger-text">{apiError}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-4xl">
              <span className="material-symbols-outlined text-[48px] text-accent animate-spin">
                progress_activity
              </span>
            </div>
          ) : apps.length === 0 ? (
            <div className="bg-surface-container-lowest border border-grey-200 rounded-xl p-4xl text-center shadow-card">
              <span
                className="material-symbols-outlined text-[64px] text-grey-300"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                description
              </span>
              <p className="font-card-heading text-grey-600 mt-lg">No applications yet</p>
              <p className="font-body-small text-grey-400 mt-sm">
                Upload your first insurance application to get started.
              </p>
              <button
                onClick={() => navigate('/applicant/upload')}
                className="mt-xl px-xl h-10 bg-primary text-white font-semibold rounded-lg hover:bg-primary-container transition-all inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                Upload Application
              </button>
            </div>
          ) : (
            <div className="space-y-lg">
              {apps.map((app) => {
                const isConfirming = confirmDeleteId === app.id
                const isPendingThisDelete = deleteMutation.isPending && confirmDeleteId === app.id

                return (
                  <div
                    key={app.id}
                    className="bg-surface-container-lowest border border-grey-200 rounded-xl p-lg shadow-card"
                  >
                    <div className="flex items-start justify-between gap-md">
                      <div className="flex items-start gap-md flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-primary text-[20px]">
                            description
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-sm flex-wrap">
                            <span className="font-card-heading text-grey-900">
                              Application #{app.id}
                            </span>
                            <StatusBadge status={app.status} size="sm" />
                            {app.risk_level && (
                              <span
                                className={`text-xs font-semibold capitalize ${RISK_COLOR[app.risk_level] ?? 'text-grey-500'}`}
                              >
                                {app.risk_level} risk
                              </span>
                            )}
                          </div>
                          <p className="font-body-small text-grey-500 mt-0.5">
                            {app.submitted_at
                              ? `Submitted ${new Date(app.submitted_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}`
                              : 'Not yet submitted'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-sm flex-shrink-0">
                        {isConfirming ? (
                            <div className="flex items-center gap-sm bg-red-50 border border-red-200 rounded-lg px-md py-sm">
                              <span className="font-body-small text-red-700 font-semibold whitespace-nowrap">
                                Delete app #{app.id}?
                              </span>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-sm h-8 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-all text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteMutation.mutate(app.id)}
                                disabled={isPendingThisDelete}
                                className="px-sm h-8 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all flex items-center gap-1.5 text-sm disabled:opacity-50"
                              >
                                {isPendingThisDelete ? (
                                  <span className="material-symbols-outlined text-[15px] animate-spin">
                                    progress_activity
                                  </span>
                                ) : (
                                  <span className="material-symbols-outlined text-[15px]">
                                    delete_forever
                                  </span>
                                )}
                                Delete
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setApiError('')
                                setConfirmDeleteId(app.id)
                              }}
                              className="p-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all"
                              aria-label={`Delete application ${app.id}`}
                              title="Delete this application"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        <button
                          type="button"
                          onClick={() => navigate(`/applicant/review/${app.id}`)}
                          className="px-md h-9 bg-primary text-white font-medium rounded-lg hover:bg-primary-container transition-all flex items-center gap-1.5 text-sm"
                        >
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

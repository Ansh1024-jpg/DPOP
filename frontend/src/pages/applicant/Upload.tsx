import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuthStore } from '../../store/authStore'
import { uploadApplication, getMyApplication, deleteApplication, logout } from '../../services/api'

export default function Upload() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logoutStore = useAuthStore((s) => s.logout)
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [apiError, setApiError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { data: existingApp } = useQuery({
    queryKey: ['myApplication', user?.user_id],
    queryFn: () => getMyApplication(user!.user_id),
    enabled: !!user,
    retry: false,
  })


  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png'] },
    maxFiles: 1,
  })

  const uploadMutation = useMutation({
    mutationFn: (f: File) => uploadApplication(user!.user_id, f),
    onSuccess: (app) => {
      navigate(`/applicant/review/${app.id}`)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setApiError(msg || 'Upload failed. Please try again.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (appId: number) => deleteApplication(user!.user_id, appId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['myApplication', user?.user_id] })
      setConfirmDelete(false)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setApiError(msg || 'Could not delete the application. Please try again.')
      setConfirmDelete(false)
    },
  })

  async function handleLogout() {
    await logout().catch(() => {})
    logoutStore()
    navigate('/login', { replace: true })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setApiError('')
    uploadMutation.mutate(file)
  }

  const steps = [
    { label: 'Create Account', done: true },
    { label: 'Upload Documents', active: true },
    { label: 'Complete Questionnaire', done: false },
    { label: 'Review & Sign', done: false },
    { label: 'Policy Issued', done: false },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-white/10 transition-all"
            aria-label="Logout"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </header>

      <main className="pt-16 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-3xl">
          {/* Page header */}
          <div className="mb-3xl">
            <p className="font-label-overline text-label-overline text-grey-400 uppercase tracking-widest mb-xs">
              New Application
            </p>
            <h1 className="font-display-title text-display-title text-grey-900">
              Upload Your Documents
            </h1>
            <p className="font-body-regular text-grey-600 mt-sm">
              Submit your insurance application documents for AI-assisted review and processing.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-2xl">
            {/* Main upload area */}
            <div className="lg:col-span-2 space-y-2xl">
              {/* Existing application notice */}
              {existingApp && (
                <div className="bg-warning-bg border border-warning-border rounded-xl p-lg space-y-md">
                  <div className="flex items-start gap-md">
                    <span className="material-symbols-outlined text-warning-text text-[20px] flex-shrink-0">info</span>
                    <div className="flex-1">
                      <p className="font-body-small font-semibold text-warning-text">
                        You already have an active application (#{existingApp.id})
                      </p>
                      <p className="font-body-small text-warning-text/80 mt-0.5">
                        Continue editing your existing application, or discard it to start a new one.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/applicant/review/${existingApp.id}`)}
                      className="px-md h-9 bg-warning-text text-white font-medium rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5 flex-shrink-0 text-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      View Application
                    </button>
                  </div>

                  {/* Discard / confirm row — available for all statuses */}
                  {confirmDelete ? (
                    <div className="flex items-center gap-md pt-sm border-t border-warning-border">
                      <p className="font-body-small text-warning-text flex-1">
                        Are you sure? This will permanently delete application #{existingApp.id} and cannot be undone.
                      </p>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="px-md h-8 border border-warning-border text-warning-text font-medium rounded-lg hover:bg-warning-border/20 transition-all text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(existingApp.id)}
                        disabled={deleteMutation.isPending}
                        className="px-md h-8 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all flex items-center gap-1.5 text-sm disabled:opacity-50"
                      >
                        {deleteMutation.isPending ? (
                          <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined text-[15px]">delete_forever</span>
                        )}
                        Yes, delete it
                      </button>
                    </div>
                  ) : (
                    <div className="pt-sm border-t border-warning-border flex justify-end">
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="px-md h-8 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-all flex items-center gap-1.5 text-sm"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                        Discard &amp; start fresh
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Dropzone */}
              <div className="bg-surface-container-lowest border border-grey-200 rounded-xl p-2xl shadow-card">
                <h2 className="font-card-heading text-card-heading text-grey-900 mb-lg">
                  Application Document
                </h2>

                {apiError && (
                  <div className="mb-lg p-md bg-danger-bg border border-danger-border rounded-lg flex items-start gap-sm">
                    <span className="material-symbols-outlined text-danger-text text-[18px] mt-0.5">error</span>
                    <p className="font-body-small text-danger-text">{apiError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-4xl flex flex-col items-center justify-center gap-md cursor-pointer transition-all ${
                      isDragActive
                        ? 'border-accent bg-info-bg'
                        : file
                          ? 'border-success-border bg-success-bg'
                          : 'border-grey-300 bg-grey-50 hover:border-accent hover:bg-info-bg/30'
                    }`}
                  >
                    <input {...getInputProps()} aria-label="Upload document" />
                    <span
                      className={`material-symbols-outlined text-[48px] ${
                        file ? 'text-success-text' : isDragActive ? 'text-accent' : 'text-grey-400'
                      }`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {file ? 'check_circle' : 'cloud_upload'}
                    </span>
                    {file ? (
                      <div className="text-center">
                        <p className="font-card-heading text-success-text">{file.name}</p>
                        <p className="font-body-small text-grey-400 mt-xs">
                          {(file.size / 1024).toFixed(1)} KB — click to change
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="font-card-heading text-grey-700">
                          {isDragActive ? 'Drop your file here' : 'Drag and drop your document'}
                        </p>
                        <p className="font-body-small text-grey-400 mt-xs">
                          Supports PDF, JPG, PNG — max 10 MB
                        </p>
                      </div>
                    )}
                  </div>

                  {!file && (
                    <div className="mt-lg flex justify-center">
                      <button
                        type="button"
                        onClick={() => (document.querySelector('input[type=file]') as HTMLInputElement)?.click()}
                        className="px-xl h-10 border border-grey-300 text-grey-700 font-medium rounded-lg hover:bg-grey-50 transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">folder_open</span>
                        Browse Files
                      </button>
                    </div>
                  )}

                  {/* Verification requirements */}
                  <div className="mt-2xl bg-info-bg border border-info-border rounded-xl p-lg">
                    <div className="flex items-center gap-sm mb-md">
                      <span className="material-symbols-outlined text-info-text text-[20px]">info</span>
                      <h3 className="font-card-heading text-card-heading text-info-text">
                        Verification Requirements
                      </h3>
                    </div>
                    <ul className="space-y-sm">
                      {[
                        'Government-issued photo ID (Aadhaar, Passport, or PAN card)',
                        'Insurance application form (filled and signed)',
                        'Recent utility bill or bank statement for address proof',
                        'Income proof document (last 3 months salary slips or ITR)',
                      ].map((req) => (
                        <li key={req} className="flex items-start gap-sm font-body-small text-info-text">
                          <span className="material-symbols-outlined text-[16px] mt-0.5 flex-shrink-0">check_circle</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Footer action bar */}
                  <div className="mt-2xl flex items-center justify-between pt-lg border-t border-grey-100">
                    <button
                      type="button"
                      className="px-lg h-10 border border-grey-200 text-grey-600 font-medium rounded-lg hover:bg-grey-50 transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                      Previous Step
                    </button>
                    <div className="flex items-center gap-md">
                      <button
                        type="button"
                        className="px-lg h-10 border border-grey-200 text-grey-600 font-medium rounded-lg hover:bg-grey-50 transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">save</span>
                        Save Draft
                      </button>
                      <button
                        type="submit"
                        disabled={!file || uploadMutation.isPending}
                        className="px-xl h-10 bg-primary text-white font-semibold rounded-lg hover:bg-primary-container transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploadMutation.isPending ? (
                          <>
                            <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                            Processing…
                          </>
                        ) : (
                          <>
                            Continue to Questionnaire
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-2xl">
              {/* Progress card */}
              <div className="bg-surface-container-lowest border border-grey-200 rounded-xl p-2xl shadow-card">
                <h3 className="font-card-heading text-card-heading text-grey-900 mb-md">
                  Application Progress
                </h3>
                <div className="flex items-center justify-between mb-lg">
                  <span className="font-body-small text-grey-500">Step 2 of 5</span>
                  <span className="font-body-small font-semibold text-accent">40%</span>
                </div>
                <div className="h-1.5 bg-grey-100 rounded-full mb-xl">
                  <div className="h-1.5 bg-accent rounded-full" style={{ width: '40%' }} />
                </div>
                <ol className="space-y-md">
                  {steps.map((step, i) => (
                    <li key={step.label} className="flex items-center gap-md">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                          step.done
                            ? 'bg-success-bg border-2 border-success-border text-success-text'
                            : step.active
                              ? 'bg-primary text-white'
                              : 'bg-grey-100 text-grey-400 border-2 border-grey-200'
                        }`}
                      >
                        {step.done ? (
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        ) : (
                          i + 1
                        )}
                      </div>
                      <span
                        className={`font-body-small ${
                          step.active ? 'text-primary font-semibold' : step.done ? 'text-grey-500' : 'text-grey-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* AI Quick Audit card */}
              <div className="bg-primary rounded-xl p-2xl text-white">
                <div className="flex items-center gap-sm mb-md">
                  <span className="material-symbols-outlined text-[20px] text-accent">smart_toy</span>
                  <h3 className="font-card-heading text-card-heading text-white">AI Quick Audit</h3>
                </div>
                <p className="font-body-small text-slate-300">
                  Our AI engine will automatically extract and validate your document fields, flagging
                  any issues that need correction before review.
                </p>
                <div className="mt-lg space-y-sm">
                  {['Field extraction', 'Format validation', 'Risk assessment'].map((item) => (
                    <div key={item} className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-[14px] text-accent">check_circle</span>
                      <span className="font-body-small text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security banner */}
              <div className="bg-info-bg border border-info-border rounded-xl p-lg flex items-start gap-md">
                <span className="material-symbols-outlined text-info-text text-[20px] flex-shrink-0">lock</span>
                <div>
                  <p className="font-body-small font-semibold text-info-text">256-bit Encrypted</p>
                  <p className="font-body-small text-info-text/80">
                    Your documents are encrypted end-to-end and stored securely.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

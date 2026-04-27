import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { login as apiLogin } from '../services/api'
import { useAuthStore } from '../store/authStore'
import type { AuthUser } from '../types/index'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

function roleRedirect(role: AuthUser['role']): string {
  if (role === 'applicant') return '/applicant/upload'
  if (role === 'policy_manager') return '/policy-manager/dashboard'
  return '/manager/dashboard'
}

export default function Login() {
  const navigate = useNavigate()
  const storeLogin = useAuthStore((s) => s.login)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginFormValues) {
    setApiError(null)
    try {
      const user = await apiLogin(values.username, values.password)
      storeLogin(user)
      navigate(roleRedirect(user.role), { replace: true })
    } catch {
      setApiError('Invalid username or password. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-grey-50 flex items-center justify-center font-body-regular text-on-surface">
      {/* Decorative gradients */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_top_right,rgba(30,58,95,0.03),transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.03),transparent_70%)]" />
      </div>

      <div className="w-full max-w-[420px] px-lg">
        {/* Auth card */}
        <main className="bg-surface-container-lowest border border-grey-200 rounded-xl shadow-login-card p-2xl">
          {/* Logo / Brand */}
          <div className="flex flex-col items-center mb-3xl">
            <div className="w-12 h-12 bg-primary-container flex items-center justify-center rounded-lg mb-lg">
              <span
                className="material-symbols-outlined text-white text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shield
              </span>
            </div>
            <h1 className="font-display-title text-display-title text-primary tracking-tight">
              InsureTrust
            </h1>
            <p className="font-body-small text-body-small text-grey-600 mt-xs">
              Enterprise Risk Management Portal
            </p>
          </div>

          {/* Header */}
          <div className="mb-2xl">
            <h2 className="font-section-heading text-[24px] font-semibold text-grey-900">
              Welcome back
            </h2>
            <p className="font-body-regular text-body-regular text-grey-600 mt-xs">
              Please enter your credentials to access the suite.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-lg">
            <div className="space-y-xs">
              <label
                htmlFor="username"
                className="font-label-overline text-label-overline text-grey-600"
              >
                USERNAME
              </label>
              <input
                id="username"
                type="text"
                placeholder="e.g. j.smith@insuretrust.com"
                autoComplete="username"
                {...register('username')}
                className="w-full h-10 px-md bg-surface-container-lowest border border-grey-300 rounded focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all font-body-regular text-body-regular placeholder:text-grey-400"
                aria-describedby={errors.username ? 'username-error' : undefined}
              />
              {errors.username && (
                <p id="username-error" className="font-body-small text-body-small text-error mt-xs">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-xs">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="font-label-overline text-label-overline text-grey-600"
                >
                  PASSWORD
                </label>
                <a
                  href="#"
                  className="font-body-small text-body-small text-accent hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register('password')}
                className="w-full h-10 px-md bg-surface-container-lowest border border-grey-300 rounded focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all font-body-regular text-body-regular placeholder:text-grey-400"
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && (
                <p id="password-error" className="font-body-small text-body-small text-error mt-xs">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-sm py-xs">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 text-primary border-grey-300 rounded focus:ring-accent"
              />
              <label htmlFor="remember" className="font-body-small text-body-small text-grey-600">
                Keep me logged in for 30 days
              </label>
            </div>

            {apiError && (
              <div
                role="alert"
                className="bg-danger-bg border border-danger-border rounded px-md py-sm font-body-small text-body-small text-danger-text"
              >
                {apiError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 bg-primary text-white font-card-heading text-card-heading rounded hover:bg-primary-container transition-colors shadow-sm active:scale-[0.99] mt-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Footnote */}
          <div className="mt-3xl pt-2xl border-t border-grey-100 text-center">
            <p className="font-body-small text-body-small text-grey-400">
              By signing in, you agree to our{' '}
              <a href="#" className="text-grey-600 hover:text-primary underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-grey-600 hover:text-primary underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </main>

        {/* Footer disclaimer */}
        <footer className="mt-2xl text-center">
          <p className="font-body-small text-body-small text-grey-400 max-w-[340px] mx-auto leading-relaxed">
            Authorized Personnel Only. Access is monitored and recorded for institutional compliance
            and security auditing.
          </p>
          <div className="mt-lg flex justify-center space-x-lg">
            <span className="font-label-overline text-label-overline text-grey-300">
              PCI DSS COMPLIANT
            </span>
            <span className="font-label-overline text-label-overline text-grey-300">
              SOC2 TYPE II
            </span>
            <span className="font-label-overline text-label-overline text-grey-300">ISO 27001</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

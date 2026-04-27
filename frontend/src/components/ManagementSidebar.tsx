import { useNavigate } from 'react-router-dom'

import { useAuthStore } from '../store/authStore'
import { logout } from '../services/api'

interface ManagementSidebarProps {
  activeItem: 'dashboard' | 'applications' | 'policy-review' | 'underwriting' | 'risk' | 'settings'
  hasTopBar?: boolean
}

export default function ManagementSidebar({ activeItem, hasTopBar = false }: ManagementSidebarProps) {
  const navigate = useNavigate()
  const logoutStore = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)

  async function handleLogout() {
    await logout().catch(() => {})
    logoutStore()
    navigate('/login', { replace: true })
  }

  const navItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard', href: user?.role === 'manager' ? '/manager/dashboard' : '/policy-manager/dashboard' },
    { id: 'applications', icon: 'description', label: 'Applications', href: user?.role === 'manager' ? '/manager/dashboard' : '/policy-manager/dashboard' },
    { id: 'policy-review', icon: 'verified_user', label: 'Policy Review', href: '#' },
    { id: 'underwriting', icon: 'analytics', label: 'Underwriting', href: '#' },
    { id: 'risk', icon: 'warning', label: 'Risk Analysis', href: '#' },
    { id: 'settings', icon: 'settings', label: 'Settings', href: '#' },
  ]

  return (
    <aside
      className={`fixed left-0 h-screen flex flex-col bg-[#1E3A5F] text-white w-[240px] border-r border-slate-700 font-['Inter'] text-sm font-medium z-40 ${
        hasTopBar ? 'top-16' : 'top-0 py-6'
      }`}
    >
      {!hasTopBar && (
        <div className="text-xl font-black text-white px-4 mb-8">Management Portal</div>
      )}
      {hasTopBar && (
        <div className="text-xl font-black text-white px-4 py-6 mb-2">Management Portal</div>
      )}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = item.id === activeItem
          return (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => {
                if (item.href !== '#') {
                  e.preventDefault()
                  navigate(item.href)
                }
              }}
              className={`flex items-center gap-3 px-3 py-2 transition-all rounded ${
                isActive
                  ? 'bg-white/10 text-white border-l-[3px] border-[#0EA5E9] rounded-none'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          )
        })}
      </nav>
      <div className="px-3 mt-auto border-t border-white/10 pt-4 space-y-1">
        <a className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white transition-all rounded" href="#">
          <span className="material-symbols-outlined text-[20px]">help</span>
          <span>Help Center</span>
        </a>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white transition-all rounded"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

import type { ApplicationStatusType } from '../types/index'

interface StatusBadgeProps {
  status: ApplicationStatusType
  size?: 'sm' | 'md'
}

const STATUS_CONFIG: Record<ApplicationStatusType, { dot: string; text: string; bg: string; border: string; label: string }> = {
  submitted: { dot: 'bg-grey-400', text: 'text-grey-600', bg: 'bg-grey-100', border: 'border-grey-300', label: 'Submitted' },
  under_ai_review: { dot: 'bg-info-text', text: 'text-info-text', bg: 'bg-info-bg', border: 'border-info-border', label: 'AI Review' },
  flagged: { dot: 'bg-warning-text', text: 'text-warning-text', bg: 'bg-warning-bg', border: 'border-warning-border', label: 'Flagged' },
  corrections_made: { dot: 'bg-info-text', text: 'text-info-text', bg: 'bg-info-bg', border: 'border-info-border', label: 'Corrections Made' },
  pending_review: { dot: 'bg-orange-text', text: 'text-orange-text', bg: 'bg-orange-bg', border: 'border-orange-border', label: 'Pending Review' },
  escalated: { dot: 'bg-escalated-text', text: 'text-escalated-text', bg: 'bg-escalated-bg', border: 'border-escalated-border', label: 'Escalated' },
  approved: { dot: 'bg-success-text', text: 'text-success-text', bg: 'bg-success-bg', border: 'border-success-border', label: 'Approved' },
  rejected: { dot: 'bg-danger-text', text: 'text-danger-text', bg: 'bg-danger-bg', border: 'border-danger-border', label: 'Rejected' },
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.submitted
  const padding = size === 'md' ? 'px-3 py-1.5' : 'px-2.5 py-1'
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${padding} rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

import React from 'react';
import { CheckCircle2, XCircle, HelpCircle, AlertCircle } from 'lucide-react';
import { VerdictType } from '../../types';

interface VerdictBadgeProps {
  verdict: VerdictType;
  customText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({
  verdict,
  customText,
  size = 'md'
}) => {
  let bg = '';
  let border = '';
  let text = '';
  let icon = null;
  let label = customText;

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;

  switch (verdict) {
    case 'YES':
      bg = 'bg-[#F0FDF4] dark:bg-[#052E16]';
      border = 'border-[#BBF7D0] dark:border-[#166534]';
      text = 'text-[#15803D] dark:text-[#4ADE80]';
      icon = <CheckCircle2 size={iconSize} className="shrink-0" />;
      label = label || 'FITS YOU / COMPATIBLE';
      break;

    case 'NO':
      bg = 'bg-[#FEF2F2] dark:bg-[#450A0A]';
      border = 'border-[#FECACA] dark:border-[#991B1B]';
      text = 'text-[#B91C1C] dark:text-[#F87171]';
      icon = <XCircle size={iconSize} className="shrink-0" />;
      label = label || 'WILL NOT FIT / INCOMPATIBLE';
      break;

    case 'CANNOT_CONFIRM':
    default:
      bg = 'bg-[#FFFBEB] dark:bg-[#451A03]';
      border = 'border-[#FDE68A] dark:border-[#92400E]';
      text = 'text-[#B45309] dark:text-[#FBBF24]';
      icon = <HelpCircle size={iconSize} className="shrink-0" />;
      label = label || 'CANNOT CONFIRM';
      break;
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs font-semibold gap-1'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm font-bold gap-2'
      : 'px-2.5 py-1 text-xs sm:text-sm font-semibold gap-1.5';

  return (
    <span
      data-testid="verdict-badge"
      className={`inline-flex items-center rounded-full border ${bg} ${border} ${text} ${sizeClasses} shadow-sm transition-transform duration-subtle animate-in fade-in zoom-in-95`}
    >
      {icon}
      <span className="tracking-wide uppercase font-mono">{label}</span>
    </span>
  );
};

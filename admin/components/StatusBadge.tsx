import React from 'react';
import { LoanStatus } from '../../types';

interface Props {
  status: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  [LoanStatus.Submitted]: { label: 'بررسی اولیه', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  [LoanStatus.IdentityCheck]: { label: 'بررسی شاهکار', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  [LoanStatus.RejectedByShahkar]: { label: 'رد شاهکار', className: 'bg-red-50 text-red-700 border-red-200' },
  [LoanStatus.WaitingForLetter]: { label: 'منتظر معرفی‌نامه', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  [LoanStatus.LetterIssued]: { label: 'معرفی‌نامه صادر شد', className: 'bg-teal-50 text-teal-700 border-teal-200' },
  [LoanStatus.WaitingForBankApproval]: { label: 'بررسی بانک', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  [LoanStatus.LoanPaid]: { label: 'پرداخت شده', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  [LoanStatus.Closed]: { label: 'بسته شده', className: 'bg-slate-50 text-slate-600 border-slate-200' },
};

const StatusBadge: React.FC<Props> = ({ status }) => {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${config.className} whitespace-nowrap`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
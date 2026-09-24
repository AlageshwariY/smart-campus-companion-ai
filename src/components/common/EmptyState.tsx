import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Available',
  message,
  icon = <FolderOpen className="w-12 h-12 text-slate-500" />,
  actionText,
  onAction
}) => {
  return (
    <div className="glass-card rounded-xl p-8 text-center flex flex-col items-center justify-center my-4 border border-dashed border-slate-700/60">
      <div className="p-3 bg-slate-800/60 rounded-full mb-3 text-slate-400">
        {icon}
      </div>
      <h4 className="text-base font-semibold text-slate-200 mb-1">{title}</h4>
      <p className="text-sm text-slate-400 max-w-sm mb-4">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-md hover:shadow-indigo-500/20"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

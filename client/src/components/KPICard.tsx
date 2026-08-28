import React from 'react';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  trend?: number;
  isUp?: boolean;
  comparisonText?: string;
  statusText?: string;
  statusType?: 'ok' | 'warning' | 'danger';
  icon: LucideIcon;
  accentColor?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple' | 'blue';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  trend,
  isUp = true,
  comparisonText = 'compared with previous period',
  statusText,
  statusType,
  icon: Icon,
  accentColor = 'indigo'
}) => {
  const accentClasses = {
    indigo: 'from-indigo-600/20 to-purple-600/10 text-indigo-400 border-indigo-500/20',
    emerald: 'from-emerald-600/20 to-teal-600/10 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-600/20 to-orange-600/10 text-amber-400 border-amber-500/20',
    rose: 'from-rose-600/20 to-red-600/10 text-rose-400 border-rose-500/20',
    purple: 'from-purple-600/20 to-pink-600/10 text-purple-400 border-purple-500/20',
    blue: 'from-blue-600/20 to-cyan-600/10 text-blue-400 border-blue-500/20'
  };

  const iconBgClasses = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  };

  return (
    <div className="glass-card p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
      {/* Background Gradient Spot */}
      <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full bg-gradient-to-br ${accentClasses[accentColor]} blur-2xl pointer-events-none`} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
          <div className={`p-2.5 rounded-xl border ${iconBgClasses[accentColor]}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-1 my-1">
          {prefix && <span className="text-lg font-bold text-slate-300">{prefix}</span>}
          <span className="text-2xl font-black text-white tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {suffix && <span className="text-xs text-slate-400 font-medium ml-1">{suffix}</span>}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        {trend !== undefined ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center font-bold px-2 py-0.5 rounded-md ${
              isUp 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {isUp ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              {Math.abs(trend)}%
            </span>
            <span className="text-[11px] text-slate-400 font-medium">{comparisonText}</span>
          </div>
        ) : statusText ? (
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
            statusType === 'danger' 
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
              : statusType === 'warning' 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            {statusText}
          </span>
        ) : (
          <span className="text-[11px] text-slate-500">Live Metric</span>
        )}
      </div>
    </div>
  );
};

export default function StatCard({ title, value, change, icon, accentColor = 'amber' }) {
  const accentClasses = {
    amber: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/20',
    indigo: 'from-indigo-500/20 to-purple-500/10 text-indigo-400 border-indigo-500/20',
    emerald: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/20',
    rose: 'from-rose-500/20 to-pink-500/10 text-rose-400 border-rose-500/20',
  }[accentColor] || 'from-slate-800 to-slate-800 text-slate-300 border-slate-700';

  return (
    <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-600/80 transition-all shadow-sm hover:shadow-md group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accentClasses} border flex items-center justify-center text-xl shadow-inner`}>
          {icon}
        </div>
      </div>
      {change && (
        <div className="mt-3 flex items-center text-xs">
          <span className="text-emerald-500 dark:text-emerald-400 font-semibold flex items-center">
            ↑ {change}
          </span>
          <span className="text-slate-500 ml-1.5">vs last month</span>
        </div>
      )}
    </div>
  );
}

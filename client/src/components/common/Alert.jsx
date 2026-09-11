import React from 'react'

const iconPaths = {
  error: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
}

const styles = {
  error: {
    bg: 'bg-rose-500/8 border-rose-500/25',
    text: 'text-rose-300',
    icon: 'text-rose-400',
  },
  success: {
    bg: 'bg-emerald-500/8 border-emerald-500/25',
    text: 'text-emerald-300',
    icon: 'text-emerald-400',
  },
  warning: {
    bg: 'bg-amber-500/8 border-amber-500/25',
    text: 'text-amber-300',
    icon: 'text-amber-400',
  },
  info: {
    bg: 'bg-sky-500/8 border-sky-500/25',
    text: 'text-sky-300',
    icon: 'text-sky-400',
  },
}

export const Alert = ({ type = 'error', message, onClose }) => {
  if (!message) return null

  const style = styles[type] || styles.error
  const iconPath = iconPaths[type] || iconPaths.error

  return (
    <div className={`p-3.5 rounded-xl border text-sm flex items-start justify-between gap-3 mb-4 ${style.bg} ${style.text}`}>
      <div className="flex items-start gap-2.5">
        <svg className={`w-5 h-5 shrink-0 mt-0.5 ${style.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPath} />
        </svg>
        <span className="leading-relaxed">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current opacity-50 hover:opacity-100 p-0.5 transition-opacity shrink-0 cursor-pointer"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default Alert

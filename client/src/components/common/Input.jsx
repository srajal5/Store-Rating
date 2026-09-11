import React from 'react'

export const Input = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helpText,
  disabled = false,
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label} {required && <span className="text-rose-500 dark:text-rose-400">*</span>}
        </label>
      )}
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full px-3.5 py-2.5 bg-white dark:bg-slate-900/60 border text-slate-900 dark:text-slate-100 rounded-xl text-sm transition-all duration-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none ${
          error
            ? 'border-rose-500/60 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
            : 'border-slate-300 dark:border-slate-700/60 hover:border-slate-400 dark:hover:border-slate-600/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      {error && <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400 flex items-center gap-1">
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
        </svg>
        {error}
      </p>}
      {helpText && !error && <p className="mt-1.5 text-xs text-slate-500">{helpText}</p>}
    </div>
  )
}

export default Input

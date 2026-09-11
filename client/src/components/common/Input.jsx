import React from 'react'

export const Input = ({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helpText,
  disabled = false,
  autoComplete,
  minLength,
  maxLength,
  className = '',
}) => {
  const inputId = id || name

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name || id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        minLength={minLength}
        maxLength={maxLength}
        className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm transition-colors focus:outline-none ${
          error
            ? 'border-rose-300 dark:border-rose-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
            : 'border-slate-300 dark:border-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 hover:border-slate-400 dark:hover:border-slate-600'
        } ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''} ${className}`}
      />
      {error && (
        <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{helpText}</p>
      )}
    </div>
  )
}

export default Input

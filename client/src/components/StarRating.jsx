import React, { useState } from 'react'

export const StarRating = ({
  value = 0,
  onChange,
  disabled = false,
  size = 'md',
}) => {
  const [hoverValue, setHoverValue] = useState(0)

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  }

  const activeValue = hoverValue || value

  return (
    <div className="inline-flex items-center gap-0.5 select-none" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= activeValue
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange && onChange(star)}
            onMouseEnter={() => !disabled && setHoverValue(star)}
            onMouseLeave={() => !disabled && setHoverValue(0)}
            className={`p-0.5 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 transition-transform ${
              disabled ? 'cursor-default' : 'cursor-pointer hover:scale-105'
            }`}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <svg
              className={`${sizeClasses[size] || sizeClasses.md} ${
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-300 dark:text-slate-600 fill-transparent'
              }`}
              viewBox="0 0 20 20"
              stroke="currentColor"
              strokeWidth="0.8"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}

export default StarRating

import React from 'react'

export const Loading = ({ text = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-10 h-10 border-2 border-slate-200 dark:border-slate-700 rounded-full" />
        <div className="w-10 h-10 border-2 border-transparent border-t-indigo-600 dark:border-t-indigo-500 rounded-full absolute inset-0 animate-spin" />
      </div>
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{text}</span>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        {content}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-16 w-full">
      {content}
    </div>
  )
}

export default Loading

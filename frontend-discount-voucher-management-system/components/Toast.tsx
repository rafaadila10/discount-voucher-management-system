'use client'
import { create } from 'zustand'
import { useEffect } from 'react'

type ToastState = {
  message: string | null
  type: 'success' | 'error' | null
  show: (message: string, type?: 'success' | 'error') => void
  clear: () => void
}

export const useToast = create<ToastState>((set) => ({
  message: null,
  type: null,
  show: (message, type = 'success') => set({ message, type }),
  clear: () => set({ message: null, type: null })
}))

export function Toast() {
  const { message, type, clear } = useToast()

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => clear(), 2500)
    return () => clearTimeout(t)
  }, [message])

  if (!message) return null

  return (
    <div className={`fixed top-6 right-6 px-4 py-2 rounded shadow text-white z-50 transition-all
      ${type === 'error' ? 'bg-red-600' : 'bg-green-600'}
    `}>
      {message}
    </div>
  )
}

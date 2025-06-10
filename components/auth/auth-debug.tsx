'use client'

import { useAuth } from '@/lib/auth/auth-provider'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function AuthDebug() {
  const { user, loading, initialized } = useAuth()
  const [supabaseUser, setSupabaseUser] = useState<any>(null)
  const [supabaseSession, setSupabaseSession] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: { session } } = await supabase.auth.getSession()
      setSupabaseUser(user)
      setSupabaseSession(session)
    }

    checkAuth()
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>Provider User: {user ? '✅' : '❌'} {user?.email}</div>
        <div>Provider Loading: {loading ? '⏳' : '✅'}</div>
        <div>Provider Initialized: {initialized ? '✅' : '❌'}</div>
        <div>Supabase User: {supabaseUser ? '✅' : '❌'} {supabaseUser?.email}</div>
        <div>Supabase Session: {supabaseSession ? '✅' : '❌'}</div>
        <div>Path: {typeof window !== 'undefined' ? window.location.pathname : 'server'}</div>
      </div>
    </div>
  )
} 
'use client'

import { useAuth } from '@/lib/auth/auth-provider'

export function AuthDebug() {
  const { user, profile, loading } = useAuth()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>Loading: {loading ? 'true' : 'false'}</div>
        <div>User: {user ? 'Connected' : 'Not connected'}</div>
        <div>User ID: {user?.id || 'None'}</div>
        <div>Email: {user?.email || 'None'}</div>
        <div>Profile: {profile ? 'Loaded' : 'Not loaded'}</div>
        <div>Profile Name: {profile?.full_name || 'None'}</div>
        <div>Role: {profile?.role || 'None'}</div>
      </div>
    </div>
  )
} 
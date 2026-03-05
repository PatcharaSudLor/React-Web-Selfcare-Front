import { Navigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { loading } = useUser()
    const [session, setSession] = useState<any>(null)
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session)
            setChecked(true)
        })
    }, [])

    if (loading || !checked) return (
        <div className="fixed inset-0 flex items-center justify-center bg-white">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    if (!session) return <Navigate to="/" replace />

    return <>{children}</>
}
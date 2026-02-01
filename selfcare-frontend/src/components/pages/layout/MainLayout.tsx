import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Header from './Header'
import Sidebar from './SideBar'
import { useUser } from '../../../contexts/UserContext'

interface MainLayoutProps {
    currentPage?: string
    onNavigate?: (page: string) => void
    onLogout?: () => void
}

export default function MainLayout({
    currentPage = 'home',
    onNavigate = () => { },
    onLogout = () => { }
}: MainLayoutProps) {
    const navigate = useNavigate()
    const { clearUserInfo } = useUser()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const handleProfileClick = () => {
        onNavigate('profile')
        navigate('/profile')
    }

    const handleLogout = () => {
        // Clear user context
        clearUserInfo()
        // Call parent logout
        onLogout()
        // Navigate to login/home
        navigate('/')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <Header
                onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                onProfileClick={handleProfileClick}
            />

            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                currentPage={currentPage}
                onNavigate={(page) => {
                    onNavigate(page)
                    setIsSidebarOpen(false)
                }}
                onLogout={handleLogout}
            />

            {/* Main Content */}
            <main className="pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Outlet />
                </div>
            </main>

            {/* Overlay when sidebar is open on mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    )
}
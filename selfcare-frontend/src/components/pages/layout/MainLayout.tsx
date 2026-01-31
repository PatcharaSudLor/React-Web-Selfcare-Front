import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './SideBar'

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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const handleProfileClick = () => {
        onNavigate('profile')
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
                    setIsSidebarOpen(false) // Close sidebar after navigation
                }}
                onLogout={() => {
                    onLogout()               // ✅ เรียก logout ตรง ๆ
                }}
            />

            {/* Main Content - No left padding, full width */}
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
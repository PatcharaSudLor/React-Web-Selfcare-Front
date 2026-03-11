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
        clearUserInfo()
        onLogout()
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
            <main
                className={`pt-10 h-[calc(100vh-64px)] transition-all duration-300 
                ${isSidebarOpen ? "lg:ml-64" : "ml-0"}`}
            >
                <Outlet />
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
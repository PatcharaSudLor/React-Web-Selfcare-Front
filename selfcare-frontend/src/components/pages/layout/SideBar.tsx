import { Home, UtensilsCrossed, PlayCircle, Bell, Lightbulb, X, Calendar, Heart, MessageCircle, User, LogOut } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  currentPage: string
  onNavigate: (page: string) => void
  onLogout: () => void
}

const menuItems = [
  { id: 'home', path: '/home', label: 'Home', icon: Home },
  { id: 'recipe', path: '/meals', label: 'Recipes', icon: UtensilsCrossed },
  { id: 'video', path: '/workouts/videos?part=upper-body', label: 'Videos', icon: PlayCircle },
  { id: 'alerts', path: '/alerts', label: 'Alerts', icon: Bell },
  { id: 'tips', path: '/tips', label: 'Tips', icon: Lightbulb },
  { id: 'schedule', path: '/schedule', label: 'Schedule', icon: Calendar },
  { id: 'favorite', path: '/favorite', label: 'Favorite', icon: Heart },
  { id: 'assistant', path: '/assistant', label: 'Assistant', icon: MessageCircle },
]

const bottomItems = [
  { id: 'profile', path: '/profile', label: 'Profile', icon: User },
  { id: 'logout', label: 'Logout', icon: LogOut },
]

export default function Sidebar({ isOpen, onClose, currentPage, onNavigate, onLogout }: SidebarProps) {
  const handleNavigate = (page: string) => {
    onNavigate(page)
  }

  const handleLogout = () => {
    onLogout()
  }

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 h-16">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-xl">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-800">เมนู</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col h-[calc(100%-64px)]">
          {/* Main Menu */}
          <div className="flex-1 py-4 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const itemBase = (item.path || '').split('?')[0]
              const isActive = currentPage === item.path || currentPage === itemBase

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-6 py-3
                    transition-all duration-200
                    ${isActive
                      ? 'bg-emerald-50 text-emerald-600 border-r-4 border-emerald-600'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-500'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* Bottom Menu */}
          <div className="border-t border-gray-200 py-2">
            {bottomItems.map((item) => {
              const Icon = item.icon
              const isLogout = item.id === 'logout'

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'logout') {
                      handleLogout()
                    } else {
                      handleNavigate((item as any).path || item.id)
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-6 py-3 transition-colors
                    ${isLogout
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                    `}
                >
                  <Icon className={`w-5 h-5 ${isLogout ? 'text-red-600' : 'text-gray-500'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      </aside>
    </>
  )
}
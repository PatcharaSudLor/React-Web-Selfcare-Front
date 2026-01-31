import { Menu, Heart, User } from 'lucide-react'

interface HeaderProps {
  onMenuClick: () => void
  onProfileClick?: () => void
}

export default function Header({ onMenuClick, onProfileClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-screen-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Hamburger Menu */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          {/* Center: Logo */}
          <div className="flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
            <Heart className="w-6 h-6 text-emerald-500 fill-emerald-500" />
            <h1 className="text-2xl font-bold">
              <span className="text-emerald-600">Self</span>
              <span className="text-gray-800">care</span>
            </h1>
          </div>

          {/* Right: Profile */}
          <button
            onClick={onProfileClick}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Profile"
          >
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}

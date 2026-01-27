import { Leaf } from 'lucide-react';

interface FirstPageProps {
  onLogin: () => void;
  onSignUp: () => void;
}

export default function FirstPage({ onLogin, onSignUp }: FirstPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 via-emerald-50 to-emerald-100 flex flex-col items-center justify-center px-6">
      <div className="text-center space-y-12 max-w-md w-full">
        {/* Logo */}
        <div className="mb-16">
          <div className="flex items-center justify-center gap-1 mb-12">
            <h1 className="text-6xl">
              <span className="text-emerald-500">Self</span>
              <span className="text-gray-700 relative">
                care
                <Leaf className="w-6 h-6 text-emerald-600 fill-emerald-600 absolute -top-3 -right-2" />
              </span>
            </h1>
          </div>
          
          {/* Tagline */}
          <p className="text-gray-600 text-sm leading-relaxed px-4">
            Personalized nutrition, safe workouts,
            <br />
            and simple progress tracking
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-20">
          <button
            onClick={onLogin}
            className="w-40 py-3 px-8 rounded-full bg-emerald-200 hover:bg-emerald-300 text-emerald-700 font-medium transition-all shadow-sm"
          >
            Log in
          </button>
          <button
            onClick={onSignUp}
            className="w-40 py-3 px-8 rounded-full bg-white hover:bg-gray-50 text-emerald-600 font-medium transition-all shadow-sm border border-emerald-200"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
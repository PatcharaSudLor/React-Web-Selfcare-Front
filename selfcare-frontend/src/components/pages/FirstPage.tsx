import { Leaf } from 'lucide-react';

interface FirstPageProps {
  onLogin: () => void;
  onSignUp: () => void;
}

export default function FirstPage({ onLogin, onSignUp }: FirstPageProps) {
  return (
    // เพิ่ม fixed positioning เพื่อ override body styles
    <div className="fixed inset-0 h-screen w-screen bg-emerald-50 flex flex-col items-center justify-center overflow-hidden">
      
      {/* Content Wrapper */}
      <div className="text-center space-y-16 w-full max-w-5xl px-8">
        
        {/* Logo Section */}
        <div className="mb-8">
          {/* Brand Name */}
          <div className="flex items-center justify-center gap-2 mb-16">
            <h1 className="text-8xl lg:text-9xl xl:text-[8rem] 2xl:text-[10rem] font-normal leading-none">
              <span className="text-emerald-500">Self</span>
              <span className="text-gray-600 relative">
                care
                {/* Leaf Icon */}
                <Leaf className="w-12 h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 2xl:w-20 2xl:h-20 text-emerald-600 fill-emerald-600 absolute -top-5 lg:-top-6 xl:-top-8 2xl:-top-10 -right-3 lg:-right-4" />
              </span>
            </h1>
          </div>
          
          {/* Tagline */}
          <p className="text-gray-500 text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl leading-relaxed">
            Personalized nutrition, safe workouts,
            <br />
            and simple progress tracking
          </p>
        </div>

        {/* Buttons Section */}
        <div className="flex flex-row gap-6 lg:gap-8 xl:gap-10 justify-center items-center mt-12">
          {/* Login Button */}
          <button
            onClick={onLogin}
            className="w-48 lg:w-56 xl:w-64 2xl:w-72 py-4 lg:py-5 xl:py-6 2xl:py-7 rounded-full bg-emerald-200 hover:bg-emerald-300 text-emerald-700 font-medium text-lg lg:text-xl xl:text-2xl 2xl:text-3xl transition-all shadow-md hover:shadow-xl transform hover:scale-105"
          >
            Log in
          </button>
          
          {/* Sign Up Button */}
          <button
            onClick={onSignUp}
            className="w-48 lg:w-56 xl:w-64 2xl:w-72 py-4 lg:py-5 xl:py-6 2xl:py-7 rounded-full bg-white hover:bg-gray-50 text-emerald-600 font-medium text-lg lg:text-xl xl:text-2xl 2xl:text-3xl transition-all shadow-md hover:shadow-xl border-2 border-emerald-200 transform hover:scale-105"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
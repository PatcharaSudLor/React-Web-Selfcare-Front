import { Leaf } from 'lucide-react';

interface FirstPageProps {
  onLogin: () => void;
  onSignUp: () => void;
}

export default function FirstPage({ onLogin, onSignUp }: FirstPageProps) {
  return (
    // Container หลัก - เต็มหน้าจอทั้งหมด 100vh
    <div className="h-screen w-screen bg-gradient-to-b from-emerald-100 via-emerald-50 to-emerald-100 flex flex-col items-center justify-center p-8">
      
      {/* Content Wrapper - ลบ max-width ออก ให้ใช้ w-full เต็มที่ */}
      <div className="text-center space-y-20 w-full h-full flex flex-col justify-center">
        
        {/* Logo Section - ขยายให้ใหญ่มากๆ */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Brand Name - ใช้ viewport width สำหรับขนาดที่ปรับตามหน้าจอ */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <h1 className="text-[12vw] md:text-[10vw] lg:text-[8vw] leading-none">
              <span className="text-emerald-500">Self</span>
              <span className="text-gray-700 relative">
                care
                {/* Leaf Icon - ใช้ขนาดที่ปรับตามตัวอักษร */}
                <Leaf className="w-[3vw] h-[3vw] min-w-[40px] min-h-[40px] text-emerald-600 fill-emerald-600 absolute -top-[2vw] -right-[2vw]" />
              </span>
            </h1>
          </div>
          
          {/* Tagline - ใช้ viewport width */}
          <p className="text-gray-600 text-[2.5vw] md:text-[2vw] lg:text-[1.5vw] leading-relaxed">
            Personalized nutrition, safe workouts,
            <br />
            and simple progress tracking
          </p>
        </div>

        {/* Buttons Section - ขยายเต็มพื้นที่ */}
        <div className="flex flex-col sm:flex-row gap-8 lg:gap-16 justify-center items-center pb-20">
          {/* Login Button - ใช้ viewport width */}
          <button
            onClick={onLogin}
            className="w-[40vw] max-w-md min-w-[200px] py-6 lg:py-8 rounded-full bg-emerald-200 hover:bg-emerald-300 text-emerald-700 font-medium text-[2vw] lg:text-[1.5vw] min-text-[18px] transition-all shadow-lg hover:shadow-2xl transform hover:scale-105"
          >
            Log in
          </button>
          
          {/* Sign Up Button */}
          <button
            onClick={onSignUp}
            className="w-[40vw] max-w-md min-w-[200px] py-6 lg:py-8 rounded-full bg-white hover:bg-gray-50 text-emerald-600 font-medium text-[2vw] lg:text-[1.5vw] min-text-[18px] transition-all shadow-lg hover:shadow-2xl border-2 border-emerald-200 transform hover:scale-105"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
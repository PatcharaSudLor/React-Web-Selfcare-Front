import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../utils/supabase.ts';
import { motion } from 'framer-motion';

interface LoginPageProps {
  onBack: () => void;
  onSignUp: () => void;
  onLoginSuccess: (email: string) => void;
}

/* animation presets */
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};


export default function LoginPage({ onBack, onSignUp, onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Clear previous error
    setError('');

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // Success! Store session if remember me is checked
      if (rememberMe && data.session) {
        localStorage.setItem('selfcare_remember_me', 'true');
        localStorage.setItem('selfcare_user_email', email);
        localStorage.setItem('selfcare_access_token', data.session.access_token);
      } else {
        // Clear remember me if not checked
        localStorage.removeItem('selfcare_remember_me');
        localStorage.removeItem('selfcare_user_email');
        localStorage.removeItem('selfcare_access_token');
      }

      console.log('Login successful:', { email, rememberMe });
      onLoginSuccess(email);
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    // Implement social login
    onLoginSuccess(email);
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
    // Implement forgot password flow
  };

  return (
    <motion.div className="fixed inset-0 h-screen w-screen bg-white flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}>
      {/* Header */}
      <motion.div className="px-8 lg:px-12 py-6 lg:py-8"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}>
        <button
          onClick={onBack}
          className="flex items-center gap-3 text-emerald-400 hover:text-emerald-500 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 lg:w-7 lg:h-7" />
          <span className="text-base lg:text-lg">Back</span>
        </button>
      </motion.div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <motion.div className="w-full max-w-lg lg:max-w-xl space-y-8"
          variants={container}
          initial="hidden"
          animate="show">
          {/* Title */}
          <motion.h1 className="text-4xl lg:text-5xl text-center text-emerald-300 mb-10" variants={item}>
            Welcome back!
          </motion.h1>

          {/* Email Input */}
          <motion.div>
            <label className="block text-left text-sm lg:text-base text-gray-500 mb-3 ml-6">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-5 lg:px-6 py-4 lg:py-5 rounded-full border-2 border-gray-300 focus:outline-none focus:border-emerald-400 transition-colors text-gray-700 text-base lg:text-lg"
            />
          </motion.div>

          {/* Password Input */}
          <motion.div variants={item}>
            <label className="block text-left text-sm lg:text-base text-gray-500 mb-3 ml-6">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 lg:px-6 py-4 lg:py-5 rounded-full border-2 border-gray-300 focus:outline-none focus:border-emerald-400 transition-colors text-gray-700 text-base lg:text-lg pr-14"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-6 h-6 lg:w-5 lg:h-5 rounded-full" />
                ) : (
                  <Eye className="w-6 h-6 lg:w-5 lg:h-5 rounded-full" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Remember Me & Forgot Password */}
          <motion.div variants={item} className="flex items-center justify-between px-2">
            <motion.div variants={item} className="flex items-center gap-3">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 lg:w-6 lg:h-6 rounded border-emerald-300 text-emerald-500 focus:ring-emerald-400 cursor-pointer flex-shrink-0"
              />
              <label htmlFor="remember" className="text-sm lg:text-base text-emerald-300 cursor-pointer">
                Remember me
              </label>
            </motion.div>
            <button
              onClick={handleForgotPassword}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Forgot password?
            </button>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div animate={{ x: [0, -6, 6, -4, 4, 0] }}
              transition={{ duration: 0.4 }} className="bg-red-50 border-2 border-red-200 text-red-600 px-5 py-3 lg:py-4 rounded-full text-sm lg:text-base text-center">
              {error}
            </motion.div>
          )}

          {/* Login Button */}
          <motion.button
            variants={item}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogin}
            className="w-full py-4 lg:py-5 rounded-full bg-emerald-200 hover:bg-emerald-300 disabled:bg-emerald-100 text-white font-medium text-lg lg:text-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none mt-6"
          >
            {loading ? 'Logging in...' : 'Login'}
          </motion.button>

          {/* Divider */}
          <div className="relative my-8 lg:my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-6 bg-white text-base lg:text-lg text-emerald-400">Login with</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <motion.div variants={item} className="flex justify-center gap-8 lg:gap-10 mt-8">
            <button
              onClick={() => handleSocialLogin('Google')}
              className="w-16 h-16 lg:w-20 lg:h-20 xl:w-20 xl:h-20 rounded-full bg-white border-2 border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-all shadow-md hover:shadow-xl transform hover:scale-110"
            >
              <svg className="w-9 h-9 lg:w-11 lg:h-11 xl:w-14 xl:h-14" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </button>

            <motion.button
              onClick={() => handleSocialLogin('Facebook')}
              className="w-16 h-16 lg:w-20 lg:h-20 xl:w-20 xl:h-20 rounded-full bg-white border-2 border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-all shadow-md hover:shadow-xl transform hover:scale-110"
            >
              <svg className="w-9 h-9 lg:w-11 lg:h-11 xl:w-14 xl:h-14" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </motion.button>

            <motion.button
              onClick={() => handleSocialLogin('Apple')}
              className="w-16 h-16 lg:w-20 lg:h-20 xl:w-22 xl:h-22 rounded-full bg-white border-2 border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-all shadow-md hover:shadow-xl transform hover:scale-110"
            >
              <svg className="w-9 h-9 lg:w-11 lg:h-11 xl:w-14 xl:h-14" viewBox="0 0 24 24" fill="#000000">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
            </motion.button>
          </motion.div>

          {/* Sign Up Link */}
          <motion.p variants={item} className="text-center text-base lg:text-lg text-gray-500 mt-8">
            Don't have an account?{' '}
            <button
              onClick={onSignUp}
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Signup
            </button>
          </motion.p>
        </motion.div>
      </div >
    </motion.div >
  );
}
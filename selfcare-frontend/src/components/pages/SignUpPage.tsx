import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { motion } from 'framer-motion';

interface SignUpPageProps {
    onBack: () => void;
    onLogin: () => void;
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

function getPasswordStrength(password: string) {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;

    return score; // 0 - 4
}

function getStrengthLabel(score: number) {
    switch (score) {
        case 0:
        case 1:
            return { label: 'Weak', color: 'bg-red-500', text: 'text-red-600' };
        case 2:
            return { label: 'Fair', color: 'bg-yellow-500', text: 'text-yellow-600' };
        case 3:
            return { label: 'Good', color: 'bg-blue-500', text: 'text-blue-600' };
        case 4:
            return { label: 'Strong', color: 'bg-green-500', text: 'text-green-600' };
        default:
            return { label: '', color: '', text: '' };
    }
}


export default function SignUpPage({ onBack, onLogin }: SignUpPageProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const strength = getPasswordStrength(password);
    const strengthInfo = getStrengthLabel(strength);
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasLength = password.length >= 8;

    const isStrong = hasLower && hasUpper && hasNumber && hasLength;



    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSignUp = async () => {
        // Clear previous error
        setError('');

        // Validation
        if (!email || !password || !agreedToTerms) {
            setError('Please fill in all fields and agree to terms');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            // Use Supabase to sign up
            const { error: supabaseError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (supabaseError) {
                setError(supabaseError.message);
                setLoading(false);
                return;
            }

            // Success! Now redirect to login page
            alert('Sign up successful! Please log in.');
            onLogin();
        } catch (err) {
            console.error('Sign up error:', err);
            setError('An error occurred during sign up');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider: string) => {
        console.log(`Sign up with ${provider}`);
        // TODO: Implement social login
    };

    return (
        // Container หลัก - เต็มหน้าจอ
        <motion.div className="fixed inset-0 h-screen w-screen bg-white flex flex-col overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}>

            {/* Header - ขยายขนาด */}
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

            {/* Content - ขยายความกว้าง */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
                <motion.div className="w-full max-w-lg lg:max-w-xl space-y-8"
                    variants={container}
                    initial="hidden"
                    animate="show">

                    {/* Title - ขยายขนาด */}
                    <motion.h1 className="text-4xl lg:text-5xl text-center text-emerald-300 mb-10" variants={item}>
                        Get started
                    </motion.h1>

                    {/* Email Input */}
                    <motion.div variants={item}>
                        {/* Label ชิดซ้าย - ไม่มี px-4 */}
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

                        {/* INPUT WRAPPER (relative แค่ส่วนนี้) */}
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-5 lg:px-6 py-4 lg:py-5 rounded-full
               border-2 border-gray-300 focus:outline-none
               focus:border-emerald-400 transition-colors
               text-gray-700 text-base lg:text-lg pr-14"
                            />

                            {/* 👁 Eye — อิง input เท่านั้น */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2
               text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-6 h-6 lg:w-5 lg:h-5" />
                                ) : (
                                    <Eye className="w-6 h-6 lg:w-5 lg:h-5" />
                                )}
                            </button>
                        </div>

                        {/* HELPERS — อยู่นอก relative */}
                        <div className="mt-2 min-h-[72px]">
                            {password && (
                                <>
                                    {/* Strength bar */}
                                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${strengthInfo.color}`}
                                            style={{ width: `${(strength / 4) * 100}%` }}
                                        />
                                    </div>

                                    <p className={`mt-1 text-xs font-semibold ${strengthInfo.text}`}>
                                        {strengthInfo.label}
                                    </p>
                                </>
                            )}

                            {password !== '' && (
                                <ul
                                    className={`mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs transition-all duration-300
      ${isStrong ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-20'}`}
                                >
                                    <li className={hasLower ? 'text-emerald-600' : 'text-gray-400'}>✓ lowercase</li>
                                    <li className={hasUpper ? 'text-emerald-600' : 'text-gray-400'}>✓ uppercase</li>
                                    <li className={hasNumber ? 'text-emerald-600' : 'text-gray-400'}>✓ number</li>
                                    <li className={hasLength ? 'text-emerald-600' : 'text-gray-400'}>✓ 8+ chars</li>
                                </ul>
                            )}

                            {isStrong && (
                                <p className="mt-2 text-xs font-semibold text-emerald-600">
                                    ✓ Strong password
                                </p>
                            )}
                        </div>

                    </motion.div>

                    {/* Terms Checkbox */}
                    <motion.div variants={item} className="flex items-center gap-3 ml-2">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="w-5 h-5 lg:w-6 lg:h-6 rounded border-emerald-300 text-emerald-500 focus:ring-emerald-400 cursor-pointer flex-shrink-0"
                        />
                        <label htmlFor="terms" className="text-sm lg:text-base text-emerald-300 cursor-pointer">
                            I agree to the processing of <span className="font-semibold">Personal data</span>
                        </label>
                    </motion.div>

                    {/* Error Message */}
                    {error && (
                        <motion.div animate={{ x: [0, -6, 6, -4, 4, 0] }}
                            transition={{ duration: 0.4 }} className="bg-red-50 border-2 border-red-200 text-red-600 px-5 py-3 lg:py-4 rounded-full text-sm lg:text-base text-center">
                            {error}
                        </motion.div>
                    )}

                    {/* Sign Up Button - ขยายขนาด */}
                    <motion.button
                        variants={item}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSignUp}
                        disabled={strength < 4 || loading}
                        className="w-full py-4 lg:py-5 rounded-full bg-emerald-200 hover:bg-emerald-300 disabled:bg-emerald-100 text-white font-medium text-lg lg:text-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none mt-6"
                    >
                        {loading ? 'Signing up...' : 'Sign up'}
                    </motion.button>

                    {/* Divider */}
                    <div className="relative my-8 lg:my-10">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-6 bg-white text-base lg:text-lg text-gray-400">Sign up</span>
                        </div>
                    </div>

                    {/* Social Login Buttons - ขยายไอคอนให้ใหญ่มาก */}
                    <motion.div variants={item} className="flex justify-center gap-8 lg:gap-10 mt-8">
                        {/* Google Button */}
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

                    </motion.div>

                    {/* Login Link - ขยายขนาด */}
                    <motion.p variants={item} className="text-center text-base lg:text-lg text-gray-500 mt-8">
                        If you have account?{' '}
                        <button
                            onClick={onLogin}
                            className="text-emerald-500 hover:text-emerald-600 font-medium"
                        >
                            Login
                        </button>
                    </motion.p>
                </motion.div>
            </div>
        </motion.div>
    );
}
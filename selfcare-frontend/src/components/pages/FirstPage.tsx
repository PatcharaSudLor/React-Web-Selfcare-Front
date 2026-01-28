import { Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

interface FirstPageProps {
  onLogin: () => void;
  onSignUp: () => void;
}

export default function FirstPage({ onLogin, onSignUp }: FirstPageProps) {
  return (
    <div className="fixed inset-0 h-screen w-screen bg-emerald-50 flex items-center justify-center overflow-hidden">

      {/* Floating Leaves */}
      <motion.div
        className="absolute top-10 left-10 text-emerald-300"
        animate={{ y: [0, 20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <Leaf size={40} />
      </motion.div>

      <motion.div
        className="absolute bottom-20 right-20 text-emerald-200"
        animate={{ y: [0, -30, 0], rotate: [0, -12, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        <Leaf size={56} />
      </motion.div>

      {/* Content Wrapper */}
      <motion.div
        className="text-center space-y-16 w-full max-w-5xl px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >

        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <div className="flex items-center justify-center gap-2 mb-16">
            <h1 className="text-8xl lg:text-9xl font-normal leading-none">
              <span className="text-emerald-500">Self</span>
              <span className="text-gray-600 relative">
                care
                <motion.span
                  initial={{ opacity: 0, rotate: -20 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -top-5 -right-4"
                >
                  <Leaf className="w-14 h-14 text-emerald-600 fill-emerald-600" />
                </motion.span>
              </span>
            </h1>
          </div>

          <p className="text-gray-500 text-2xl leading-relaxed">
            Personalized nutrition, safe workouts,
            <br />
            and simple progress tracking
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="flex gap-8 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <button
            onClick={onLogin}
            className="w-56 py-5 rounded-full bg-emerald-200 hover:bg-emerald-300 text-emerald-700 text-xl shadow-md hover:scale-105 transition"
          >
            Log in
          </button>

          <button
            onClick={onSignUp}
            className="w-56 py-5 rounded-full bg-white text-emerald-600 text-xl border-2 border-emerald-200 shadow-md hover:scale-105 transition"
          >
            Sign up
          </button>
        </motion.div>

      </motion.div>
    </div>
  );
}

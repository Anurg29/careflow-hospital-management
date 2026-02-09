import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  Activity,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Sparkles,
  Heart,
  Shield,
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // login | register
  const { login, register, loading, error, clearError } = useAuthStore();

  // form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [role, setRole] = useState('patient');
  const [showPw, setShowPw] = useState(false);

  const switchMode = () => {
    clearError();
    setMode(mode === 'login' ? 'register' : 'login');
    setPassword('');
    setPassword2('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'login') {
      await login(username, password);
    } else {
      if (password !== password2) {
        useAuthStore.setState({ error: 'Passwords do not match' });
        return;
      }
      await register({ username, email, password, password2, role });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-float" style={{ top: '10%', left: '10%' }}></div>
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ top: '50%', right: '10%', animationDelay: '-5s' }}></div>
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float" style={{ bottom: '10%', left: '50%', animationDelay: '-10s' }}></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

      <motion.div
        className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left branding panel */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block text-white"
        >
          <div className="space-y-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-block"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-teal-500/50 animate-pulse-slow">
                <Activity className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <div>
              <h1 className="text-6xl font-black bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent mb-4 leading-tight">
                CareFlow
              </h1>
              <p className="text-2xl text-gray-300 font-light">
                Hospital Queue Management
              </p>
              <p className="text-lg text-gray-400 mt-2">
                Real-time, Intelligent, Beautiful
              </p>
            </div>

            <div className="space-y-6 pt-8">
              {[
                { icon: ShieldCheck, title: 'Secure Access', desc: 'End-to-end JWT security' },
                { icon: Activity, title: 'Live Monitoring', desc: 'Real-time queue & bed tracking' },
                { icon: Shield, title: 'Role Control', desc: 'Advanced permission system' },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="flex items-start gap-4 group cursor-pointer"
                >
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-lg rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-teal-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-teal-300 transition-colors">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right form panel */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
                  </h2>
                  <p className="text-gray-300">
                    {mode === 'login' ? 'Sign in to access the dashboard' : 'Register to start managing your hospital'}
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm backdrop-blur-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-400 transition-colors" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                      placeholder="Enter username"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {/* Email (register only) */}
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-400 transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                        placeholder="Enter email"
                        required
                      />
                    </div>
                  </motion.div>
                )}

                {/* Role Selection (register only) */}
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-2">Account Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole('patient')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          role === 'patient'
                            ? 'border-teal-500 bg-teal-500/20 text-white'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <Heart className="w-6 h-6 mx-auto mb-2" />
                        <div className="text-sm font-semibold">Patient</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('admin')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          role === 'admin'
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <Shield className="w-6 h-6 mx-auto mb-2" />
                        <div className="text-sm font-semibold">Admin</div>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-400 transition-colors" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (register only) */}
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-400 transition-colors" />
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                        placeholder="Confirm password"
                        required
                      />
                    </div>
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white py-4 rounded-xl font-semibold hover:shadow-2xl hover:shadow-teal-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                      </>
                    ) : (
                      <>
                        {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                      </>
                    )}
                  </span>
                </button>

                {/* Mode Switch */}
                <div className="text-center mt-6">
                  <button
                    type="button"
                    onClick={switchMode}
                    className="text-gray-300 hover:text-white font-medium transition-colors"
                  >
                    {mode === 'login' ? (
                      <span>Don't have an account? <span className="text-teal-400 hover:text-teal-300">Register →</span></span>
                    ) : (
                      <span>Already have an account? <span className="text-teal-400 hover:text-teal-300">Sign In →</span></span>
                    )}
                  </button>
                </div>
              </motion.form>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}

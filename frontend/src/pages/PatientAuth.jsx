
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Phone, Calendar, MapPin, Droplet, UserPlus, LogIn, Eye, EyeOff, ArrowLeft, Sparkles, Heart, Shield } from 'lucide-react';
import usePatientStore from '../store/usePatientStore';

export default function PatientAuth() {
    const navigate = useNavigate();
    const { register, login, loading, error, clearError } = usePatientStore();
    const [mode, setMode] = useState('login');
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);

    const [loginData, setLoginData] = useState({
        username: '',
        password: '',
    });

    const [registerData, setRegisterData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: '',
        phone: '',
        date_of_birth: '',
        address: '',
        blood_group: '',
        emergency_contact: '',
    });

    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
        clearError();
    };

    const handleRegisterChange = (e) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
        clearError();
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await login(loginData);
            navigate('/patient/dashboard');
        } catch (err) {
            console.error('Login failed:', err);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await register(registerData);
            navigate('/patient/dashboard');
        } catch (err) {
            console.error('Registration failed:', err);
        }
    };

    const switchMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
        clearError();
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-float" style={{ top: '10%', left: '10%' }}></div>
                <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ top: '50%', right: '10%', animationDelay: '-5s' }}></div>
                <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float" style={{ bottom: '10%', left: '50%', animationDelay: '-10s' }}></div>
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-width-6xl grid lg:grid-cols-2 gap-8 items-center">

                    {/* Left Side - Branding */}
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
                                    <Sparkles className="w-10 h-10 text-white" />
                                </div>
                            </motion.div>

                            <div>
                                <h1 className="text-6xl font-black bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent mb-4 leading-tight">
                                    CareFlow
                                </h1>
                                <p className="text-2xl text-gray-300 font-light">
                                    Your Health Journey Starts Here
                                </p>
                            </div>

                            <div className="space-y-6 pt-8">
                                {[
                                    { icon: Calendar, title: 'Instant Booking', desc: 'Book appointments in seconds' },
                                    { icon: Heart, title: 'Expert Care', desc: 'Connect with top healthcare professionals' },
                                    { icon: Shield, title: 'Secure & Private', desc: 'Your data is protected with encryption' },
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

                    {/* Right Side - Auth Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="w-full max-w-md mx-auto"
                    >
                        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                            {/* Back button */}
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                <span>Back to Home</span>
                            </button>

                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
                                </h2>
                                <p className="text-gray-300">
                                    {mode === 'login' ? 'Login to manage your health' : 'Join thousands of happy patients'}
                                </p>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm backdrop-blur-sm"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <AnimatePresence mode="wait">
                                {mode === 'login' ? (
                                    <motion.form
                                        key="login"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onSubmit={handleLogin}
                                        className="space-y-5"
                                    >
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-400 transition-colors" />
                                                <input
                                                    type="text"
                                                    name="username"
                                                    value={loginData.username}
                                                    onChange={handleLoginChange}
                                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                                                    placeholder="Enter username"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-400 transition-colors" />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="password"
                                                    value={loginData.password}
                                                    onChange={handleLoginChange}
                                                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                                                    placeholder="Enter password"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

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
                                                        Logging in...
                                                    </>
                                                ) : (
                                                    <>
                                                        <LogIn className="w-5 h-5" />
                                                        Login to Dashboard
                                                    </>
                                                )}
                                            </span>
                                        </button>
                                    </motion.form>
                                ) : (
                                    <motion.form
                                        key="register"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onSubmit={handleRegister}
                                        className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar"
                                    >
                                        {/* Username field FIRST - most important */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1.5">Username * <span className="text-red-400">(Required)</span></label>
                                            <div className="relative group">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-400" />
                                                <input
                                                    type="text"
                                                    name="username"
                                                    value={registerData.username}
                                                    onChange={handleRegisterChange}
                                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                                                    placeholder="johndoe (at least 3 characters)"
                                                    required
                                                    minLength={3}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-300 mb-1.5">First Name</label>
                                                <input
                                                    type="text"
                                                    name="first_name"
                                                    value={registerData.first_name}
                                                    onChange={handleRegisterChange}
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                                                    placeholder="John"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-300 mb-1.5">Last Name</label>
                                                <input
                                                    type="text"
                                                    name="last_name"
                                                    value={registerData.last_name}
                                                    onChange={handleRegisterChange}
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                                                    placeholder="Doe"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1.5">Email * <span className="text-red-400">(Required)</span></label>
                                            <div className="relative group">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-400" />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={registerData.email}
                                                    onChange={handleRegisterChange}
                                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                                                    placeholder="john@example.com"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-300 mb-1.5">Password *</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-400" />
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        name="password"
                                                        value={registerData.password}
                                                        onChange={handleRegisterChange}
                                                        className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                                                        placeholder="••••••••"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-400 transition-colors"
                                                    >
                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-300 mb-1.5">Confirm *</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-400" />
                                                    <input
                                                        type={showPassword2 ? "text" : "password"}
                                                        name="password2"
                                                        value={registerData.password2}
                                                        onChange={handleRegisterChange}
                                                        className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                                                        placeholder="••••••••"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword2(!showPassword2)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-400 transition-colors"
                                                    >
                                                        {showPassword2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-300 mb-1.5">Phone</label>
                                                <div className="relative group">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-400" />
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={registerData.phone}
                                                        onChange={handleRegisterChange}
                                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                                                        placeholder="1234567890"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-300 mb-1.5">Date of Birth</label>
                                                <div className="relative group">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-400" />
                                                    <input
                                                        type="date"
                                                        name="date_of_birth"
                                                        value={registerData.date_of_birth}
                                                        onChange={handleRegisterChange}
                                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-300 mb-1.5">Blood Group</label>
                                                <div className="relative group">
                                                    <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-400" />
                                                    <select
                                                        name="blood_group"
                                                        value={registerData.blood_group}
                                                        onChange={handleRegisterChange}
                                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all appearance-none"
                                                    >
                                                        <option value="" className="bg-slate-800">Select</option>
                                                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                                                            <option key={bg} value={bg} className="bg-slate-800">{bg}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-300 mb-1.5">Emergency Contact</label>
                                                <input
                                                    type="tel"
                                                    name="emergency_contact"
                                                    value={registerData.emergency_contact}
                                                    onChange={handleRegisterChange}
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                                                    placeholder="9876543210"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1.5">Address</label>
                                            <div className="relative group">
                                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400 group-focus-within:text-teal-400" />
                                                <textarea
                                                    name="address"
                                                    value={registerData.address}
                                                    onChange={handleRegisterChange}
                                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all resize-none"
                                                    placeholder="Your address"
                                                    rows="2"
                                                />
                                            </div>
                                        </div>

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
                                                        Creating Account...
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus className="w-5 h-5" />
                                                        Create My Account
                                                    </>
                                                )}
                                            </span>
                                        </button>
                                    </motion.form>
                                )}
                            </AnimatePresence>

                            <div className="mt-8 text-center">
                                <button
                                    onClick={switchMode}
                                    className="text-gray-300 hover:text-white font-medium transition-colors"
                                >
                                    {mode === 'login' ? (
                                        <span>Don't have an account? <span className="text-teal-400 hover:text-teal-300">Sign Up →</span></span>
                                    ) : (
                                        <span>Already have an account? <span className="text-teal-400 hover:text-teal-300">Login →</span></span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(20, 184, 166, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(20, 184, 166, 0.7);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
      `}</style>
        </div>
    );
}

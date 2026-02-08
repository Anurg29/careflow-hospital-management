import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Building2, ArrowRight, Sparkles, Heart, Shield, Zap, Users, Calendar } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-3xl animate-float" style={{ top: '-10%', left: '-10%' }}></div>
                <div className="absolute w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ top: '50%', right: '-10%', animationDelay: '-5s' }}></div>
                <div className="absolute w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-3xl animate-float" style={{ bottom: '-10%', left: '50%', animationDelay: '-10s' }}></div>
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <div className="p-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/50">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">CareFlow</span>
                    </motion.div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="max-w-7xl w-full">
                        {/* Hero Section */}
                        <div className="text-center mb-16">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="inline-block mb-6"
                            >
                                <div className="px-4 py-2 bg-teal-500/20 backdrop-blur-sm border border-teal-500/30 rounded-full text-teal-300 text-sm font-medium">
                                    ✨ Modern Hospital Management System
                                </div>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-6xl md:text-8xl font-black mb-6 leading-tight"
                            >
                                <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
                                    Healthcare
                                </span>
                                <br />
                                <span className="text-white">Reimagined</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12"
                            >
                                Experience seamless healthcare management with cutting-edge technology.
                                Book appointments, track queues, and manage your health journey - all in one place.
                            </motion.p>

                            {/* Stats */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="flex flex-wrap items-center justify-center gap-8 mb-16"
                            >
                                {[
                                    { icon: Users, value: '10K+', label: 'Patients' },
                                    { icon: Calendar, value: '50K+', label: 'Appointments' },
                                    { icon: Zap, value: '99.9%', label: 'Uptime' },
                                ].map((stat, idx) => (
                                    <div key={idx} className="text-center">
                                        <stat.icon className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                                        <div className="text-3xl font-bold text-white">{stat.value}</div>
                                        <div className="text-sm text-gray-400">{stat.label}</div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Portal Cards */}
                        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {/* Patient Portal */}
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 }}
                            >
                                <Link to="/patient/auth">
                                    <div className="group relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-teal-500/50 cursor-pointer overflow-hidden">
                                        {/* Glow effect */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                        <div className="relative z-10">
                                            <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-teal-500/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                                <User className="w-8 h-8 text-white" />
                                            </div>

                                            <h2 className="text-3xl font-bold text-white mb-3 group-hover:text-teal-300 transition-colors">
                                                Patient Portal
                                            </h2>
                                            <p className="text-gray-300 mb-6 leading-relaxed">
                                                Book appointments instantly, check real-time queue status, and manage your healthcare journey with ease.
                                            </p>

                                            <div className="flex items-center gap-2 text-teal-400 font-semibold group-hover:gap-4 transition-all">
                                                <span>Get Started</span>
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                            </div>

                                            <div className="mt-8 pt-6 border-t border-white/10">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    {[
                                                        { icon: Calendar, text: 'Instant Booking' },
                                                        { icon: Shield, text: 'Secure Payments' },
                                                        { icon: Zap, text: 'Real-time Updates' },
                                                        { icon: Heart, text: 'Expert Care' },
                                                    ].map((feature, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 text-gray-300">
                                                            <feature.icon className="w-4 h-4 text-teal-400 flex-shrink-0" />
                                                            <span>{feature.text}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>

                            {/* Hospital Admin */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 }}
                            >
                                <Link to="/admin">
                                    <div className="group relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 cursor-pointer overflow-hidden">
                                        {/* Glow effect */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                        <div className="relative z-10">
                                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                                <Building2 className="w-8 h-8 text-white" />
                                            </div>

                                            <h2 className="text-3xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                                                Hospital Admin
                                            </h2>
                                            <p className="text-gray-300 mb-6 leading-relaxed">
                                                Complete hospital management solution. Manage appointments, track beds, analyze data, and optimize operations.
                                            </p>

                                            <div className="flex items-center gap-2 text-purple-400 font-semibold group-hover:gap-4 transition-all">
                                                <span>Admin Login</span>
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                            </div>

                                            <div className="mt-8 pt-6 border-t border-white/10">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    {[
                                                        { icon: Users, text: 'Patient Management' },
                                                        { icon: Calendar, text: 'Appointments' },
                                                        { icon: Zap, text: 'Queue Control' },
                                                        { icon: Shield, text: 'Analytics' },
                                                    ].map((feature, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 text-gray-300">
                                                            <feature.icon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                                            <span>{feature.text}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 text-center text-gray-400 text-sm">
                    © 2026 CareFlow Hospital Management System. Built with ❤️
                </div>
            </div>

            <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
      `}</style>
        </div>
    );
}

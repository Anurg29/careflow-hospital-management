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
      await register({ username, email, password, password2 });
    }
  };

  return (
    <div className="auth-page">
      {/* Animated background blobs */}
      <div className="auth-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Left branding panel */}
        <div className="auth-brand">
          <div className="auth-brand-content">
            <Activity size={48} strokeWidth={1.5} />
            <h1>CareFlow</h1>
            <p className="auth-brand-tagline">
              Hospital Queue Management — real-time, intelligent, beautiful.
            </p>
            <div className="auth-features">
              <div className="auth-feature">
                <ShieldCheck size={20} />
                <span>End-to-end JWT security</span>
              </div>
              <div className="auth-feature">
                <Activity size={20} />
                <span>Live bed & queue monitoring</span>
              </div>
              <div className="auth-feature">
                <Lock size={20} />
                <span>Role-based access control</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="auth-form-panel">
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              className="auth-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
              <p className="auth-subtitle">
                {mode === 'login'
                  ? 'Sign in to access the dashboard'
                  : 'Register to start managing your hospital'}
              </p>

              {error && (
                <motion.div
                  className="auth-error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  {error}
                </motion.div>
              )}

              {/* Username */}
              <label className="auth-field">
                <User size={18} />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </label>

              {/* Email (register only) */}
              {mode === 'register' && (
                <motion.label
                  className="auth-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <Mail size={18} />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </motion.label>
              )}

              {/* Password */}
              <label className="auth-field">
                <Lock size={18} />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </label>

              {/* Confirm password (register only) */}
              {mode === 'register' && (
                <motion.label
                  className="auth-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <Lock size={18} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    required
                    minLength={6}
                  />
                </motion.label>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner" />
                ) : mode === 'login' ? (
                  <>
                    <LogIn size={18} /> Sign In
                  </>
                ) : (
                  <>
                    <UserPlus size={18} /> Register
                  </>
                )}
              </button>

              <p className="auth-switch">
                {mode === 'login'
                  ? "Don't have an account?"
                  : 'Already have an account?'}
                <button type="button" onClick={switchMode}>
                  {mode === 'login' ? 'Register' : 'Sign In'}
                </button>
              </p>
            </motion.form>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

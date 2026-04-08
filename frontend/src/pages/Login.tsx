import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'PATIENT',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.password, formData.name, formData.role);
      }
      navigate('/');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Demo account quick login
  const quickLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError('');
    setFormData({ ...formData, email, password });
    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      console.error('Quick login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-neutral-50 to-secondary-50" />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse"  style={{ animationDelay: '1s' }} />
      
      <div className="relative w-full max-w-md animate-fade-in-up">
        {/* Logo & Branding with Enhanced Styling */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-xl shadow-primary-500/40 mb-6 group hover:scale-110 transition-transform duration-300">
            <Heart className="w-11 h-11 text-white animate-heartbeat" fill="currentColor" />
          </div>
          <h1 className="text-4xl font-heading font-bold mb-2">
            <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 bg-clip-text text-transparent">
              CardioMonitor
            </span>
            <span className="text-accent-500">+</span>
          </h1>
          <p className="text-neutral-600 font-medium flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-secondary-500" />
            Biometric Intelligence Platform
          </p>
        </div>

        {/* Main Form with Glassmorphism */}
        <Card variant="glass" padding="lg" className="mb-6 shadow-2xl backdrop-blur-xl">
          <div className="flex border-b border-neutral-200/50 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`relative flex-1 pb-4 text-sm font-semibold transition-all duration-300 ${
                isLogin
                  ? 'text-primary-600'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Sign In
              {isLogin && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`relative flex-1 pb-4 text-sm font-semibold transition-all duration-300 ${
                !isLogin
                  ? 'text-primary-600'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Create Account
              {!isLogin && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" />
              )}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="animate-fade-in-up">
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 focus:bg-white transition-all duration-300"
                  placeholder="Dr. John Smith"
                />
              </div>
            )}

            <div className="animate-fade-in-up stagger-1">
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 focus:bg-white transition-all duration-300"
                placeholder="you@cardiomonitor.com"
              />
            </div>

            <div className="animate-fade-in-up stagger-2">
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 focus:bg-white transition-all duration-300"
                placeholder="••••••••••"
              />
            </div>

            {!isLogin && (
              <div className="animate-fade-in-up stagger-3">
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 focus:bg-white transition-all duration-300"
                >
                  <option value="PATIENT">Patient</option>
                  <option value="DOCTOR">Cardiologist</option>
                </select>
              </div>
            )}

            {error && (
              <div className="p-4 bg-gradient-to-r from-accent-50 to-rose-50 border-l-4 border-accent-500 rounded-xl animate-fade-in-up">
                <p className="text-sm font-semibold text-accent-700">⚠️ {error}</p>
                {error.includes('Invalid credentials') && (
                  <p className="text-xs text-accent-600 mt-1">
                    Tip: Use the demo account buttons below for quick access
                  </p>
                )}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        </Card>

        {/* Demo Accounts - Enhanced Design */}
        <Card variant="glass" padding="md" className="backdrop-blur-xl border border-neutral-200/50">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-secondary-500" />
              Quick Demo Access
            </p>
            <span className="text-xs px-3 py-1 bg-gradient-to-r from-secondary-500/10 to-primary-500/10 rounded-full text-secondary-700 font-semibold border border-secondary-200">
              1-Click Login
            </span>
          </div>
          <p className="text-xs text-neutral-600 mb-4 font-medium">
            Explore the platform instantly with pre-configured accounts
          </p>
          <div className="space-y-3">
            <button
              onClick={() => quickLogin('doctor@cardiomonitor.com', 'password123')}
              disabled={isLoading}
              className="w-full px-4 py-3.5 text-left bg-white/80 backdrop-blur-sm border-2 border-primary-200 rounded-xl hover:border-primary-400 hover:bg-white hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-neutral-900 group-hover:text-primary-700 flex items-center gap-2 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm">
                      👨‍⚕️
                    </div>
                    Cardiologist Account
                  </div>
                  <div className="text-xs text-neutral-500 mt-1 ml-10">doctor@cardiomonitor.com</div>
                </div>
                <div className="text-primary-600 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">
                  →
                </div>
              </div>
            </button>
            <button
              onClick={() => quickLogin('john@patient.com', 'password123')}
              disabled={isLoading}
              className="w-full px-4 py-3.5 text-left bg-white/80 backdrop-blur-sm border-2 border-secondary-200 rounded-xl hover:border-secondary-400 hover:bg-white hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-neutral-900 group-hover:text-secondary-700 flex items-center gap-2 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center text-white text-sm">
                      👤
                    </div>
                    Patient Account
                  </div>
                  <div className="text-xs text-neutral-500 mt-1 ml-10">john@patient.com</div>
                </div>
                <div className="text-secondary-600 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">
                  →
                </div>
              </div>
            </button>
          </div>
        </Card>
        
        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-neutral-500 font-medium">
            © 2026 CardioMonitor+ • Powered by AI & Biometric Intelligence
          </p>
        </div>
      </div>
    </div>
  );
};

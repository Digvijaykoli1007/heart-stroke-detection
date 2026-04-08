import React, { useState } from 'react';
import { Bell, Search, Settings, LogOut, Brain, Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'DOCTOR':
        return 'Cardiologist';
      case 'ADMIN':
        return 'Administrator';
      case 'PATIENT':
        return 'Patient';
      default:
        return role;
    }
  };

  return (
    <header className="glass-card sticky top-0 z-50 border-b border-neutral-200/50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title - Enhanced with gradient */}
          <div className="flex items-center gap-4 group">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-all duration-300 group-hover:scale-105">
              <Heart className="w-6 h-6 text-white animate-heartbeat" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
            </div>
            <div className="relative">
              <h1 className="text-2xl font-bold font-heading tracking-tight">
                <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 bg-clip-text text-transparent">
                  CardioMonitor
                </span>
                <span className="text-accent-500">+</span>
              </h1>
              <p className="text-xs text-neutral-500 font-medium tracking-wide">Biometric Intelligence Platform</p>
              <div className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" />
            </div>
          </div>
          
          {/* Search Bar - Modern glassmorphism style */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search patients, records, insights..."
                className="w-full pl-12 pr-4 py-3 bg-neutral-50/80 backdrop-blur-sm border border-neutral-200 rounded-2xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/5 to-secondary-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Stroke Assessment Link - Premium gradient button */}
            <button 
              onClick={() => navigate('/stroke-assessment')}
              className="group relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-secondary-600 to-secondary-700 text-white text-sm font-semibold rounded-xl hover:from-secondary-700 hover:to-secondary-800 transition-all duration-300 shadow-lg shadow-secondary-500/30 hover:shadow-secondary-500/50 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              <Brain className="w-4 h-4 relative z-10" />
              <span className="relative z-10">AI Stroke Risk</span>
            </button>
            
            {/* Notifications - With pulse animation for unread */}
            <button className="relative p-2.5 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-300 group">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-accent-500 rounded-full animate-pulse-glow" />
              <div className="absolute inset-0 rounded-xl bg-primary-500/10 scale-0 group-hover:scale-100 transition-transform duration-300" />
            </button>
            
            {/* Settings */}
            <button className="relative p-2.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all duration-300 group overflow-hidden">
              <Settings className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-500" />
              <div className="absolute inset-0 rounded-xl bg-neutral-200/50 scale-0 group-hover:scale-100 transition-transform duration-300" />
            </button>
            
            {/* User Menu - Enhanced with better styling */}
            <div className="relative flex items-center gap-3 pl-3 ml-3 border-l border-neutral-200">
              <div className="text-right">
                <p className="text-sm font-semibold text-neutral-900">{user?.name || 'User'}</p>
                <p className="text-xs text-neutral-500 font-medium">{user ? getRoleDisplay(user.role) : ''}</p>
              </div>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl font-bold text-sm hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
              >
                {user ? getUserInitials(user.name) : 'U'}
                <div className="absolute inset-0 rounded-xl bg-white/20 scale-0 hover:scale-100 transition-transform duration-300" />
              </button>

              {/* Dropdown Menu - Modern glassmorphism */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-3 w-56 glass-card rounded-2xl shadow-xl border border-neutral-200/50 py-2 z-20 animate-fade-in-up">
                    <div className="px-4 py-3 border-b border-neutral-200/50">
                      <p className="text-sm font-semibold text-neutral-900">{user?.name}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{user?.email}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-gradient-to-r hover:from-accent-50 hover:to-accent-100/50 hover:text-accent-700 transition-all duration-300 group mt-1"
                    >
                      <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageType } from '../../types';
import {
  Menu,
  Sparkles,
  Flame,
  BotMessageSquare,
  CloudCheck,
  Cloud,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Sparkle,
} from 'lucide-react';
import { Button } from './Button';

interface NavbarProps {
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const {
    currentPage,
    setCurrentPage,
    profile,
    isLoggedIn,
    isCloudSynced,
    signOutUser,
    firebaseUser,
  } = useApp();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = (page: PageType) => {
    switch (page) {
      case 'dashboard':
        return 'Overview & Skill Diagnostics';
      case 'learning-path':
        return 'Personalized Learning Roadmap';
      case 'recommendations':
        return 'AI Next-Step Recommendations';
      case 'progress':
        return 'Skill Mastery & Analytics';
      case 'assessments':
        return 'Adaptive Diagnostic Assessments';
      case 'ai-assistant':
        return 'AI Learning Path Advisor';
      case 'profile':
        return 'Learner Profile & Preferences';
      case 'onboarding':
        return 'Path Generator Setup';
      case 'login':
        return 'Learner Login';
      case 'signup':
        return 'Create Account';
      default:
        return 'PathFind AI';
    }
  };

  const displayName = profile.name || firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'Learner';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#070b14]/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
            {getPageTitle(currentPage)}
          </h2>
          <p className="hidden sm:block text-[11px] text-slate-400">
            {profile.careerGoal} Track &bull; {profile.preferredDifficulty} Mode
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Firestore Sync Badge */}
        {isCloudSynced ? (
          <div
            title="All learning progress and roadmap states are synced to Firebase Firestore"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium"
          >
            <CloudCheck className="w-3.5 h-3.5" />
            <span>Cloud Synced</span>
          </div>
        ) : (
          <div
            title="Connecting to Firebase cloud storage"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-400 text-xs font-medium"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Local State</span>
          </div>
        )}

        {/* Streak Counter */}
        <div
          title={`${profile.streakDays} consecutive days of active study`}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold"
        >
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
          <span>{profile.streakDays}d Streak</span>
        </div>

        {/* AI Quick Chat Pill */}
        {currentPage !== 'ai-assistant' && (
          <button
            onClick={() => setCurrentPage('ai-assistant')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-medium transition-all shadow-sm"
          >
            <BotMessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ask Advisor</span>
          </button>
        )}

        {/* Profile Dropdown Menu */}
        {isLoggedIn ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group"
            >
              <span className="hidden sm:inline text-xs font-medium text-slate-200 group-hover:text-white max-w-[100px] truncate">
                {displayName}
              </span>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {initial}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#090f1f] border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in-50 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-800/80">
                  <p className="text-xs font-bold text-white truncate">{displayName}</p>
                  <p className="text-[11px] text-slate-400 truncate">{firebaseUser?.email || profile.email}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setCurrentPage('profile');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentPage('onboarding');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors"
                  >
                    <Sparkle className="w-4 h-4 text-indigo-400" />
                    <span>Regenerate Learning Path</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      signOutUser();
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage('login')}
            >
              Sign In
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setCurrentPage('signup')}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Get Started
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageType } from '../../types';
import { PathFindLogo } from './PathFindLogo';
import {
  LayoutDashboard,
  Route,
  Sparkles,
  TrendingUp,
  FileCheck2,
  BotMessageSquare,
  User,
  LogOut,
  Zap,
  CloudCheck,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { currentPage, setCurrentPage, profile, overallProgress, signOutUser, isCloudSynced } = useApp();

  const navigationItems: { id: PageType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'learning-path', label: 'My Learning Path', icon: Route },
    { id: 'recommendations', label: 'Recommendations', icon: Sparkles },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'assessments', label: 'Assessments', icon: FileCheck2 },
    { id: 'ai-assistant', label: 'AI Assistant', icon: BotMessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleNavClick = (pageId: PageType) => {
    setCurrentPage(pageId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#080d1a] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => handleNavClick('landing')}
              className="flex items-center gap-3 text-left group"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-indigo-500/25 border border-indigo-400/40 bg-[#070B18] flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <PathFindLogo className="w-full h-full" />
              </div>
              <div>
                <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                  PathFind <span className="text-indigo-400 font-mono text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30">AI</span>
                </span>
                <p className="text-[11px] text-slate-400 font-medium">Roadmap Engine</p>
              </div>
            </button>
          </div>

          {/* User Career Goal Pill */}
          <div className="px-4 py-3 mx-3 my-3 rounded-xl bg-[#0e162b] border border-slate-800/90 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Target Role</span>
              <p className="text-xs font-bold text-slate-100 truncate max-w-[130px]">{profile.careerGoal}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-indigo-400 font-semibold">{overallProgress}%</span>
              <div className="w-10 bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 mt-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                  {item.id === 'ai-assistant' && (
                    <span className="ml-auto flex items-center gap-1 text-[10px] uppercase font-bold text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30">
                      <Zap className="w-2.5 h-2.5" />
                      Live
                    </span>
                  )}
                  {item.id === 'recommendations' && (
                    <span className="ml-auto text-[10px] font-semibold text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                      6
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Profile badge */}
        <div className="p-4 border-t border-slate-800/80 space-y-3 bg-[#060a14]/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs border border-indigo-300/30">
                {profile.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-white truncate">{profile.name}</p>
                  {isCloudSynced && (
                    <span title="Synced to Firebase Firestore" className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 truncate">{profile.experienceLevel}</p>
              </div>
            </div>
            <button
              onClick={() => signOutUser()}
              title="Sign Out"
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
            <span>🔥 {profile.streakDays} Day Streak</span>
            <span className="text-indigo-400">{profile.weeklyHours}h/wk plan</span>
          </div>
        </div>
      </aside>
    </>
  );
};

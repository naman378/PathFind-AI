/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';
import { ToastContainer } from './components/common/ToastContainer';
import { PathFindLogo } from './components/common/PathFindLogo';
import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { LearningPathPage } from './pages/LearningPathPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ProgressPage } from './pages/ProgressPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ProfilePage } from './pages/ProfilePage';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentPage, setCurrentPage, isLoggedIn, isAuthLoading, firebaseUser } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Safely redirect logged-in users away from auth pages in an effect
  React.useEffect(() => {
    if (isLoggedIn && (currentPage === 'login' || currentPage === 'signup')) {
      setCurrentPage('dashboard');
    }
  }, [isLoggedIn, currentPage, setCurrentPage]);

  // Initial Auth Loading Screen
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#070B18] border border-indigo-500/40 shadow-xl shadow-indigo-500/20 flex items-center justify-center mx-auto animate-pulse">
            <PathFindLogo className="w-full h-full" />
          </div>
          <div className="flex items-center justify-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Loading PathFind AI...</span>
          </div>
        </div>
      </div>
    );
  }

  // Public Landing Page
  if (currentPage === 'landing') {
    return (
      <div className="min-h-screen bg-[#070b14]">
        <LandingPage />
        <ToastContainer />
      </div>
    );
  }

  // Onboarding Wizard (Accessible for new path configuration)
  if (currentPage === 'onboarding') {
    return (
      <div className="min-h-screen bg-[#070b14]">
        <OnboardingPage />
        <ToastContainer />
      </div>
    );
  }

  // Auth Pages
  if (currentPage === 'login' || currentPage === 'signup') {
    return (
      <div className="min-h-screen bg-[#070b14]">
        <AuthPage initialMode={currentPage === 'login' ? 'login' : 'signup'} />
        <ToastContainer />
      </div>
    );
  }

  // Protected Route Protection: If not logged in, redirect to login page
  if (!isLoggedIn && !firebaseUser) {
    return (
      <div className="min-h-screen bg-[#070b14]">
        <AuthPage initialMode="login" />
        <ToastContainer />
      </div>
    );
  }

  // App Shell Pages (Dashboard, Learning Path, Recommendations, Progress, Assessments, AI Assistant, Profile)
  const renderActivePage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'learning-path':
        return <LearningPathPage />;
      case 'recommendations':
        return <RecommendationsPage />;
      case 'progress':
        return <ProgressPage />;
      case 'assessments':
        return <AssessmentsPage />;
      case 'ai-assistant':
        return <AIAssistantPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex">
      {/* Desktop & Mobile Sidebar */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {renderActivePage()}
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

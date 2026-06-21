import React from 'react';
import { useUserStore } from '../store/userStore';
import { XPProgressBar } from './XPProgressBar';
import { BookOpen, LogOut, Award, Flame, Library, PlayCircle, User } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const AppShell: React.FC<AppShellProps> = ({ children, activeTab, setActiveTab }) => {
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);

  if (!user) return null;

  const trackLabels: Record<string, string> = {
    ICSE9: 'ICSE 9',
    ICSE10: 'ICSE 10',
    APCSA: 'AP CSA',
  };

  return (
    <div className="app-shell flex flex-col md:h-screen md:overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 p-6 border-b-4 border-black bg-gray-50/50">
        {/* Brand logo */}
        <div className="flex items-center gap-2">
          <div className="bg-purple-600 border-2 border-black rounded-xl p-1.5 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          <span className="font-display text-2xl uppercase tracking-wider text-black">
            Java<span className="text-purple-600">Bloom</span>
          </span>
        </div>

        {/* Pill Navigation */}
        <nav className="pill-nav flex items-center gap-1 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Award },
            { id: 'library', label: 'Library', icon: Library },
            { id: 'arena', label: 'Arena', icon: PlayCircle },
            { id: 'profile', label: 'Profile', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold transition-all border-2 ${
                  isActive
                    ? 'bg-purple-600 text-white border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]'
                    : 'text-gray-500 border-transparent hover:text-purple-600'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User profile dropdown/logout */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-xs font-extrabold text-black">{user.fullName}</span>
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wide">
              {trackLabels[user.track]} student
            </span>
          </div>

          <button
            onClick={logout}
            title="Log Out"
            className="p-2 border-2 border-black rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main split: Sidebar + Content */}
      <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-b-4 md:border-b-0 md:border-r-4 border-black p-6 flex flex-col gap-6 bg-gray-50/20 md:overflow-y-auto">
          
          {/* Active Track display */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Active Track</span>
            <div className="flex items-center justify-between border-2 border-black rounded-xl p-2.5 bg-white shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-xs font-extrabold text-black">
                {trackLabels[user.track]}
              </span>
              <button
                onClick={() => setActiveTab('profile')}
                className="text-[9px] font-extrabold uppercase bg-purple-50 text-purple-600 border border-purple-200 px-2 py-0.5 rounded-md hover:bg-purple-100 transition-colors cursor-pointer"
              >
                Change
              </button>
            </div>
          </div>

          {/* XP Progress widget */}
          <XPProgressBar />

          {/* Quick Stats list */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Daily Streak</span>
            <div className="flex items-center gap-3 bg-amber-50/50 border-2 border-amber-500/30 rounded-2xl p-3">
              <div className="bg-amber-500 text-white p-2 rounded-xl border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                <Flame size={18} fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-amber-800 leading-tight">
                  {user.currentStreak} Day Streak!
                </span>
                <span className="text-[10px] font-bold text-amber-600">
                  Best: {user.longestStreak} days
                </span>
              </div>
            </div>
          </div>

          <div className="mt-auto hidden md:flex flex-col p-4 rounded-2xl bg-purple-50/50 border-2 border-purple-200 text-center gap-1.5">
            <span className="text-xs font-extrabold text-purple-800">Need help?</span>
            <span className="text-[10px] font-bold text-purple-600 leading-normal">
              Step through visual traces in the Arena to learn Java logic!
            </span>
          </div>

        </aside>

        {/* Content Panel */}
        <main className="flex-1 p-6 md:p-8 bg-white overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

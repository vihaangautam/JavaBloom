import React from 'react';
import { useUserStore, getLevelTitle } from '../store/userStore';
import { User, Shield, BookOpen, Flame, Award, RefreshCw } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const user = useUserStore((state) => state.user);
  const activities = useUserStore((state) => state.activities);
  const logout = useUserStore((state) => state.logout);
  const changeTrack = useUserStore((state) => state.changeTrack);

  if (!user) return null;

  const currentLevelTitle = getLevelTitle(user.level);

  const trackLabels: Record<string, string> = {
    ICSE9: 'ICSE Class 9 (Computer Applications)',
    ICSE10: 'ICSE Class 10 (Computer Applications)',
    APCSA: 'AP Computer Science A',
  };

  const handleResetProgress = () => {
    if (confirm('Are you sure you want to clear all your local XP progress and start over?')) {
      localStorage.clear();
      logout();
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex justify-between items-start border-b border-gray-100 pb-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-4xl uppercase tracking-wider text-black">
            Student Profile
          </h2>
          <p className="text-xs font-bold text-gray-500">
            Manage your credentials, track course levels, and view your logged action history.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: General Profile Card */}
        <div className="card md:col-span-1 flex flex-col gap-5 border-2 border-black">
          <div className="flex flex-col items-center text-center pb-4 border-b border-gray-100">
            <div className="w-20 h-20 bg-purple-100 rounded-full border-2 border-black flex items-center justify-center text-purple-600 mb-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <User size={36} />
            </div>
            <h3 className="font-display text-2xl uppercase tracking-wide text-gray-900 leading-tight">
              {user.fullName}
            </h3>
            <span className="text-xs font-bold text-gray-400">@{user.username}</span>
          </div>

          <div className="flex flex-col gap-3 text-xs font-bold text-gray-600">
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-1.5 text-gray-400">
                <BookOpen size={14} />
                <span>Course</span>
              </div>
              <span className="text-black text-right max-w-[150px] overflow-hidden text-ellipsis">
                {trackLabels[user.track]}
              </span>
            </div>

            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Shield size={14} />
                <span>Account Role</span>
              </div>
              <span className="text-black capitalize">{user.role}</span>
            </div>

            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Award size={14} />
                <span>Level Title</span>
              </div>
              <span className="text-purple-600">{currentLevelTitle}</span>
            </div>
          </div>

          {/* Syllabus Track switcher */}
          <div className="border-t border-gray-100 pt-4 flex flex-col gap-2.5">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Syllabus Course Track</span>
            <div className="flex flex-col gap-2">
              {(['ICSE9', 'ICSE10', 'APCSA'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => changeTrack(t)}
                  className={`w-full text-left px-3 py-2 rounded-xl border-2 transition-all flex justify-between items-center text-[10px] font-extrabold cursor-pointer ${
                    user.track === t
                      ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-[1.5px_1.5px_0px_0px_rgba(147,51,234,1)]'
                      : 'border-black bg-white text-gray-700 hover:bg-gray-50 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  <span>{t === 'ICSE9' ? 'ICSE Class 9' : t === 'ICSE10' ? 'ICSE Class 10' : 'AP Computer Science A'}</span>
                  {user.track === t && (
                    <span className="text-[8px] font-extrabold px-2 py-0.5 rounded bg-purple-600 text-white border border-black">
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleResetProgress}
            className="w-full mt-2 flex items-center justify-center gap-1.5 py-3 border-2 border-black rounded-full bg-rose-50 text-rose-600 font-extrabold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <RefreshCw size={12} />
            <span>Reset Local Progress</span>
          </button>
        </div>

        {/* Right Side: Achievements & History logs */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Streak details */}
          <div className="card border-2 border-black flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 text-amber-600 border border-black p-3 rounded-2xl shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                <Flame size={24} fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl uppercase tracking-wider text-black">
                  Streak Statistics
                </span>
                <span className="text-xs font-bold text-gray-500">
                  Daily logins and lesson completions keep your streak alive!
                </span>
              </div>
            </div>

            <div className="flex gap-6 self-end md:self-center">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-400">Current</span>
                <span className="font-display text-2xl uppercase tracking-wide text-amber-600">
                  {user.currentStreak} Days
                </span>
              </div>
              <div className="flex flex-col border-l border-gray-100 pl-6">
                <span className="text-[10px] uppercase font-bold text-gray-400">Best Streak</span>
                <span className="font-display text-2xl uppercase tracking-wide text-gray-800">
                  {user.longestStreak} Days
                </span>
              </div>
            </div>
          </div>

          {/* Activity Log list */}
          <div className="card flex-1 flex flex-col min-h-[300px]">
            <h3 className="font-display text-2xl uppercase tracking-wider text-gray-800 border-b border-gray-100 pb-3 mb-4">
              Full Activity History
            </h3>

            {activities.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <span className="text-xs font-bold text-gray-400">Your logged history is currently empty.</span>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 max-h-[300px] scrollbar-thin scrollbar-thumb-gray-200">
                {activities.map((act) => (
                  <div 
                    key={act.id} 
                    className="flex justify-between items-center p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-extrabold text-gray-700 leading-tight">
                        {act.displayName}
                      </span>
                      <span className="text-[9px] font-bold text-gray-400">
                        {new Date(act.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <span className="xp-pill shrink-0 bg-purple-50 text-purple-600 border border-purple-200 font-extrabold text-xs px-2.5 py-1 rounded-full">
                      +{act.xpEarned} XP
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

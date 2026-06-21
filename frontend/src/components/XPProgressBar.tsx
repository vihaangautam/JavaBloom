import React from 'react';
import { useUserStore, getLevelTitle, getLevelFromXp } from '../store/userStore';

export const XPProgressBar: React.FC = () => {
  const user = useUserStore((state) => state.user);
  const getProgress = useUserStore((state) => state.getLevelProgress);

  if (!user) return null;

  const { percent, neededForNextLevel } = getProgress();
  const { level, nextLevelXp, prevLevelXp } = getLevelFromXp(user.totalXp);
  const title = getLevelTitle(level);

  return (
    <div className="flex flex-col gap-1 w-full bg-white p-3 rounded-2xl border-2 border-black/10">
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Rank</span>
          <span className="font-display text-lg leading-tight uppercase text-purple-600">
            Lvl {level} · {title}
          </span>
        </div>
        <span className="text-xs font-bold text-gray-500">
          {user.totalXp} / {nextLevelXp} XP
        </span>
      </div>
      
      <div className="w-full bg-gray-100 border-2 border-black rounded-full h-5 overflow-hidden p-[2px]">
        <div 
          className="bg-purple-600 h-full rounded-full transition-all duration-500 ease-out border-r border-black" 
          style={{ width: `${percent}%` }}
        />
      </div>
      
      <div className="flex justify-between text-[10px] font-bold text-gray-400">
        <span>{prevLevelXp} XP</span>
        <span>{neededForNextLevel} XP to Lvl {level + 1}</span>
      </div>
    </div>
  );
};

import { create } from 'zustand';

export interface Profile {
  id: string;
  username: string;
  fullName: string;
  track: 'ICSE9' | 'ICSE10' | 'APCSA';
  role: 'student' | 'teacher';
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

export interface UserActivity {
  id: string;
  activityType: string;
  displayName: string;
  xpEarned: number;
  createdAt: string; // ISO String
  metadata?: any;
}

export const xpRequirements = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500];

export function getLevelFromXp(xp: number): { level: number; nextLevelXp: number; prevLevelXp: number } {
  let currentLevel = 1;
  for (let i = 0; i < xpRequirements.length; i++) {
    if (xp >= xpRequirements[i]) {
      currentLevel = i + 1;
    } else {
      break;
    }
  }
  const maxLevel = xpRequirements.length;
  if (currentLevel >= maxLevel) {
    return {
      level: maxLevel,
      nextLevelXp: xpRequirements[maxLevel - 1],
      prevLevelXp: xpRequirements[maxLevel - 2]
    };
  }
  return {
    level: currentLevel,
    nextLevelXp: xpRequirements[currentLevel],
    prevLevelXp: xpRequirements[currentLevel - 1]
  };
}

export function getLevelTitle(level: number): string {
  const titles = [
    "Novice",
    "Apprentice",
    "Coder",
    "Debugger",
    "Tracer",
    "Analyst",
    "Architect",
    "Master",
    "Grandmaster",
    "Legend"
  ];
  return titles[level - 1] || "Legend";
}

interface UserState {
  user: Profile | null;
  activities: UserActivity[];
  isAuthenticated: boolean;
  login: (username: string) => Promise<boolean>;
  signup: (username: string, fullName: string, track: 'ICSE9' | 'ICSE10' | 'APCSA') => Promise<boolean>;
  logout: () => void;
  changeTrack: (track: 'ICSE9' | 'ICSE10' | 'APCSA') => Promise<void>;
  logActivity: (activityType: string, displayName: string, xpEarned: number, metadata?: any) => Promise<void>;
  syncSession: () => Promise<void>;
  getLevelProgress: () => { percent: number; currentXpInLevel: number; neededForNextLevel: number };
  getHeatmapData: () => { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[];
}

const API_BASE = "http://localhost:8000";

// Load cached values for instant initial render
const storedUser = localStorage.getItem('jb_user');
const storedActivities = localStorage.getItem('jb_activities');

const initialUser: Profile | null = storedUser ? JSON.parse(storedUser) : null;
const initialActivities: UserActivity[] = storedActivities ? JSON.parse(storedActivities) : [];

function mapBackendProfile(backendUser: any): Profile {
  return {
    id: backendUser.id,
    username: backendUser.username,
    fullName: backendUser.full_name,
    track: backendUser.track,
    role: backendUser.role,
    totalXp: backendUser.total_xp,
    level: backendUser.level,
    currentStreak: backendUser.current_streak,
    longestStreak: backendUser.longest_streak,
    lastActiveDate: backendUser.last_active_date
  };
}

export const useUserStore = create<UserState>((set, get) => ({
  user: initialUser,
  activities: initialActivities,
  isAuthenticated: initialUser !== null,

  login: async (username: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      if (!res.ok) return false;
      const user: Profile = mapBackendProfile(await res.json());

      // Fetch fresh activities list for this user
      const actsRes = await fetch(`${API_BASE}/profile/activities/${user.id}`);
      const activities: UserActivity[] = actsRes.ok ? await actsRes.json() : [];

      set({ user, activities, isAuthenticated: true });
      localStorage.setItem('jb_user', JSON.stringify(user));
      localStorage.setItem('jb_activities', JSON.stringify(activities));
      return true;
    } catch (e) {
      console.error("Login API call failed", e);
      return false;
    }
  },

  signup: async (username: string, fullName: string, track: 'ICSE9' | 'ICSE10' | 'APCSA') => {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, full_name: fullName, track })
      });
      if (!res.ok) return false;
      const user: Profile = mapBackendProfile(await res.json());

      set({ user, activities: [], isAuthenticated: true });
      localStorage.setItem('jb_user', JSON.stringify(user));
      localStorage.setItem('jb_activities', JSON.stringify([]));
      return true;
    } catch (e) {
      console.error("Signup API call failed", e);
      return false;
    }
  },

  logout: () => {
    set({ user: null, activities: [], isAuthenticated: false });
    localStorage.removeItem('jb_user');
    localStorage.removeItem('jb_activities');
  },

  changeTrack: async (track: 'ICSE9' | 'ICSE10' | 'APCSA') => {
    const { user } = get();
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/profile/track`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, track })
      });
      if (res.ok) {
        const updatedUser = mapBackendProfile(await res.json());
        set({ user: updatedUser });
        localStorage.setItem('jb_user', JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error("Failed to update track on backend", e);
    }
  },

  logActivity: async (activityType: string, displayName: string, xpEarned: number, metadata?: any) => {
    const { user, activities } = get();
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/activity/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          activityType,
          displayName,
          xpEarned,
          metadata
        })
      });
      if (res.ok) {
        const data = await res.json();
        const mappedProfile = mapBackendProfile(data.profile);
        const updatedActivities = [data.activity, ...activities];
        set({ user: mappedProfile, activities: updatedActivities });
        localStorage.setItem('jb_user', JSON.stringify(mappedProfile));
        localStorage.setItem('jb_activities', JSON.stringify(updatedActivities));
      }
    } catch (e) {
      console.error("Failed to log activity to database", e);
    }
  },

  syncSession: async () => {
    const { user } = get();
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/profile/me/${user.id}`);
      if (res.ok) {
        const freshUser = mapBackendProfile(await res.json());
        const actsRes = await fetch(`${API_BASE}/profile/activities/${freshUser.id}`);
        const freshActs = actsRes.ok ? await actsRes.json() : [];
        set({ user: freshUser, activities: freshActs });
        localStorage.setItem('jb_user', JSON.stringify(freshUser));
        localStorage.setItem('jb_activities', JSON.stringify(freshActs));
      }
    } catch (e) {
      console.error("Failed to synchronize session with database", e);
    }
  },

  getLevelProgress: () => {
    const { user } = get();
    if (!user) return { percent: 0, currentXpInLevel: 0, neededForNextLevel: 0 };
    
    const { nextLevelXp, prevLevelXp } = getLevelFromXp(user.totalXp);
    const xpRange = nextLevelXp - prevLevelXp;
    const xpEarnedInThisLevel = user.totalXp - prevLevelXp;
    
    if (xpRange === 0) return { percent: 100, currentXpInLevel: 0, neededForNextLevel: 0 };
    const percent = Math.min(100, Math.round((xpEarnedInThisLevel / xpRange) * 100));
    
    return {
      percent,
      currentXpInLevel: xpEarnedInThisLevel,
      neededForNextLevel: nextLevelXp - user.totalXp
    };
  },

  getHeatmapData: () => {
    const { activities } = get();
    const counts: Record<string, number> = {};
    
    activities.forEach(act => {
      const date = act.createdAt.split('T')[0];
      counts[date] = (counts[date] || 0) + 1;
    });

    const currentYear = new Date().getFullYear();
    const data: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[] = [];
    
    const startDate = new Date(Date.UTC(currentYear, 0, 1));
    const endDate = new Date(Date.UTC(currentYear, 11, 31));
    
    for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const count = counts[dateStr] || 0;
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count >= 11) level = 4;
      else if (count >= 6) level = 3;
      else if (count >= 3) level = 2;
      else if (count >= 1) level = 1;
      
      data.push({ date: dateStr, count, level });
    }
    
    return data;
  }
}));

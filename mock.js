import React, { useState } from 'react';
import { 
  Flame, 
  Trophy, 
  Code, 
  CheckCircle2, 
  Bug, 
  BookOpen,
  ChevronRight,
  Play,
  Filter,
  Search
} from 'lucide-react';

// --- Font Imports (Matches the TAITOR reference) ---
const FontStyles = () => (
  <style dangerouslySetInnerHTML={{__html: `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;800&display=swap');
    .font-display { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.03em; }
    .font-body { font-family: 'Nunito', sans-serif; }
  `}} />
);

// --- Jagged Star Badge (From TAITOR reference) ---
const JaggedBadge = ({ colorClass, icon: Icon }) => (
  <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className={`absolute inset-0 w-full h-full ${colorClass}`}>
      <polygon points="50,5 61,24 81,20 83,41 100,53 84,67 86,88 65,83 50,98 35,83 14,88 16,67 0,53 17,41 19,20 39,24" fill="currentColor"/>
    </svg>
    <div className="relative z-10 text-gray-800">
      <Icon size={24} strokeWidth={2.5} />
    </div>
  </div>
);

// --- Mock Data ---
const TOPICS = [
  { name: 'Loops', accuracy: 80, color: 'bg-green-400' },
  { name: 'Arrays', accuracy: 60, color: 'bg-yellow-400' },
  { name: 'Strings', accuracy: 100, color: 'bg-green-400' },
  { name: 'Operators', accuracy: 40, color: 'bg-red-400' },
];

const RECENT_ACTIVITY = [
  { title: 'Trace: for-loop', date: 'Today', type: 'Practice', xp: 15, icon: Code, badge: 'text-indigo-300' },
  { title: 'MCQ: Chapter 3', date: 'Yesterday', type: 'Assessment', xp: 20, icon: CheckCircle2, badge: 'text-green-300' },
  { title: 'Flashcard: 10 cards', date: 'Oct 12', type: 'Review', xp: 30, icon: BookOpen, badge: 'text-purple-300' },
  { title: 'Bug fix: off-by-one', date: 'Oct 10', type: 'Practice', xp: 15, icon: Bug, badge: 'text-red-300' },
];

const generateHeatmap = () => {
  const weeks = 22; 
  const days = 7;
  let grid = [];
  for (let c = 0; c < weeks; c++) {
    let week = [];
    for (let r = 0; r < days; r++) {
      const level = Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 1 : 0;
      week.push(level);
    }
    grid.push(week);
  }
  return grid;
};

const HEATMAP_COLORS = {
  0: 'bg-gray-100',       // Empty
  1: 'bg-purple-200',     // Lightest
  2: 'bg-purple-300',
  3: 'bg-purple-400',
  4: 'bg-purple-500',     // Deepest
};

export default function App() {
  const [heatmapData] = useState(generateHeatmap());

  return (
    <div className="min-h-screen bg-[#eaf0e7] font-body text-gray-800 p-4 md:p-8 flex items-center justify-center">
      <FontStyles />
      
      {/* OUTER APP FRAME (Like the tablet bezel in the reference) */}
      <div className="w-full max-w-7xl bg-white rounded-[2.5rem] md:rounded-[3rem] border-[4px] md:border-[8px] border-black overflow-hidden flex flex-col shadow-2xl relative min-h-[90vh]">
        
        {/* TOP NAVIGATION PILL */}
        <nav className="mx-4 md:mx-6 mt-4 md:mt-6 bg-[#d9e6d4] rounded-full px-6 py-3 flex items-center justify-between z-10">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="font-display text-2xl pt-1">
              {`{ }`} JAVABLOOM
            </div>
          </div>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-8 font-bold text-gray-600 text-[15px]">
            <a href="#" className="text-black bg-white/40 px-4 py-1.5 rounded-full">Dashboard</a>
            <a href="#" className="hover:text-black transition-colors">File Library</a>
            <a href="#" className="hover:text-black transition-colors">Practice Arena</a>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm hidden sm:block">Anya Sharma</span>
            <div className="w-9 h-9 rounded-full bg-[#f4e6c3] border-2 border-black flex items-center justify-center overflow-hidden">
               <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Anya&backgroundColor=transparent" alt="avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </nav>

        {/* MAIN SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto px-4 md:px-10 pt-8 pb-12">
          
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-display text-4xl md:text-5xl text-gray-900 uppercase">My Progress</h1>
          </div>

          {/* TOP STATS ROW (Matching the TAITOR badges) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
            {/* Stat 1 */}
            <div className="bg-gray-50/50 border-2 border-gray-100 rounded-[1.5rem] p-5 flex items-center gap-5 hover:border-purple-200 transition-colors">
              <JaggedBadge colorClass="text-[#e2d5f8]" icon={Flame} />
              <div>
                <h3 className="font-display text-3xl leading-none pt-1">15 DAYS</h3>
                <p className="text-sm font-bold text-gray-500">Current Streak</p>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-gray-50/50 border-2 border-gray-100 rounded-[1.5rem] p-5 flex items-center gap-5 hover:border-yellow-200 transition-colors">
              <JaggedBadge colorClass="text-[#fceabb]" icon={Trophy} />
              <div>
                <h3 className="font-display text-3xl leading-none pt-1">LEVEL 4</h3>
                <p className="text-sm font-bold text-gray-500">Debugger • 1,247 XP</p>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-gray-50/50 border-2 border-gray-100 rounded-[1.5rem] p-5 flex items-center gap-5 hover:border-green-200 transition-colors">
              <JaggedBadge colorClass="text-[#d9e6d4]" icon={CheckCircle2} />
              <div>
                <h3 className="font-display text-3xl leading-none pt-1">342 ACTIONS</h3>
                <p className="text-sm font-bold text-gray-500">Completed this year</p>
              </div>
            </div>
          </div>

          {/* CONTINUE LEARNING HERO */}
          <div className="bg-[#f0edfc] rounded-[2rem] p-6 md:p-8 mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-block bg-white text-purple-700 font-bold text-xs px-3 py-1.5 rounded-full mb-3 uppercase tracking-wide">
                Next Up
              </div>
              <h2 className="font-display text-3xl text-gray-900 mb-2">Arrays & Loops Trace</h2>
              <p className="text-gray-600 max-w-lg font-medium">
                You left off exactly where the `for` loop evaluates its second condition. Jump back in to master this!
              </p>
            </div>
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 transition-transform transform hover:scale-105 active:scale-95 shadow-md shrink-0 z-10">
              Resume Trace <Play size={16} fill="currentColor" />
            </button>
            
            {/* Decorative background shape */}
            <div className="absolute right-0 top-0 bottom-0 w-64 bg-purple-200/50 rounded-l-full blur-3xl -mr-20 pointer-events-none"></div>
          </div>

          {/* TWO COLUMN LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            
            {/* LEFT COLUMN: Heatmap + Topics */}
            <div className="space-y-8">
              
              {/* Heatmap Widget */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-2xl text-gray-800">Activity Graph</h3>
                  <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
                    <span>Less</span>
                    <div className="flex gap-0.5 mx-1">
                      {[0, 1, 2, 3, 4].map(l => <div key={l} className={`w-3 h-3 rounded-sm ${HEATMAP_COLORS[l]}`}></div>)}
                    </div>
                    <span>More</span>
                  </div>
                </div>
                
                <div className="bg-white border-2 border-gray-100 rounded-[1.5rem] p-6 shadow-sm overflow-x-auto">
                  <div className="inline-flex gap-1.5 min-w-max">
                    {heatmapData.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-1.5">
                        {week.map((level, dIdx) => (
                          <div 
                            key={`${wIdx}-${dIdx}`} 
                            className={`w-4 h-4 rounded-[4px] ${HEATMAP_COLORS[level]} hover:ring-2 hover:ring-purple-400 transition-all cursor-pointer`}
                            title="Activity day"
                          ></div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Accuracy Widget */}
              <div>
                <h3 className="font-display text-2xl text-gray-800 mb-4">Topic Accuracy</h3>
                <div className="bg-white border-2 border-gray-100 rounded-[1.5rem] p-6 shadow-sm">
                  <div className="space-y-5">
                    {TOPICS.map((topic, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1.5 font-bold">
                          <span className="text-gray-700">{topic.name}</span>
                          <span className="text-gray-400">{topic.accuracy}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${topic.color} transition-all duration-1000`} 
                            style={{ width: `${topic.accuracy}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm font-medium text-gray-700 flex items-start gap-3">
                    <div className="bg-white p-1 rounded-full text-red-500 shadow-sm shrink-0">
                      <Flame size={16} fill="currentColor" />
                    </div>
                    <p>
                      <strong className="text-red-500 font-bold">Tip:</strong> Your accuracy in Operators is dropping. Try a Type Confusion Drill to improve!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Recent Activity List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-2xl text-gray-800">Recent Lessons</h3>
                
                {/* Mock Filter Buttons (from reference) */}
                <div className="flex items-center gap-2">
                  <div className="bg-white border-2 border-gray-100 rounded-full px-3 py-1.5 flex items-center gap-2 text-sm font-bold text-gray-500 cursor-pointer hover:bg-gray-50">
                    <Search size={14} />
                    <span className="hidden sm:inline">Search</span>
                  </div>
                  <div className="bg-[#e4eefb] text-blue-700 rounded-full px-4 py-1.5 flex items-center gap-2 text-sm font-bold cursor-pointer">
                    <Filter size={14} />
                    <span>Filter</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                {RECENT_ACTIVITY.map((activity, i) => (
                  <div key={i} className="bg-white border-2 border-gray-100 rounded-[1.5rem] p-4 flex items-center justify-between hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      {/* Soft icon background */}
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 group-hover:scale-105 transition-transform">
                        <activity.icon size={22} className={activity.badge} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-[15px]">{activity.title}</p>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mt-1">
                          <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-500">{activity.type}</span>
                          <span>{activity.date}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 font-bold text-sm text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full">
                      +{activity.xp} XP
                    </div>
                  </div>
                ))}
                
                <button className="w-full mt-2 py-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors rounded-[1.5rem] border-2 border-dashed border-gray-200 hover:border-gray-300">
                  Load Older Activity
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
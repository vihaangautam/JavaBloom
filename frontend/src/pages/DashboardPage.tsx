import React from 'react';
import { useUserStore, getLevelTitle } from '../store/userStore';
import { JaggedBadge } from '../components/JaggedBadge';
import { ActivityHeatmap } from '../components/ActivityHeatmap';
import { Flame, Trophy, CheckCircle, BookOpen } from 'lucide-react';

interface DashboardPageProps {
  setActiveTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setActiveTab }) => {
  const user = useUserStore((state) => state.user);
  const activities = useUserStore((state) => state.activities);
  const logActivity = useUserStore((state) => state.logActivity);

  if (!user) return null;

  const currentLevelTitle = getLevelTitle(user.level);
  const totalActions = activities.length;

  // Track chapters mapped to Library structure
  const trackChapters: Record<string, { title: string; desc: string; topics: string[]; completed: number }[]> = {
    ICSE9: [
      {
        title: 'Chapter 1: Introduction to Java',
        desc: 'Understanding JDK, JVM, and compilation vs execution.',
        topics: ['History of Java', 'Bytecode & JVM', 'Compiling and Running Code'],
        completed: 3,
      },
      {
        title: 'Chapter 2: Variables & Data Types',
        desc: 'Declaring variables, numeric ranges, and memory sizes.',
        topics: ['Primitives (int, char, double)', 'Identifiers & Keywords', 'Variable Initialization'],
        completed: 3,
      },
      {
        title: 'Chapter 3: Operators & Expressions',
        desc: 'Arithmetic, logical, increment/decrement, and char casting.',
        topics: ['Modulus Operator (%)', 'Pre/Post Increment (a++ vs ++a)', 'Automatic Type Casting'],
        completed: 1,
      },
      {
        title: 'Chapter 4: Decision Making (Selection)',
        desc: 'Creating branch structures using conditionals.',
        topics: ['if-else Statements', 'Nested Conditionals', 'Switch-case structures'],
        completed: 0,
      },
    ],
    ICSE10: [
      {
        title: 'Chapter 1: OOPs Concepts Revision',
        desc: 'Abstraction, encapsulation, inheritance, and polymorphism.',
        topics: ['Class as a Template', 'Objects as Instances', 'OOPs Pillars'],
        completed: 3,
      },
      {
        title: 'Chapter 2: Single Dimensional Arrays',
        desc: 'Declaring, initialising, and searching through arrays.',
        topics: ['Array Declaration & Allocation', 'Linear Search', 'Bubble Sort Algorithm'],
        completed: 2,
      },
      {
        title: 'Chapter 3: Library Classes & String Handling',
        desc: 'Working with the String and Character utility methods.',
        topics: ['String concatenation', 'Length & Indexing methods', 'Character classification'],
        completed: 1,
      },
      {
        title: 'Chapter 4: User-Defined Methods',
        desc: 'Defining parameters, return statements, and method overloading.',
        topics: ['Method signature', 'Actual & Formal parameters', 'Overloading criteria'],
        completed: 0,
      },
    ],
    APCSA: [
      {
        title: 'Unit 1: Primitive Types & Objects',
        desc: 'Exploring variable scopes, classes, and object instantiation.',
        topics: ['Primitive Data Types', 'String Objects', 'Integer/Double Wrappers'],
        completed: 3,
      },
      {
        title: 'Unit 2: Boolean Expressions & if Statements',
        desc: 'Control structures, logical operations, and De Morgan\'s Laws.',
        topics: ['Boolean Expressions', 'Logical Operators', 'De Morgan\'s Law'],
        completed: 3,
      },
      {
        title: 'Unit 3: Iteration & Loops',
        desc: 'Exploring standard for loops, nested loops, and loop invariants.',
        topics: ['while loops', 'for loops', 'String traversal algorithms'],
        completed: 2,
      },
      {
        title: 'Unit 4: Writing Classes',
        desc: 'Designing classes, access modifiers, constructors, and encapsulation.',
        topics: ['Public vs Private modifiers', 'Constructors & Mutators', 'static keyword'],
        completed: 1,
      },
      {
        title: 'Unit 5: Array Collections & ArrayLists',
        desc: 'Linear arrays, ArrayList methods, and traversing collections.',
        topics: ['1D Arrays', 'ArrayList Class', 'Selection Sort / Insertion Sort'],
        completed: 0,
      },
    ],
  };

  // Resolve current active chapter study focus
  const chapters = trackChapters[user.track] || trackChapters.ICSE9;
  const currentChapterIndex = chapters.findIndex(c => c.completed < c.topics.length);
  const activeChapter = currentChapterIndex !== -1 ? chapters[currentChapterIndex] : chapters[chapters.length - 1];
  const activeChapterProgress = Math.round((activeChapter.completed / activeChapter.topics.length) * 100);

  // Map chapter units to specific recommended drills in the Arena
  const getRecommendedDrills = (chapterTitle: string) => {
    const titleLower = chapterTitle.toLowerCase();
    if (titleLower.includes('loop') || titleLower.includes('iteration') || titleLower.includes('array')) {
      return [
        {
          drillId: 'trace-visualizer',
          title: 'Trace Visualizer (Loops)',
          desc: 'Watch iteration loops shift variables step-by-step.',
          xp: 15,
        },
        {
          drillId: 'syntax-spotter',
          title: 'Syntax-Slip Spotter',
          desc: 'Spot and repair off-by-one boundary bugs in arrays.',
          xp: 10,
        },
      ];
    } else if (titleLower.includes('operator') || titleLower.includes('expression')) {
      return [
        {
          drillId: 'type-confusion',
          title: 'Type Confusion Drill',
          desc: 'Solve expressions mixing char values and division casting.',
          xp: 5,
        },
        {
          drillId: 'predict-output',
          title: 'Predict The Output',
          desc: 'Evaluate increment precedence statements.',
          xp: 10,
        },
      ];
    } else if (titleLower.includes('oops') || titleLower.includes('method') || titleLower.includes('class')) {
      return [
        {
          drillId: 'exam-writer',
          title: 'Exam Writing Simulator',
          desc: 'Write class constructors manually without syntax completion.',
          xp: 15,
        },
        {
          drillId: 'flashcards',
          title: 'Theory Drill Deck',
          desc: 'Review cards on parameters scheduling.',
          xp: 3,
        },
      ];
    } else {
      return [
        {
          drillId: 'flashcards',
          title: 'Theory Drill Deck',
          desc: 'Review cards on JVM compilation structures.',
          xp: 3,
        },
        {
          drillId: 'chapter-quiz',
          title: 'Timed Chapter MCQ',
          desc: 'Assess your knowledge on primitive data types.',
          xp: 20,
        },
      ];
    }
  };

  const recommendedDrills = getRecommendedDrills(activeChapter.title);

  // Click on drill: Simulates the completion, awards XP, and navigates
  const handleStartDrill = (drillId: string, drillTitle: string, xp: number) => {
    logActivity('arena_submit', `Completed Recommended drill: ${drillTitle}`, xp, { drillId });
    alert(`🎉 Completed Drill: ${drillTitle}! Earned +${xp} XP.`);
    setActiveTab('arena');
  };

  // Mock skills/accuracy based on track selection
  const skillAccuracy: Record<string, { topic: string; percent: number }[]> = {
    ICSE9: [
      { topic: 'Variables & Data Types', percent: 90 },
      { topic: 'Operators & Expressions', percent: 80 },
      { topic: 'Conditional Statements', percent: 65 },
      { topic: 'While Loops', percent: 45 },
    ],
    ICSE10: [
      { topic: 'Library Classes', percent: 85 },
      { topic: 'Single Dimensional Arrays', percent: 70 },
      { topic: 'Double Dimensional Arrays', percent: 50 },
      { topic: 'User-Defined Methods', percent: 60 },
    ],
    APCSA: [
      { topic: 'Primitive Types & Objects', percent: 95 },
      { topic: 'ArrayList Collections', percent: 75 },
      { topic: '2D Arrays', percent: 55 },
      { topic: 'Recursion', percent: 40 },
    ],
  };

  const currentSkills = skillAccuracy[user.track] || skillAccuracy.ICSE9;

  // Link weaker topics to helpful tools in the Arena
  const getSkillRecommendation = (topic: string, percent: number) => {
    if (percent >= 80) return null;
    const topicLower = topic.toLowerCase();
    if (topicLower.includes('loop') || topicLower.includes('while')) {
      return { text: 'Trace loops step-by-step', drillId: 'trace-visualizer' };
    }
    if (topicLower.includes('conditional') || topicLower.includes('boolean')) {
      return { text: 'Drill with flashcards', drillId: 'flashcards' };
    }
    if (topicLower.includes('array')) {
      return { text: 'Spot array bounds errors', drillId: 'syntax-spotter' };
    }
    if (topicLower.includes('method') || topicLower.includes('class')) {
      return { text: 'Practice overloading rules', drillId: 'chapter-quiz' };
    }
    return { text: 'Go to Arena', drillId: 'arena' };
  };

  // Helper for progress bar colors based on percentage
  const getBarColor = (percent: number) => {
    if (percent >= 80) return 'bg-emerald-500';
    if (percent >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <h2 className="font-display text-4xl uppercase tracking-wider text-black">
          My Progress
        </h2>
        <span className="text-xs font-bold text-gray-400">
          Last active: {user.lastActiveDate || 'Today'}
        </span>
      </div>

      {/* Decorative Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Streak card */}
        <div className="card flex items-center gap-4 border-2 border-black">
          <JaggedBadge color="#fde68a" icon={Flame} textColor="text-amber-600" />
          <div className="flex flex-col">
            <span className="font-display text-2xl uppercase tracking-wide leading-tight">
              {user.currentStreak} Days
            </span>
            <span className="text-xs font-bold text-gray-500">Current Streak</span>
          </div>
        </div>

        {/* Level card */}
        <div className="card flex items-center gap-4 border-2 border-black">
          <JaggedBadge color="#e9d5ff" icon={Trophy} textColor="text-purple-600" />
          <div className="flex flex-col">
            <span className="font-display text-2xl uppercase tracking-wide leading-tight">
              Lvl {user.level} · {currentLevelTitle}
            </span>
            <span className="text-xs font-bold text-gray-500">Mastery Rank</span>
          </div>
        </div>

        {/* Activities completed */}
        <div className="card flex items-center gap-4 border-2 border-black">
          <JaggedBadge color="#d9e6d4" icon={CheckCircle} textColor="text-emerald-600" />
          <div className="flex flex-col">
            <span className="font-display text-2xl uppercase tracking-wide leading-tight">
              {totalActions} Actions
            </span>
            <span className="text-xs font-bold text-gray-500">Total Activities</span>
          </div>
        </div>
      </div>

      {/* Study & Practice Loop (Connected to Library & Arena) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Syllabus Progress Card (Library Link) */}
        <div className="card border-2 border-black flex flex-col justify-between p-6 bg-purple-50/20">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] uppercase font-extrabold text-purple-600 bg-purple-100 border border-purple-200 px-2.5 py-0.5 rounded-full">
                Syllabus Unit Focus
              </span>
              <span className="text-xs font-bold text-purple-700">
                {activeChapter.completed} of {activeChapter.topics.length} topics done
              </span>
            </div>
            
            <div className="flex flex-col mt-2">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">ACTIVE LESSON</span>
              <h3 className="font-display text-2xl uppercase tracking-wide text-gray-900 leading-tight">
                {activeChapter.title}
              </h3>
              <p className="text-xs font-bold text-gray-500 mt-1 leading-normal">
                {activeChapter.desc}
              </p>
            </div>

            {/* Checklist of topics */}
            <div className="flex flex-col gap-1.5 mt-3">
              {activeChapter.topics.map((topic, index) => {
                const isDone = index < activeChapter.completed;
                return (
                  <div key={index} className="flex items-center gap-2 text-xs font-bold">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border text-[8px] font-extrabold ${isDone ? 'bg-emerald-500 border-black text-white' : 'bg-gray-100 border-gray-300 text-transparent'}`}>
                      {isDone && '✓'}
                    </span>
                    <span className={isDone ? 'text-gray-400 line-through' : 'text-gray-700'}>{topic}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-purple-100">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-gray-400 uppercase">Unit Progress</span>
              <span className="text-sm font-extrabold text-purple-700">{activeChapterProgress}% Complete</span>
            </div>
            <button
              onClick={() => setActiveTab('library')}
              className="btn-primary py-2 px-4 text-xs cursor-pointer"
            >
              <BookOpen size={12} />
              <span>Read Notes & Guides</span>
            </button>
          </div>
        </div>

        {/* Recommended Practice Checklist (Arena Link) */}
        <div className="card border-2 border-black flex flex-col justify-between p-6 bg-amber-50/10">
          <div className="flex flex-col gap-3">
            <span className="text-[10px] uppercase font-extrabold text-amber-600 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full w-max">
              Recommended Drills
            </span>
            
            <div className="flex flex-col mt-2">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">PRACTICE PATHWAY</span>
              <h3 className="font-display text-2xl uppercase tracking-wide text-gray-900 leading-tight">
                Reinforce Current Concept
              </h3>
              <p className="text-xs font-bold text-gray-500 mt-1 leading-normal">
                Complete these drills in the Arena to clear the syllabus unit and earn bonus XP.
              </p>
            </div>

            {/* Drills to run */}
            <div className="flex flex-col gap-2.5 mt-3">
              {recommendedDrills.map((drill, index) => (
                <div key={index} className="flex justify-between items-center p-2.5 border-2 border-dashed border-amber-300 rounded-xl bg-amber-50/50">
                  <div className="flex flex-col gap-0.5 max-w-[200px] sm:max-w-xs">
                    <span className="text-xs font-extrabold text-gray-800 leading-tight">{drill.title}</span>
                    <span className="text-[9px] font-bold text-gray-400 leading-tight">{drill.desc}</span>
                  </div>
                  <button
                    onClick={() => handleStartDrill(drill.drillId, drill.title, drill.xp)}
                    className="text-[9px] font-extrabold uppercase bg-amber-400 text-black border-2 border-black px-2.5 py-1.5 rounded-lg shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer whitespace-nowrap"
                  >
                    +{drill.xp} XP
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-amber-100 flex justify-end">
            <button
              onClick={() => setActiveTab('arena')}
              className="text-xs font-extrabold text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All Drills in Arena</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Split Layout: Heatmap + Accuracy & Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Heatmap and Skill Accuracy */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Heatmap Widget */}
          <div className="card border-2 border-black">
            <ActivityHeatmap />
          </div>

          {/* Skill Accuracy */}
          <div className="card flex flex-col gap-4 border-2 border-black">
            <h3 className="font-display text-2xl uppercase tracking-wider text-gray-800 border-b border-gray-100 pb-3">
              Accuracy By Topic
            </h3>
            <div className="flex flex-col gap-4">
              {currentSkills.map((skill, index) => {
                const recommendation = getSkillRecommendation(skill.topic, skill.percent);
                return (
                  <div key={index} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-extrabold text-gray-700">
                      <span>{skill.topic}</span>
                      <div className="flex items-center gap-2">
                        {recommendation && (
                          <button
                            onClick={() => handleStartDrill(recommendation.drillId, `${skill.topic} Practice`, 10)}
                            className="text-[9px] font-extrabold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded hover:bg-rose-100 transition-colors cursor-pointer"
                          >
                            {recommendation.text} ➔
                          </button>
                        )}
                        <span>{skill.percent}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 border border-black rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${getBarColor(skill.percent)}`}
                        style={{ width: `${skill.percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activities list */}
        <div className="flex flex-col gap-4">
          <div className="card flex-1 flex flex-col h-full min-h-[400px] border-2 border-black">
            <h3 className="font-display text-2xl uppercase tracking-wider text-gray-800 border-b border-gray-100 pb-3 mb-4">
              Recent Activity
            </h3>
            
            {activities.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <span className="text-3xl mb-2">🌱</span>
                <span className="text-xs font-bold text-gray-400">No activity logged yet today.</span>
                <span className="text-[10px] font-bold text-gray-400 mt-1 max-w-[200px]">
                  Perform some recommended drills above to log your first activity!
                </span>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 max-h-[500px] scrollbar-thin scrollbar-thumb-gray-200">
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
                        {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="xp-pill shrink-0 whitespace-nowrap bg-purple-50 text-purple-600 border border-purple-200 font-extrabold text-xs px-2.5 py-1 rounded-full">
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

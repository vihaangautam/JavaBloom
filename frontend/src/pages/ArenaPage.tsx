import React, { useState } from 'react';
import { 
  Play, Eye, HelpCircle, AlertTriangle, Bug, Terminal, FileCode, CheckSquare 
} from 'lucide-react';

// Import sub-pages
import { TypeConfusionView } from './drills/TypeConfusionView';
import { FlashcardsView } from './drills/FlashcardsView';
import { PredictOutputView } from './drills/PredictOutputView';
import { TraceVisualizerView } from './drills/TraceVisualizerView';

export const ArenaPage: React.FC = () => {
  const [activeDrillId, setActiveDrillId] = useState<string | null>(null);

  const drills = [
    {
      id: 'trace-visualizer',
      title: 'Trace Visualizer',
      desc: 'Step through Java code line-by-line and watch the memory variables flip values live.',
      xp: 15,
      tag: 'Flagship',
      icon: Eye,
      color: '#f0edfc',
      textColor: 'text-purple-600',
      implemented: true,
    },
    {
      id: 'predict-output',
      title: 'Predict The Output',
      desc: 'Look at a code snippet, predict the console output, and run a visual comparison check.',
      xp: 10,
      tag: 'Practice',
      icon: Terminal,
      color: '#fef3c7',
      textColor: 'text-amber-600',
      implemented: true,
    },
    {
      id: 'syntax-spotter',
      title: 'Syntax-Slip Spotter',
      desc: 'Find and repair single syntax bugs in common Java templates.',
      xp: 10,
      tag: 'Practice',
      icon: Bug,
      color: '#fee2e2',
      textColor: 'text-red-600',
      implemented: false,
    },
    {
      id: 'type-confusion',
      title: 'Type Confusion Drill',
      desc: 'Solve calculations mixing chars, integers, and division to master casting.',
      xp: 5,
      tag: 'Casting',
      icon: HelpCircle,
      color: '#dcfce7',
      textColor: 'text-emerald-600',
      implemented: true,
    },
    {
      id: 'error-decoder',
      title: 'Error Message Decoder',
      desc: 'Read exception logs (e.g. ArrayIndexOutOfBounds) and fix the culprit code line.',
      xp: 10,
      tag: 'Debugging',
      icon: AlertTriangle,
      color: '#ffedd5',
      textColor: 'text-orange-600',
      implemented: false,
    },
    {
      id: 'flashcards',
      title: 'Theory Drill Deck',
      desc: 'Anti-rote flashcards powered by the FSRS memory scheduling algorithm.',
      xp: 3,
      tag: 'Revision',
      icon: FileCode,
      color: '#e0f2fe',
      textColor: 'text-sky-600',
      implemented: true,
    },
    {
      id: 'chapter-quiz',
      title: 'Timed Chapter MCQ',
      desc: 'Test your understanding under exam time constraints with detailed tag breakdown.',
      xp: 20,
      tag: 'Quiz',
      icon: CheckSquare,
      color: '#e2f5ec',
      textColor: 'text-teal-600',
      implemented: false,
    },
    {
      id: 'exam-writer',
      title: 'Exam Writing Simulator',
      desc: 'Write complete programs in a Monaco editor with autocomplete & assistance disabled.',
      xp: 15,
      tag: 'Exam Spec',
      icon: Play,
      color: '#fce7f3',
      textColor: 'text-pink-600',
      implemented: false,
    },
  ];

  const handleStartDrill = (drillId: string, title: string, implemented: boolean) => {
    if (!implemented) {
      alert(`🚧 "${title}" is currently under development! Please try one of our interactive drills: Trace Visualizer, Predict the Output, Type Confusion, or Theory Drill Deck.`);
      return;
    }
    setActiveDrillId(drillId);
  };

  // Route to the selected drill view
  if (activeDrillId === 'type-confusion') {
    return <TypeConfusionView onBack={() => setActiveDrillId(null)} />;
  }

  if (activeDrillId === 'flashcards') {
    return <FlashcardsView onBack={() => setActiveDrillId(null)} />;
  }

  if (activeDrillId === 'predict-output') {
    return <PredictOutputView onBack={() => setActiveDrillId(null)} />;
  }

  if (activeDrillId === 'trace-visualizer') {
    return <TraceVisualizerView onBack={() => setActiveDrillId(null)} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h2 className="font-display text-4xl uppercase tracking-wider text-black">
          Practice Arena
        </h2>
        <p className="text-xs font-bold text-gray-500">
          Play games, step through variables, track syntax errors, and test your exam skills.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drills.map((drill) => {
          const Icon = drill.icon;
          return (
            <div 
              key={drill.id} 
              className="card flex flex-col justify-between h-full border-2 border-black"
            >
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div 
                    className="p-3 border border-black rounded-2xl shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]" 
                    style={{ backgroundColor: drill.color }}
                  >
                    <Icon className={drill.textColor} size={20} />
                  </div>
                  
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
                    {drill.tag}
                  </span>
                </div>

                <h3 className="font-display text-2xl uppercase tracking-wide text-gray-900 leading-tight">
                  {drill.title}
                </h3>
                
                <p className="text-xs font-bold text-gray-500 leading-relaxed">
                  {drill.desc}
                </p>
              </div>

              <div className="flex justify-between items-center mt-6 border-t border-gray-100 pt-4">
                <span className="text-xs font-extrabold text-purple-600">
                  +{drill.xp} XP reward
                </span>
                
                <button
                  onClick={() => handleStartDrill(drill.id, drill.title, drill.implemented)}
                  className="btn-primary py-2 px-4 text-xs"
                >
                  <span>Start Drill</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Award, Sparkles, BookOpen } from 'lucide-react';

interface QuestionData {
  id: string;
  track: string;
  chapter_title: string;
  type: string;
  content: {
    expression: string;
    options: string[];
    question: string;
  };
  correct_answer: string;
  explanation: string;
}

interface TypeConfusionViewProps {
  onBack: () => void;
}

export const TypeConfusionView: React.FC<TypeConfusionViewProps> = ({ onBack }) => {
  const user = useUserStore((state) => state.user);
  const logActivity = useUserStore((state) => state.logActivity);

  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:8000/questions?track=${user.track}&type=type_confusion`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch questions");
        return res.json();
      })
      .then((data: QuestionData[]) => {
        // Shuffle questions or keep them as is
        setQuestions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading type confusion questions:", err);
        setLoading(false);
      });
  }, [user]);

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    const isCorrect = option === currentQ.correct_answer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Completed all questions
      const xpReward = 5;
      logActivity(
        'arena_submit',
        `Completed Type Confusion Drill (${score}/${questions.length} correct)`,
        xpReward,
        { drillId: 'type-confusion', score, total: questions.length }
      );
      setShowSummary(true);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowSummary(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-gray-500">Loading drill questions from the vault...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <BookOpen className="text-gray-300 w-16 h-16" />
        <h3 className="font-display text-3xl uppercase">No Questions Seeded</h3>
        <p className="text-xs font-bold text-gray-500 max-w-sm">
          We couldn't find any Type Confusion questions for track: {user?.track}. Make sure the backend database is properly seeded!
        </p>
        <button onClick={onBack} className="btn-primary py-2 px-6">
          Back to Arena
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  if (showSummary) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6 py-8"
      >
        <div className="relative w-24 h-24 flex items-center justify-center text-purple-600">
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-purple-100 fill-current animate-pulse">
            <polygon points="50,5 61,24 81,20 83,41 100,53 84,67 86,88 65,83 50,98 35,83 14,88 16,67 0,53 17,41 19,20 39,24" />
          </svg>
          <Award size={48} className="relative z-10 text-purple-600 stroke-[2.5]" />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-display text-4xl uppercase tracking-wider text-black">Drill Completed!</h2>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Type Confusion Drill Finished</p>
        </div>

        <div className="bg-purple-50/50 border-4 border-black rounded-[2rem] p-8 w-full flex flex-col gap-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border-2 border-black rounded-2xl p-4">
              <span className="text-[10px] uppercase font-bold text-gray-400">Accuracy</span>
              <h4 className="font-display text-4xl text-purple-600">{percentage}%</h4>
              <span className="text-xs font-extrabold text-gray-600">
                {score} / {questions.length} Correct
              </span>
            </div>
            <div className="bg-white border-2 border-black rounded-2xl p-4 flex flex-col justify-center items-center">
              <span className="text-[10px] uppercase font-bold text-gray-400">Rewards</span>
              <div className="flex items-center gap-1.5 text-amber-500 mt-1">
                <Sparkles size={20} fill="currentColor" />
                <h4 className="font-display text-4xl text-amber-600">+5 XP</h4>
              </div>
              <span className="text-xs font-extrabold text-gray-600">Streak Updated!</span>
            </div>
          </div>

          <div className="text-left bg-white border-2 border-black rounded-2xl p-4">
            <h5 className="text-xs font-extrabold text-black uppercase mb-1">Knowledge Summary</h5>
            <p className="text-xs text-gray-500 font-bold leading-relaxed">
              You practiced evaluating complex Java operator chains involving string concatenation, integer division, and float parsing.
            </p>
          </div>
        </div>

        <div className="flex gap-4 w-full justify-center">
          <button onClick={handleRetry} className="btn-primary py-3 px-6 bg-white text-black border-2 hover:bg-gray-50">
            <RotateCcw size={16} />
            <span>Try Again</span>
          </button>
          <button onClick={onBack} className="btn-primary py-3 px-6">
            <span>Finish Drill</span>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <button onClick={onBack} className="text-xs font-extrabold text-purple-600 hover:underline uppercase">
            &larr; Exit Drill
          </button>
          <h2 className="font-display text-3xl uppercase mt-1">Type Confusion Drill</h2>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Progress</span>
          <span className="text-sm font-extrabold text-black">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-100 rounded-full border-2 border-black overflow-hidden">
        <div
          className="h-full bg-purple-600 border-r-2 border-black transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="bg-white border-4 border-black rounded-[2rem] p-6 md:p-8 flex flex-col gap-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        
        {/* Question text */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200 w-max">
            {currentQuestion.chapter_title}
          </span>
          <h3 className="text-lg font-bold text-gray-800">
            {currentQuestion.content.question}
          </h3>
        </div>

        {/* Expression code box */}
        <div className="bg-gray-900 border-2 border-black rounded-2xl p-6 text-center relative overflow-hidden group">
          <div className="absolute top-2 left-3 text-[10px] font-mono text-gray-500 uppercase tracking-widest select-none">
            JAVA EXPRESSION
          </div>
          <code className="font-mono text-xl md:text-2xl text-emerald-400 block py-2 select-all font-bold">
            {currentQuestion.content.expression}
          </code>
        </div>

        {/* Options grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.content.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentQuestion.correct_answer;
            
            let btnStyle = "border-black bg-white hover:bg-gray-50 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0";
            let stateIcon = null;

            if (isAnswered) {
              if (isCorrect) {
                // Correct option gets highlighted green
                btnStyle = "border-green-600 bg-green-50 text-green-800 shadow-[2px_2px_0px_0px_rgba(34,197,94,1)]";
                stateIcon = <CheckCircle2 className="text-green-600 w-5 h-5 shrink-0" />;
              } else if (isSelected) {
                // Selected incorrect option gets highlighted red
                btnStyle = "border-red-600 bg-red-50 text-red-800 shadow-[2px_2px_0px_0px_rgba(239,68,68,1)]";
                stateIcon = <XCircle className="text-red-600 w-5 h-5 shrink-0" />;
              } else {
                // Other options fade out slightly
                btnStyle = "border-gray-200 bg-white text-gray-400 opacity-60";
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(option)}
                className={`border-2 rounded-2xl p-4 font-bold text-left text-sm md:text-base flex items-center justify-between transition-all duration-150 cursor-pointer ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 border-2 border-black rounded-lg bg-gray-50 flex items-center justify-center text-xs font-extrabold shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="font-mono text-gray-800">{option}</span>
                </div>
                {stateIcon}
              </button>
            );
          })}
        </div>

        {/* Explanation Card */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t-2 border-gray-100 pt-6 flex flex-col gap-3"
            >
              <div className={`p-4 rounded-2xl border-2 flex gap-3 ${
                selectedOption === currentQuestion.correct_answer 
                  ? 'bg-green-50/50 border-green-500/20 text-green-900' 
                  : 'bg-red-50/50 border-red-500/20 text-red-900'
              }`}>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wide">
                    {selectedOption === currentQuestion.correct_answer ? '🎉 Spot On!' : '💡 Learning Opportunity'}
                  </span>
                  <p className="text-xs font-bold leading-relaxed text-gray-700">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <button onClick={handleNext} className="btn-primary py-2.5 px-5 text-xs">
                  <span>{currentIndex + 1 === questions.length ? 'Show Results' : 'Next Question'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

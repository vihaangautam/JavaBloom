import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Award, Sparkles, BookOpen, ChevronDown, ArrowLeft, Terminal, AlertCircle } from 'lucide-react';

interface QuestionData {
  id: string;
  track: string;
  chapter_title: string;
  type: string;
  difficulty: string;
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

const ruleFamilies = [
  { id: 'rule_1', title: 'Integer Division', hint: '5 / 2 = 2', desc: 'Learn how Java truncates fraction parts when dividing two integers.', difficulty: 'Easy', xp: '5 XP', color: '#fee2e2', textColor: 'text-red-600' },
  { id: 'rule_2', title: 'String Concatenation', hint: '"A" + 3 + 4 = "A34"', desc: 'Master left-to-right String promotion and evaluation precedence.', difficulty: 'Medium', xp: '10 XP', color: '#fef3c7', textColor: 'text-amber-600' },
  { id: 'rule_3', title: 'Char Arithmetic', hint: "'A' + 1 = 66", desc: 'Understand how char values promote to int under numeric operators.', difficulty: 'Medium', xp: '10 XP', color: '#dcfce7', textColor: 'text-emerald-600' },
  { id: 'rule_4', title: 'Widening', hint: '5 / 2.0 = 2.5', desc: 'Learn how smaller types are automatically promoted to double/float.', difficulty: 'Easy', xp: '5 XP', color: '#e0f2fe', textColor: 'text-sky-600' },
  { id: 'rule_5', title: 'Casting', hint: '(int) 3.9 = 3', desc: 'Master explicit casting and decimal truncation behavior.', difficulty: 'Easy', xp: '5 XP', color: '#ffedd5', textColor: 'text-orange-600' },
  { id: 'rule_6', title: 'Compound Expressions', hint: '"A" + (3 + 4) = "A7"', desc: 'Tackle complex precedence hierarchies and parentheses traps.', difficulty: 'Hard', xp: '10 XP', color: '#fce7f3', textColor: 'text-pink-600' },
  { id: 'mixed', title: 'Mixed Challenge', hint: 'Randomized Rules', desc: 'The ultimate challenge. Randomized questions across all 6 Java rules.', difficulty: 'Hard', xp: '10 XP', color: '#f0edfc', textColor: 'text-purple-600' }
];

export const TypeConfusionView: React.FC<TypeConfusionViewProps> = ({ onBack }) => {
  const user = useUserStore((state) => state.user);
  const logActivity = useUserStore((state) => state.logActivity);
  const syncSession = useUserStore((state) => state.syncSession);

  // Selection states
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Drill states
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Spaced Repetition Retry queue
  const [retryQueue, setRetryQueue] = useState<QuestionData[]>([]);
  const [inRetryMode, setInRetryMode] = useState(false);

  const getRuleTitle = (ruleId: string | null) => {
    if (!ruleId) return "";
    return ruleFamilies.find((r) => r.id === ruleId)?.title || "Mixed Challenge";
  };

  const getSessionXp = () => {
    if (selectedRule === 'rule_1' || selectedRule === 'rule_4' || selectedRule === 'rule_5') {
      return 5;
    }
    return 10;
  };

  const handleStartDrill = (ruleId: string) => {
    setSelectedRule(ruleId);
    setLoadingQuestions(true);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setRetryQueue([]);
    setInRetryMode(false);
    setShowSummary(false);
    setShowDropdown(false);

    const url = ruleId === 'mixed'
      ? `http://localhost:8000/questions?track=${user?.track}&type=type_confusion`
      : `http://localhost:8000/questions?track=${user?.track}&type=type_confusion&sub_type=${ruleId}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch questions");
        return res.json();
      })
      .then((data: QuestionData[]) => {
        let processed = [...data];
        if (ruleId === 'mixed') {
          // Shuffle mixed challenge and slice to 10 questions
          processed = processed.sort(() => Math.random() - 0.5).slice(0, 10);
        } else {
          // Sort specific rules easy -> medium -> hard
          const diffOrder = { easy: 1, medium: 2, hard: 3 };
          processed.sort((a, b) => {
            const orderA = diffOrder[a.difficulty as keyof typeof diffOrder] || 2;
            const orderB = diffOrder[b.difficulty as keyof typeof diffOrder] || 2;
            return orderA - orderB;
          });
        }
        setQuestions(processed);
        setLoadingQuestions(false);
      })
      .catch((err) => {
        console.error("Error loading type confusion questions:", err);
        setLoadingQuestions(false);
      });
  };

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    const isCorrect = option === currentQ.correct_answer;
    if (isCorrect) {
      if (!inRetryMode) {
        setScore((prev) => prev + 1);
      }
    } else {
      // Add to retry queue for spaced repetition review
      setRetryQueue((prev) => [...prev, currentQ]);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else if (retryQueue.length > 0) {
      // Transition to retry round for failed questions
      setQuestions(retryQueue);
      setRetryQueue([]);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setInRetryMode(true);
    } else {
      // Finished everything (including retries!)
      const xpReward = getSessionXp();
      logActivity(
        'arena_submit',
        `Completed Type Confusion Drill (${getRuleTitle(selectedRule)})`,
        xpReward,
        { drillId: `type-confusion-${selectedRule}`, score, total: questions.length }
      ).then(() => {
        syncSession();
      });
      setShowSummary(true);
    }
  };

  const handleRetrySession = () => {
    if (selectedRule) {
      handleStartDrill(selectedRule);
    }
  };

  const renderSelectionMenu = () => {
    return (
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center pb-4 border-b-4 border-black">
          <div>
            <button onClick={onBack} className="flex items-center gap-1 text-xs font-extrabold text-purple-600 hover:underline uppercase">
              <ArrowLeft size={14} /> Back to Arena
            </button>
            <h2 className="font-display text-4xl uppercase mt-2 tracking-wide text-black">Type Confusion Drill</h2>
            <p className="text-sm font-bold text-gray-500 mt-1">Select a Rule Family to practice or choose the Mixed Challenge.</p>
          </div>
          <div className="bg-amber-50 border-2 border-black rounded-xl p-2 px-4 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <BookOpen className="text-amber-600 w-5 h-5" />
            <span className="text-xs font-black uppercase text-amber-800">Track: {user?.track}</span>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4"
        >
          {ruleFamilies.map((rule) => {
            const isMixed = rule.id === 'mixed';
            return (
              <div 
                key={rule.id}
                className={`bg-white border-4 border-black rounded-[20px] p-6 flex flex-col justify-between gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all ${
                  isMixed ? 'md:col-span-2 lg:col-span-3 border-purple-600' : ''
                }`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span 
                      className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
                      style={{ backgroundColor: rule.color }}
                    >
                      {rule.title}
                    </span>
                    <span className="text-xs font-extrabold text-purple-600">
                      +{rule.xp} Reward
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-display text-2xl uppercase tracking-tight text-black">
                      {rule.title}
                    </h3>
                    <p className="text-xs font-bold text-gray-500 leading-relaxed">
                      {rule.desc}
                    </p>
                  </div>

                  {/* Hint Code block */}
                  <div className="bg-gray-50 border-2 border-black rounded-xl p-3 font-mono text-xs text-gray-700 font-bold flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Example</span>
                    <code className="text-purple-600 select-all font-mono">{rule.hint}</code>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100">
                  <span className="text-xs font-black uppercase text-gray-400">
                    Difficulty: <span className="text-black">{rule.difficulty}</span>
                  </span>
                  <button 
                    onClick={() => handleStartDrill(rule.id)}
                    className="btn-primary py-2.5 px-5 text-xs uppercase"
                  >
                    <span>Start Practice</span>
                  </button>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    );
  };

  const renderSummary = () => {
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
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Rule Family Drill Review Finished
          </p>
        </div>

        <div className="bg-purple-50/50 border-4 border-black rounded-[2rem] p-8 w-full flex flex-col gap-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border-2 border-black rounded-2xl p-4">
              <span className="text-[10px] uppercase font-bold text-gray-400">First-Try Accuracy</span>
              <h4 className="font-display text-4xl text-purple-600">{percentage}%</h4>
              <span className="text-xs font-extrabold text-gray-600">
                {score} / {questions.length} Correct
              </span>
            </div>
            <div className="bg-white border-2 border-black rounded-2xl p-4 flex flex-col justify-center items-center">
              <span className="text-[10px] uppercase font-bold text-gray-400">Rewards</span>
              <div className="flex items-center gap-1.5 text-amber-500 mt-1">
                <Sparkles size={20} fill="currentColor" />
                <h4 className="font-display text-4xl text-amber-600">+{getSessionXp()} XP</h4>
              </div>
              <span className="text-xs font-extrabold text-gray-600">Streak Updated!</span>
            </div>
          </div>

          <div className="text-left bg-white border-2 border-black rounded-2xl p-4">
            <h5 className="text-xs font-extrabold text-black uppercase mb-1">Concept Mastery Verified</h5>
            <p className="text-xs text-gray-500 font-bold leading-relaxed">
              Spaced repetition forced retries ensured you solved all type rules correctly. You're building solid memory schemas for evaluation rules!
            </p>
          </div>
        </div>

        <div className="flex gap-4 w-full justify-center">
          <button onClick={handleRetrySession} className="btn-primary py-3 px-6 bg-white text-black border-2 hover:bg-gray-50">
            <RotateCcw size={16} />
            <span>Try Again</span>
          </button>
          <button onClick={() => setSelectedRule(null)} className="btn-primary py-3 px-6">
            <span>Choose Another Rule</span>
          </button>
        </div>
      </motion.div>
    );
  };

  if (selectedRule === null) {
    return renderSelectionMenu();
  }

  if (loadingQuestions) {
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
        <h3 className="font-display text-3xl uppercase text-black">No Questions Found</h3>
        <p className="text-xs font-bold text-gray-500 max-w-sm">
          We couldn't find any questions for the selected Rule Family. Make sure the database is properly seeded!
        </p>
        <button onClick={() => setSelectedRule(null)} className="btn-primary py-2 px-6">
          Back to Selection
        </button>
      </div>
    );
  }

  if (showSummary) {
    return renderSummary();
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div className="relative">
          <button onClick={() => setSelectedRule(null)} className="text-xs font-extrabold text-purple-600 hover:underline uppercase">
            &larr; Exit Drill
          </button>
          
          <div className="relative mt-1">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="font-display text-3xl uppercase text-black flex items-center gap-1.5 hover:text-purple-600 transition-colors focus:outline-none"
            >
              {getRuleTitle(selectedRule)}
              <ChevronDown size={24} className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showDropdown && (
              <div className="absolute left-0 mt-2 w-72 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 p-2 flex flex-col gap-1 max-h-80 overflow-y-auto">
                <div className="text-[10px] font-black uppercase text-gray-400 px-3 py-1.5 border-b-2 border-gray-100 mb-1">
                  Switch Rule
                </div>
                {ruleFamilies.map((rule) => (
                  <button
                    key={rule.id}
                    onClick={() => {
                      setShowDropdown(false);
                      handleStartDrill(rule.id);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border-2 hover:border-black hover:bg-purple-50 transition-all font-bold text-xs flex justify-between items-center ${
                      selectedRule === rule.id 
                        ? 'border-black bg-purple-100 text-purple-900' 
                        : 'border-transparent text-gray-700'
                    }`}
                  >
                    <span>{rule.title}</span>
                    <span className="text-[10px] bg-white border-2 border-black rounded px-1.5 py-0.5 ml-2 shrink-0">
                      {rule.difficulty}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-gray-400 uppercase">
            {inRetryMode ? "Reviewing Mistakes" : "Progress"}
          </span>
          <span className="text-sm font-extrabold text-black">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-100 rounded-full border-2 border-black overflow-hidden">
        <div
          className={`h-full border-r-2 border-black transition-all duration-300 ${inRetryMode ? 'bg-amber-500' : 'bg-purple-600'}`}
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="bg-white border-4 border-black rounded-[2rem] p-6 md:p-8 flex flex-col gap-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left">
        
        {/* Question text */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200 w-max">
              {currentQuestion.chapter_title}
            </span>
            {inRetryMode && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 w-max">
                Retry Attempt
              </span>
            )}
          </div>
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
                  <span>
                    {currentIndex + 1 === questions.length && retryQueue.length === 0 
                      ? 'Show Results' 
                      : 'Next Question'}
                  </span>
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

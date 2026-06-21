import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Award, Sparkles, BookOpen, Terminal } from 'lucide-react';

interface QuestionData {
  id: string;
  track: string;
  chapter_title: string;
  type: string;
  content: {
    code: string;
    question: string;
  };
  correct_answer: string;
  explanation: string;
}

interface PredictOutputViewProps {
  onBack: () => void;
}

export const PredictOutputView: React.FC<PredictOutputViewProps> = ({ onBack }) => {
  const user = useUserStore((state) => state.user);
  const logActivity = useUserStore((state) => state.logActivity);

  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prediction, setPrediction] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:8000/questions?track=${user.track}&type=predict_output`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch questions");
        return res.json();
      })
      .then((data: QuestionData[]) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading predict output questions:", err);
        setLoading(false);
      });
  }, [user]);

  const handleSubmit = () => {
    if (isAnswered) return;
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    // Check answer case-insensitively and trim ends, but in coding sometimes spaces matter,
    // so let's do a strict-ish check but normalized space
    const isCorrect = prediction.replace(/\r\n/g, '\n') === currentQ.correct_answer.replace(/\r\n/g, '\n');
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setPrediction('');
      setIsAnswered(false);
    } else {
      // Completed all questions
      const xpReward = 10;
      logActivity(
        'arena_submit',
        `Completed Predict the Output Drill (${score}/${questions.length} correct)`,
        xpReward,
        { drillId: 'predict-output', score, total: questions.length }
      );
      setShowSummary(true);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setPrediction('');
    setIsAnswered(false);
    setScore(0);
    setShowSummary(false);
  };

  const renderDiff = (actual: string, expected: string) => {
    // Show a character-by-character comparison highlight for debugging trailing spacing, etc.
    const maxLen = Math.max(actual.length, expected.length);
    const elements = [];

    for (let i = 0; i < maxLen; i++) {
      const actChar = actual[i];
      const expChar = expected[i];

      let bgColor = 'bg-gray-100 text-gray-800';
      let displayChar = actChar || ' ';

      if (actChar === expChar) {
        bgColor = 'bg-green-100 text-green-800';
      } else {
        bgColor = 'bg-red-100 text-red-800 border border-red-300';
        displayChar = actChar || '∅'; // Show empty set symbol for missing character
      }

      // Handle spaces visually so student sees where they missed spacing!
      const isSpace = displayChar === ' ';
      
      elements.push(
        <span
          key={i}
          className={`font-mono text-sm px-1.5 py-0.5 rounded ${bgColor} ${isSpace ? 'border border-dashed border-gray-400 min-w-[20px] inline-block text-center' : ''}`}
          title={isSpace ? 'Space Character' : `Char: ${displayChar}`}
        >
          {isSpace ? '␣' : displayChar}
        </span>
      );
    }

    return (
      <div className="flex flex-wrap gap-1 p-3 bg-gray-50 border border-gray-200 rounded-xl max-h-40 overflow-y-auto">
        {elements}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-gray-500">Loading code snippets from the server...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <BookOpen className="text-gray-300 w-16 h-16" />
        <h3 className="font-display text-3xl uppercase">No Snippets Seeded</h3>
        <p className="text-xs font-bold text-gray-500 max-w-sm">
          We couldn't find any Predict the Output templates for track: {user?.track}. Run the seed script to start!
        </p>
        <button onClick={onBack} className="btn-primary py-2 px-6">
          Back to Arena
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isCorrect = prediction.replace(/\r\n/g, '\n') === currentQuestion.correct_answer.replace(/\r\n/g, '\n');

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
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Console Output Prediction Review finished</p>
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
                <h4 className="font-display text-4xl text-amber-600">+10 XP</h4>
              </div>
              <span className="text-xs font-extrabold text-gray-600">Streak Updated!</span>
            </div>
          </div>

          <div className="text-left bg-white border-2 border-black rounded-2xl p-4">
            <h5 className="text-xs font-extrabold text-black uppercase mb-1">Code Comprehension Progress</h5>
            <p className="text-xs text-gray-500 font-bold leading-relaxed">
              Predicting output without compiling requires rigorous mental model tracing. You are mastering loop mechanics and variable tracking!
            </p>
          </div>
        </div>

        <div className="flex gap-4 w-full justify-center">
          <button onClick={handleRetry} className="btn-primary py-3 px-6 bg-white text-black border-2 hover:bg-gray-50">
            <RotateCcw size={16} />
            <span>Try Again</span>
          </button>
          <button onClick={onBack} className="btn-primary py-3 px-6">
            <span>Back to Arena</span>
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
          <h2 className="font-display text-3xl uppercase mt-1">Predict The Output</h2>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Snippet</span>
          <span className="text-sm font-extrabold text-black">
            {currentIndex + 1} of {questions.length}
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

      {/* Main Grid: Code on Left, Prediction on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Box */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 w-max">
              {currentQuestion.chapter_title}
            </span>
            <span className="text-xs font-bold text-gray-400">Java Code Editor</span>
          </div>

          <div className="border-4 border-black rounded-[1.5rem] overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-[#1e1e1e]">
            <Editor
              height="280px"
              language="java"
              theme="vs-dark"
              value={currentQuestion.content.code}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                fontSize: 14,
                domReadOnly: true,
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Prediction Control Box */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Enter Predictions</span>
            <Terminal size={16} className="text-gray-400" />
          </div>

          <div className="bg-white border-4 border-black rounded-[1.5rem] p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-gray-500 uppercase">
                Console Output
              </label>
              <textarea
                rows={4}
                value={prediction}
                disabled={isAnswered}
                onChange={(e) => setPrediction(e.target.value)}
                placeholder="Type the exact printed output here... (e.g. 2.0 or 1 0 1)"
                className="w-full border-2 border-black rounded-xl p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 bg-gray-50/50"
              />
            </div>

            {!isAnswered ? (
              <button
                onClick={handleSubmit}
                disabled={!prediction.trim()}
                className="btn-primary py-3 w-full text-xs uppercase"
              >
                <span>Submit Prediction</span>
              </button>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Result Feedback Banner */}
                <div className={`p-4 rounded-xl border-2 flex items-start gap-2.5 ${
                  isCorrect 
                    ? 'bg-green-50 border-green-500/20 text-green-900' 
                    : 'bg-red-50 border-red-500/20 text-red-900'
                }`}>
                  {isCorrect ? (
                    <CheckCircle2 className="text-green-600 w-5 h-5 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="text-red-600 w-5 h-5 shrink-0 mt-0.5" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold uppercase">
                      {isCorrect ? 'Output Matches!' : 'Output Mismatch'}
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 mt-0.5 leading-relaxed">
                      {isCorrect ? 'Brilliant prediction! Your simulation ran perfectly.' : 'Spacing, line endings, or variables were mismatched.'}
                    </span>
                  </div>
                </div>

                {/* Diff Comparison */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase">Interactive Spacing Check</span>
                  {renderDiff(prediction, currentQuestion.correct_answer)}
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase">Correct Output</span>
                  <pre className="p-3 bg-gray-900 text-emerald-400 rounded-xl font-mono text-xs font-bold border border-black">
                    {currentQuestion.correct_answer}
                  </pre>
                </div>

                <div className="bg-purple-50/50 border border-purple-200 rounded-xl p-3 text-[11px] font-bold text-gray-600 leading-normal">
                  <strong>Explanation:</strong> {currentQuestion.explanation}
                </div>

                <button onClick={handleNext} className="btn-primary py-3 w-full text-xs uppercase">
                  <span>{currentIndex + 1 === questions.length ? 'Results' : 'Next Snippet'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

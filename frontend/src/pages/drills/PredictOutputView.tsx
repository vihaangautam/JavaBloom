import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Award, Sparkles, BookOpen, Terminal, ArrowLeft, AlertCircle, ChevronRight, ChevronDown } from 'lucide-react';

interface QuestionData {
  id: string;
  track: string;
  chapter_title: string;
  chapter_number?: number;
  type: string;
  content: {
    code: string;
    question: string;
  };
  correct_answer: string;
  explanation: string;
}

interface ChapterProgress {
  chapter_number: number;
  chapter_title: string;
  total_questions: number;
  correct_count: number;
  attempted_count: number;
  mistakes: number;
  completion_pct: number;
}

interface MistakeDetail {
  question_id: string;
  code: string;
  correct_answer: string;
  user_answers: string[];
  explanation?: string;
  attempt_count: number;
}

interface PredictOutputViewProps {
  onBack: () => void;
}

export const PredictOutputView: React.FC<PredictOutputViewProps> = ({ onBack }) => {
  const user = useUserStore((state) => state.user);
  const syncSession = useUserStore((state) => state.syncSession);

  // Chapters list states
  const [chapters, setChapters] = useState<ChapterProgress[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(true);

  // Active chapter/drill states
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prediction, setPrediction] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    is_correct: boolean;
    correct_answer: string;
    explanation?: string;
    xp_earned: number;
    already_solved: boolean;
  } | null>(null);

  // Session summary/XP states
  const [sessionScore, setSessionScore] = useState(0);
  const [xpEarnedInSession, setXpEarnedInSession] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);

  // Mistake review list states
  const [loadingMistakes, setLoadingMistakes] = useState(false);
  const [mistakesList, setMistakesList] = useState<MistakeDetail[]>([]);

  // Fetch chapter progress on mount / user change
  const fetchChapterProgress = () => {
    if (!user) return;
    setLoadingChapters(true);
    fetch(`http://localhost:8000/chapters/progress?user_id=${user.id}&track=${user.track}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch progress");
        return res.json();
      })
      .then((data: ChapterProgress[]) => {
        setChapters(data);
        setLoadingChapters(false);
      })
      .catch((err) => {
        console.error("Error loading chapter progress:", err);
        setLoadingChapters(false);
      });
  };

  useEffect(() => {
    fetchChapterProgress();
  }, [user]);

  const handleStartChapter = (chapterNum: number) => {
    setSelectedChapter(chapterNum);
    setLoadingQuestions(true);
    setCurrentIndex(0);
    setPrediction('');
    setIsAnswered(false);
    setSubmitResult(null);
    setSessionScore(0);
    setXpEarnedInSession(0);
    setShowSummary(false);
    setMistakesList([]);

    fetch(`http://localhost:8000/questions?track=${user?.track}&type=predict_output&chapter=${chapterNum}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch questions");
        return res.json();
      })
      .then((data: QuestionData[]) => {
        setQuestions(data);
        setLoadingQuestions(false);
      })
      .catch((err) => {
        console.error("Error loading chapter questions:", err);
        setLoadingQuestions(false);
      });
  };

  const handleSubmit = () => {
    if (isAnswered || !user) return;
    setIsAnswered(true);

    const currentQ = questions[currentIndex];

    fetch(`http://localhost:8000/arena/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        question_id: currentQ.id,
        user_answer: prediction,
        time_taken_ms: null
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to submit prediction");
        return res.json();
      })
      .then((data) => {
        setSubmitResult(data);
        if (data.is_correct) {
          setSessionScore((prev) => prev + 1);
        }
        if (data.xp_earned > 0) {
          setXpEarnedInSession((prev) => prev + data.xp_earned);
        }
        // Sync user state immediately to reflect XP/streak
        syncSession();
      })
      .catch((err) => {
        console.error("Error submitting answer:", err);
      });
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setPrediction('');
      setIsAnswered(false);
      setSubmitResult(null);
    } else {
      // Completed all questions in chapter
      if (user && selectedChapter !== null) {
        setLoadingMistakes(true);
        fetch(`http://localhost:8000/arena/mistakes?user_id=${user.id}&track=${user.track}&chapter=${selectedChapter}`)
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch mistakes");
            return res.json();
          })
          .then((data: MistakeDetail[]) => {
            setMistakesList(data);
            setLoadingMistakes(false);
          })
          .catch((err) => {
            console.error("Error loading mistakes:", err);
            setLoadingMistakes(false);
          });
      }
      setShowSummary(true);
      fetchChapterProgress(); // Refresh grid state in background
    }
  };

  const renderDiff = (actual: string, expected: string) => {
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
        displayChar = actChar || '∅';
      }

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

  const renderChapterGrid = () => {
    return (
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        {/* Top Header */}
        <div className="flex justify-between items-center pb-4 border-b-4 border-black">
          <div>
            <button onClick={onBack} className="flex items-center gap-1 text-xs font-extrabold text-purple-600 hover:underline uppercase">
              <ArrowLeft size={14} /> Back to Arena
            </button>
            <h2 className="font-display text-4xl uppercase mt-2 tracking-wide text-black">Predict Output Arena</h2>
            <p className="text-sm font-bold text-gray-500 mt-1">Select a chapter to drill down on specific Java concepts.</p>
          </div>
          <div className="bg-purple-100 border-2 border-black rounded-xl p-2 px-4 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <BookOpen className="text-purple-600 w-5 h-5" />
            <span className="text-xs font-black uppercase text-purple-800">Track: {user?.track}</span>
          </div>
        </div>

        {loadingChapters ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-gray-500">Loading chapters progress...</p>
          </div>
        ) : chapters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <BookOpen className="text-gray-300 w-16 h-16" />
            <h3 className="font-display text-3xl uppercase text-black">No Chapters Found</h3>
            <p className="text-xs font-bold text-gray-500 max-w-sm">
              We couldn't find any Predict the Output templates for track: {user?.track}. Run the seed script to start!
            </p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4"
          >
            {chapters.map((ch) => {
              const isCompleted = ch.completion_pct === 100;
              const hasStarted = (ch.attempted_count || 0) > 0;
              
              return (
                <div 
                  key={ch.chapter_number}
                  className="bg-white border-4 border-black rounded-[20px] p-6 flex flex-col gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      Ch {ch.chapter_number}
                    </span>
                    {ch.mistakes > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-red-100 text-red-700 border-2 border-black">
                        <AlertCircle size={10} />
                        {ch.mistakes} mistakes
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 min-h-[60px]">
                    <h3 className="font-display text-xl uppercase tracking-tight leading-tight text-black">
                      {ch.chapter_title.replace(/^Ch(apter)?\s*\d+:\s*/i, '')}
                    </h3>
                    <span className="text-xs font-bold text-gray-400">
                      {ch.total_questions} Questions
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-extrabold">
                      <span className="text-gray-500 uppercase">Progress</span>
                      <span className="text-black">{ch.correct_count} / {ch.total_questions} Solved</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 border-2 border-black rounded-full overflow-hidden">
                      <div 
                        className={`h-full border-r-2 border-black transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-purple-600'}`}
                        style={{ width: `${ch.completion_pct}%` }}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => handleStartChapter(ch.chapter_number)}
                    className={`w-full py-3 border-2 border-black rounded-xl font-display text-sm uppercase tracking-wide transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] ${
                      isCompleted 
                        ? 'bg-green-100 hover:bg-green-200 text-green-900' 
                        : hasStarted 
                          ? 'bg-purple-100 hover:bg-purple-200 text-purple-900' 
                          : 'bg-white hover:bg-gray-100 text-black'
                    }`}
                  >
                    {isCompleted ? 'Retry Chapter' : hasStarted ? 'Continue Chapter' : 'Start Chapter'}
                  </button>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    );
  };

  const renderSummary = () => {
    const percentage = Math.round((sessionScore / questions.length) * 100);
    const nextChapter = chapters.find(c => c.chapter_number > (selectedChapter || 0));

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto flex flex-col gap-6 py-6"
      >
        <div className="text-center flex flex-col items-center gap-4">
          <div className="relative w-20 h-20 flex items-center justify-center text-purple-600">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-purple-100 fill-current animate-pulse">
              <polygon points="50,5 61,24 81,20 83,41 100,53 84,67 86,88 65,83 50,98 35,83 14,88 16,67 0,53 17,41 19,20 39,24" />
            </svg>
            <Award size={40} className="relative z-10 text-purple-600 stroke-[2.5]" />
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="font-display text-4xl uppercase tracking-wider text-black">Chapter Completed!</h2>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              You've finished the drills for Chapter {selectedChapter}
            </p>
          </div>
        </div>

        <div className="bg-purple-50/50 border-4 border-black rounded-[2rem] p-6 flex flex-col gap-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border-2 border-black rounded-2xl p-4 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-400">Session Accuracy</span>
              <h4 className="font-display text-4xl text-purple-600">{percentage}%</h4>
              <span className="text-xs font-extrabold text-gray-600">
                {sessionScore} / {questions.length} Correct
              </span>
            </div>
            <div className="bg-white border-2 border-black rounded-2xl p-4 flex flex-col justify-center items-center text-center">
              <span className="text-[10px] uppercase font-bold text-gray-400">XP Earned</span>
              <div className="flex items-center gap-1.5 text-amber-500 mt-1">
                <Sparkles size={20} fill="currentColor" />
                <h4 className="font-display text-4xl text-amber-600">+{xpEarnedInSession} XP</h4>
              </div>
              <span className="text-xs font-extrabold text-gray-600">Level Progression Updated!</span>
            </div>
          </div>

          {/* Mistakes section */}
          <div className="bg-white border-2 border-black rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="font-display text-lg uppercase tracking-tight text-black flex items-center gap-2">
              <Terminal size={18} className="text-purple-600" />
              Mistake Analytics & Review
            </h3>

            {loadingMistakes ? (
              <div className="py-4 text-center text-xs font-bold text-gray-400">Loading mistake history...</div>
            ) : mistakesList.length === 0 ? (
              <div className="bg-green-50 border border-green-200 text-green-800 text-xs font-bold p-4 rounded-xl">
                ★ Flawless Chapter! You didn't make any mistakes in this session. Outstanding logic tracing!
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2">
                <p className="text-xs text-gray-500 font-bold">
                  Here are the questions you struggled with in this chapter. Review the explanation and what you typed:
                </p>
                {mistakesList.map((m, idx) => (
                  <div key={m.question_id} className="border-2 border-black rounded-xl p-4 bg-gray-50/50 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-200 rounded px-2 py-0.5">
                        {m.attempt_count} attempts
                      </span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Mistake #{idx + 1}</span>
                    </div>

                    <div className="bg-[#1e1e1e] p-3 rounded-lg border border-black max-h-[150px] overflow-y-auto">
                      <pre className="text-xs font-mono text-gray-300 leading-tight select-all whitespace-pre">
                        {m.code}
                      </pre>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase block">You Predicted</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {m.user_answers.map((ans, aIdx) => (
                            <span key={aIdx} className="bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200 font-mono text-[11px]">
                              {ans || "∅"}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase block">Correct Output</span>
                        <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 font-mono text-[11px] inline-block mt-1">
                          {m.correct_answer}
                        </span>
                      </div>
                    </div>

                    {m.explanation && (
                      <div className="text-[11px] font-bold leading-normal text-gray-600 bg-purple-50 border border-purple-200 p-2.5 rounded-lg">
                        <strong>Explanation:</strong> {m.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => setSelectedChapter(null)} 
            className="btn-primary py-3 px-6 bg-white text-black border-2 hover:bg-gray-50"
          >
            Back to Chapters
          </button>
          {nextChapter ? (
            <button 
              onClick={() => handleStartChapter(nextChapter.chapter_number)} 
              className="btn-primary py-3 px-6"
            >
              <span>Next Chapter (Ch {nextChapter.chapter_number})</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button 
              onClick={() => setSelectedChapter(null)} 
              className="btn-primary py-3 px-6"
            >
              <span>All Chapters Done!</span>
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  if (selectedChapter === null) {
    return renderChapterGrid();
  }

  if (loadingQuestions) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-gray-500">Loading chapter drills...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <BookOpen className="text-gray-300 w-16 h-16" />
        <h3 className="font-display text-3xl uppercase text-black">No Questions Found</h3>
        <p className="text-xs font-bold text-gray-500 max-w-sm">
          We couldn't find any Predict the Output questions for this chapter.
        </p>
        <button onClick={() => setSelectedChapter(null)} className="btn-primary py-2 px-6">
          Back to Chapters
        </button>
      </div>
    );
  }

  if (showSummary) {
    return renderSummary();
  }

  const currentQuestion = questions[currentIndex];
  const isCorrect = submitResult ? submitResult.is_correct : false;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div className="relative">
          <button onClick={() => setSelectedChapter(null)} className="text-xs font-extrabold text-purple-600 hover:underline uppercase">
            &larr; Exit Chapter
          </button>
          
          <div className="relative mt-1">
            <button 
              onClick={() => setShowChapterDropdown(!showChapterDropdown)}
              className="font-display text-3xl uppercase text-black flex items-center gap-1.5 hover:text-purple-600 transition-colors focus:outline-none"
            >
              {currentQuestion.chapter_title}
              <ChevronDown size={24} className={`transition-transform duration-200 ${showChapterDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showChapterDropdown && (
              <div className="absolute left-0 mt-2 w-72 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 p-2 flex flex-col gap-1 max-h-80 overflow-y-auto">
                <div className="text-[10px] font-black uppercase text-gray-400 px-3 py-1.5 border-b-2 border-gray-100 mb-1">
                  Switch Chapter
                </div>
                {chapters.map((ch) => (
                  <button
                    key={ch.chapter_number}
                    onClick={() => {
                      setShowChapterDropdown(false);
                      handleStartChapter(ch.chapter_number);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border-2 hover:border-black hover:bg-purple-50 transition-all font-bold text-xs flex justify-between items-center ${
                      selectedChapter === ch.chapter_number 
                        ? 'border-black bg-purple-100 text-purple-900' 
                        : 'border-transparent text-gray-700'
                    }`}
                  >
                    <span className="truncate">Ch {ch.chapter_number}: {ch.chapter_title.replace(/^Ch(apter)?\s*\d+:\s*/i, '')}</span>
                    <span className="text-[10px] bg-white border-2 border-black rounded px-1.5 py-0.5 ml-2 shrink-0">
                      {ch.correct_count}/{ch.total_questions}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Drill Progress</span>
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
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200 w-max">
              Question {currentIndex + 1}
            </span>
            <span className="text-xs font-bold text-gray-400">Java Code Snippet</span>
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
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Enter Prediction</span>
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
                placeholder="Type the exact printed output here..."
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
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-extrabold uppercase">
                      {isCorrect ? 'Output Matches!' : 'Output Mismatch'}
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 mt-0.5 leading-relaxed">
                      {isCorrect ? 'Brilliant prediction! Your simulation ran perfectly.' : 'Spacing, line endings, or variables were mismatched.'}
                    </span>
                  </div>
                </div>

                {/* Diff Comparison */}
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase">Interactive Spacing Check</span>
                  {renderDiff(prediction, currentQuestion.correct_answer)}
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase">Correct Output</span>
                  <pre className="p-3 bg-gray-900 text-emerald-400 rounded-xl font-mono text-xs font-bold border border-black">
                    {currentQuestion.correct_answer}
                  </pre>
                </div>

                {submitResult?.explanation && (
                  <div className="bg-purple-50/50 border border-purple-200 rounded-xl p-3 text-[11px] font-bold text-gray-600 leading-normal text-left">
                    <strong>Explanation:</strong> {submitResult.explanation}
                  </div>
                )}

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

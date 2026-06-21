import React, { useState, useEffect, useRef } from 'react';
import { useUserStore } from '../../store/userStore';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { 
  Play, Pause, ChevronRight, ChevronLeft, RotateCcw, 
  Tv, Database, Award, Sparkles, BookOpen 
} from 'lucide-react';

interface QuestionData {
  id: string;
  track: string;
  chapter_title: string;
  type: string;
  content: {
    title: string;
    description: string;
  };
  correct_answer: string;
  explanation: string;
}

interface TraceStep {
  lineNumber: number;
  variables: Record<string, { value: string; type: string; changed: boolean }>;
  output: string;
  narration: string;
}

interface TraceData {
  id: string;
  question_id: string;
  code: string;
  steps: TraceStep[];
  finalOutput: string;
}

interface TraceVisualizerViewProps {
  onBack: () => void;
}

export const TraceVisualizerView: React.FC<TraceVisualizerViewProps> = ({ onBack }) => {
  const user = useUserStore((state) => state.user);
  const logActivity = useUserStore((state) => state.logActivity);

  // States
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');
  const [traceData, setTraceData] = useState<TraceData | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadingTrace, setLoadingTrace] = useState(false);

  // Execution Step States
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(1500); // delay between steps
  const [showSummary, setShowSummary] = useState(false);

  // Monaco Editor Ref & Decorations
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);
  const tableEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  // Load questions of type trace-visualizer
  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:8000/questions?track=${user.track}&type=trace-visualizer`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch questions");
        return res.json();
      })
      .then((data: QuestionData[]) => {
        setQuestions(data);
        if (data.length > 0) {
          setSelectedQuestionId(data[0].id);
        }
        setLoadingQuestions(false);
      })
      .catch((err) => {
        console.error("Error loading trace questions:", err);
        setLoadingQuestions(false);
      });
  }, [user]);

  // Load active trace detail
  useEffect(() => {
    if (!selectedQuestionId) return;
    setLoadingTrace(true);
    setIsPlaying(false);
    setStepIndex(0);
    setShowSummary(false);
    
    fetch(`http://localhost:8000/traces/${selectedQuestionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Trace not found");
        return res.json();
      })
      .then((data: TraceData) => {
        setTraceData(data);
        setLoadingTrace(false);
      })
      .catch((err) => {
        console.error("Error loading trace data:", err);
        setTraceData(null);
        setLoadingTrace(false);
      });
  }, [selectedQuestionId]);

  // Handle auto playback timer
  useEffect(() => {
    if (isPlaying && traceData) {
      timerRef.current = setTimeout(() => {
        if (stepIndex + 1 < traceData.steps.length) {
          setStepIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, speedMs);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, stepIndex, speedMs, traceData]);

  // Highlight line in Monaco Editor on step change
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !traceData) return;
    
    const step = traceData.steps[stepIndex];
    if (!step) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const line = step.lineNumber;

    // Scroll to the line being executed so it is visible
    editor.revealLineInCenter(line);

    // Apply decoration classes
    const newDecorations = [
      {
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          className: 'active-line-highlight',
          glyphMarginClassName: 'active-line-glyph',
        }
      }
    ];

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
  }, [stepIndex, traceData, editorRef.current]);

  // Auto scroll trace table to bottom
  useEffect(() => {
    if (tableEndRef.current) {
      tableEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [stepIndex]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const handleNextStep = () => {
    if (!traceData) return;
    if (stepIndex + 1 < traceData.steps.length) {
      setStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setStepIndex(0);
    setIsPlaying(false);
  };

  const handleComplete = async () => {
    if (!traceData) return;
    const xpReward = 15;
    const title = questions.find(q => q.id === selectedQuestionId)?.content.title || 'Loops Trace';
    
    await logActivity(
      'arena_submit',
      `Completed Trace Visualizer: ${title}`,
      xpReward,
      { drillId: 'trace-visualizer', questionId: selectedQuestionId }
    );
    setShowSummary(true);
  };

  if (loadingQuestions) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-gray-500">Retrieving interactive dry-runs...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <BookOpen className="text-gray-300 w-16 h-16" />
        <h3 className="font-display text-3xl uppercase">No Traces Seeded</h3>
        <p className="text-xs font-bold text-gray-500 max-w-sm">
          We couldn't find any stepping trace tables for track: {user?.track}. Seed the database first!
        </p>
        <button onClick={onBack} className="btn-primary py-2 px-6">
          Back to Arena
        </button>
      </div>
    );
  }

  const currentStep = traceData?.steps[stepIndex];
  const isLastStep = traceData ? stepIndex === traceData.steps.length - 1 : false;

  // Aggregate variables state up to the current step so the middle panel feels "alive"
  const getAggregatedVariables = () => {
    if (!traceData) return {};
    const vars: Record<string, { value: string; type: string; changed: boolean }> = {};
    
    // We walk up to the current step and record variables
    for (let i = 0; i <= stepIndex; i++) {
      const step = traceData.steps[i];
      Object.entries(step.variables).forEach(([name, details]) => {
        vars[name] = {
          value: details.value,
          type: details.type,
          // Only flag as changed if it is updated EXACTLY on the current active step index
          changed: i === stepIndex && details.changed
        };
      });
    }
    return vars;
  };

  const aggregatedVariables = getAggregatedVariables();

  if (showSummary) {
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
          <h2 className="font-display text-4xl uppercase tracking-wider text-black">Trace Completed!</h2>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mental Compiler Practice Finished</p>
        </div>

        <div className="bg-purple-50/50 border-4 border-black rounded-[2rem] p-8 w-full flex flex-col gap-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border-2 border-black rounded-2xl p-4">
              <span className="text-[10px] uppercase font-bold text-gray-400">Drill Type</span>
              <h4 className="font-display text-3xl text-purple-600 leading-none mt-2">Stepping Debugger</h4>
              <span className="text-[10px] font-extrabold text-gray-500 block mt-1">100% Comprehended</span>
            </div>
            <div className="bg-white border-2 border-black rounded-2xl p-4 flex flex-col justify-center items-center">
              <span className="text-[10px] uppercase font-bold text-gray-400">Rewards</span>
              <div className="flex items-center gap-1.5 text-amber-500 mt-1">
                <Sparkles size={20} fill="currentColor" />
                <h4 className="font-display text-4xl text-amber-600">+15 XP</h4>
              </div>
              <span className="text-xs font-extrabold text-gray-600">Streak Maintained!</span>
            </div>
          </div>

          <div className="text-left bg-white border-2 border-black rounded-2xl p-4">
            <h5 className="text-xs font-extrabold text-black uppercase mb-1">Interactive Summary</h5>
            <p className="text-xs text-gray-500 font-bold leading-relaxed">
              By stepping through the variables, you witnessed how loops modify scoped integers, condition checks boundary expressions, and console print buffer acts.
            </p>
          </div>
        </div>

        <div className="flex gap-4 w-full justify-center">
          <button onClick={() => setShowSummary(false)} className="btn-primary py-3 px-6 bg-white text-black border-2 hover:bg-gray-50">
            <RotateCcw size={16} />
            <span>Replay Trace</span>
          </button>
          <button onClick={onBack} className="btn-primary py-3 px-6">
            <span>Back to Arena</span>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full h-full max-w-7xl mx-auto">
      {/* Editor Line Highlight Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .active-line-highlight {
          background-color: rgba(147, 51, 234, 0.15) !important;
          border-left: 4px solid #9333ea !important;
        }
        .active-line-glyph {
          background-color: #9333ea;
          width: 8px !important;
          margin-left: 4px;
          border-radius: 50%;
        }
      `}} />

      {/* Header Selector bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <button onClick={onBack} className="text-xs font-extrabold text-purple-600 hover:underline uppercase">
            &larr; Exit Arena
          </button>
          <h2 className="font-display text-3xl uppercase mt-1">Flagship Trace Visualizer</h2>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider shrink-0">
            Select Exercise:
          </label>
          <select
            value={selectedQuestionId}
            onChange={(e) => setSelectedQuestionId(e.target.value)}
            className="flex-1 md:flex-none border-2 border-black rounded-xl px-3 py-1.5 font-bold text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
          >
            {questions.map((q) => (
              <option key={q.id} value={q.id}>
                {q.content.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingTrace ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-400">Loading trace steps data...</p>
        </div>
      ) : traceData ? (
        <div className="flex flex-col gap-6">
          
          {/* THREE-PANEL CORE GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* PANEL 1: Monaco Code Display (Left: 5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                  Panel 1: Scoped Execution
                </span>
                <span className="text-[10px] bg-purple-50 text-purple-600 font-extrabold border border-purple-200 px-2 py-0.5 rounded">
                  Java Program
                </span>
              </div>
              <div className="border-4 border-black rounded-[1.5rem] overflow-hidden bg-[#1e1e1e] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex-1 min-h-[300px]">
                <Editor
                  height="340px"
                  language="java"
                  theme="vs-dark"
                  value={traceData.code}
                  onMount={handleEditorDidMount}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    fontSize: 13,
                    domReadOnly: true,
                    glyphMargin: true,
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>

            {/* PANEL 2: Interactive Memory Box (Middle: 3 cols) */}
            <div className="lg:col-span-3 flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                  Panel 2: Variables Memory
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-600 font-extrabold border border-emerald-200 px-2 py-0.5 rounded">
                  RAM State
                </span>
              </div>
              <div className="border-4 border-black rounded-[1.5rem] p-5 bg-gray-50 flex flex-col gap-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex-1 min-h-[300px] overflow-y-auto">
                <div className="flex flex-col gap-0.5 text-center pb-2 border-b border-gray-200">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase">Live Stack Frames</span>
                  <p className="text-xs font-bold text-gray-600">Variable values updates reside here</p>
                </div>

                <div className="flex-1 flex flex-col gap-3 justify-start">
                  <AnimatePresence>
                    {Object.keys(aggregatedVariables).length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-10 gap-2"
                      >
                        <Database size={32} />
                        <span className="text-xs font-bold">Stack frame is empty</span>
                        <span className="text-[9px] font-semibold text-gray-400 max-w-[150px]">
                          Variables pop in once we execute lines allocating stack variables.
                        </span>
                      </motion.div>
                    ) : (
                      Object.entries(aggregatedVariables).map(([name, detail]) => (
                        <motion.div
                          key={name}
                          initial={detail.changed ? { scale: 0.9, y: 5, opacity: 0 } : false}
                          animate={{ scale: 1, y: 0, opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`border-2 rounded-2xl p-3 flex justify-between items-center relative transition-colors ${
                            detail.changed 
                              ? 'bg-purple-100 border-purple-600 shadow-[2px_2px_0px_0px_rgba(147,51,234,1)] animate-pulse' 
                              : 'bg-white border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]'
                          }`}
                        >
                          {detail.changed && (
                            <span className="absolute -top-2 right-2 text-[8px] font-extrabold uppercase bg-purple-600 text-white px-1.5 py-0.2 rounded-full tracking-wider animate-bounce">
                              Changed
                            </span>
                          )}
                          <div className="flex flex-col">
                            <span className="text-[9px] font-extrabold text-purple-600 uppercase font-mono">
                              {detail.type}
                            </span>
                            <span className="text-sm font-extrabold text-black font-mono">
                              {name}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 font-mono text-xs font-bold text-gray-800">
                            {detail.value}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* PANEL 3: Dry-Run Trace Table Log (Right: 4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                  Panel 3: Output & Logs
                </span>
                <span className="text-[10px] bg-sky-50 text-sky-600 font-extrabold border border-sky-200 px-2 py-0.5 rounded">
                  Trace Log
                </span>
              </div>
              <div className="border-4 border-black rounded-[1.5rem] p-5 bg-[#12131a] text-gray-200 flex flex-col gap-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex-1 min-h-[300px] overflow-y-auto max-h-[360px] font-mono text-[11px] leading-relaxed">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-800 text-gray-400">
                  <Tv size={14} />
                  <span className="text-[9px] uppercase font-bold tracking-widest">Compiler Outputs Console</span>
                </div>

                <div className="flex-1 flex flex-col gap-2 justify-start overflow-y-auto">
                  {/* Console print outputs accumulated up to current step */}
                  <div className="bg-black/40 border border-gray-800 rounded-xl p-3 min-h-[80px] text-emerald-400 whitespace-pre">
                    {traceData.steps
                      .slice(0, stepIndex + 1)
                      .map(s => s.output)
                      .filter(Boolean)
                      .join('') || '> [No print operations outputted yet]'}
                  </div>

                  {/* Dry Run step list */}
                  <span className="text-[8px] uppercase text-gray-500 font-bold tracking-wider mt-2">Stepping history:</span>
                  <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                    {traceData.steps.slice(0, stepIndex + 1).map((s, idx) => (
                      <div key={idx} className={`p-2 border rounded-xl flex justify-between gap-2 ${
                        idx === stepIndex 
                          ? 'border-purple-600 bg-purple-950/40 text-purple-200' 
                          : 'border-gray-800 bg-transparent text-gray-500'
                      }`}>
                        <span className="font-extrabold shrink-0">L{s.lineNumber}:</span>
                        <span className="truncate flex-1">{s.narration}</span>
                      </div>
                    ))}
                    <div ref={tableEndRef} />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* BOTTOM CONTROL & NARRATION ACTION BAR */}
          <div className="bg-white border-4 border-black rounded-[2rem] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* Left: Narration bubble */}
            <div className="flex-1 flex gap-4 items-start w-full">
              <div className="bg-purple-100 text-purple-600 p-2.5 rounded-xl border border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] shrink-0">
                <Tv size={20} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase">Step Explainer</span>
                <p className="text-xs md:text-sm font-extrabold text-gray-800 leading-normal font-body">
                  {currentStep?.narration || "Click 'Play' or 'Next' to start stepping."}
                </p>
              </div>
            </div>

            {/* Right: Controller cluster */}
            <div className="flex flex-wrap items-center justify-center gap-4 shrink-0 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
              
              {/* Playback speed slider */}
              <div className="flex items-center gap-2 border-r pr-4 border-gray-100">
                <span className="text-[9px] font-extrabold text-gray-400 uppercase">Speed:</span>
                <input
                  type="range"
                  min={500}
                  max={3000}
                  step={500}
                  value={speedMs}
                  onChange={(e) => setSpeedMs(Number(e.target.value))}
                  className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  title={`Speed: ${speedMs}ms`}
                />
                <span className="text-[9px] font-bold text-purple-600">{speedMs / 1000}s</span>
              </div>

              {/* Prev */}
              <button
                onClick={handlePrevStep}
                disabled={stepIndex === 0}
                className="p-2 border-2 border-black rounded-xl bg-gray-50 text-black hover:bg-gray-100 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                title="Previous Step"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Play / Pause toggle */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`py-2 px-4 border-2 border-black rounded-full font-bold text-xs uppercase flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] cursor-pointer ${
                  isPlaying ? 'bg-amber-400 text-black' : 'bg-purple-600 text-white'
                }`}
              >
                {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              {/* Next */}
              <button
                onClick={handleNextStep}
                disabled={isLastStep}
                className="p-2 border-2 border-black rounded-xl bg-gray-50 text-black hover:bg-gray-100 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                title="Next Step"
              >
                <ChevronRight size={16} />
              </button>

              {/* Reset */}
              <button
                onClick={handleReset}
                className="p-2 border-2 border-black rounded-xl bg-white text-black hover:bg-gray-50 transition-all cursor-pointer"
                title="Reset Execution"
              >
                <RotateCcw size={16} />
              </button>

              {/* Submit / Finish */}
              <button
                onClick={handleComplete}
                disabled={!isLastStep}
                className="btn-primary py-2 px-4 text-xs disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none"
              >
                <span>Finish</span>
                <ChevronRight size={14} />
              </button>
            </div>

          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3 border border-dashed border-gray-300 rounded-3xl">
          <Tv className="text-gray-300 w-12 h-12" />
          <span className="text-sm font-bold text-gray-500">Failed to render trace program.</span>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { useUserStore } from '../../store/userStore';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { 
  Play, Pause, ChevronRight, ChevronLeft, RotateCcw, 
  Tv, Database, Award, Sparkles, BookOpen, XCircle, ChevronDown, X
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

const templates = {
  loop: `public class Main {
    public static void main(String[] args) {
        int sum = 0;
        for (int i = 1; i <= 5; i++) {
            sum += i;
        }
        System.out.println(sum);
    }
}`,
  nested: `public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 3; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print(j);
            }
            System.out.println();
        }
    }
}`,
  dowhile: `public class Main {
    public static void main(String[] args) {
        int count = 5;
        do {
            System.out.println("Count: " + count);
            count--;
        } while (count > 0);
    }
}`,
  branching: `public class Main {
    public static void main(String[] args) {
        int score = 85;
        if (score >= 90) {
            System.out.println("Grade A");
        } else if (score >= 80) {
            System.out.println("Grade B");
        } else {
            System.out.println("Grade C");
        }
    }
}`,
  switchcase: `public class Main {
    public static void main(String[] args) {
        int day = 2;
        switch (day) {
            case 1:
                System.out.println("Monday");
                break;
            case 2:
                System.out.println("Tuesday");
                break;
            case 3:
                System.out.println("Wednesday");
                break;
            default:
                System.out.println("Other day");
        }
    }
}`,
  arrays: `public class Main {
    public static void main(String[] args) {
        int[] numbers = {12, 45, 7, 23, 56};
        int max = numbers[0];
        for (int i = 1; i < numbers.length; i++) {
            if (numbers[i] > max) {
                max = numbers[i];
            }
        }
        System.out.println("Max is: " + max);
    }
}`,
  strings: `public class Main {
    public static void main(String[] args) {
        String str = "java";
        int vowels = 0;
        for (int i = 0; i < str.length(); i++) {
            char ch = str.charAt(i);
            if (ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u') {
                vowels++;
            }
        }
        System.out.println("Vowels: " + vowels);
    }
}`
};

const templateLabels = {
  loop: "Basic Sum Loop",
  nested: "Nested Loops Pattern",
  dowhile: "Do-While Countdown",
  branching: "If-Else Grade Branching",
  switchcase: "Switch-Case Day Selector",
  arrays: "Array Max Finder",
  strings: "String Vowel Counter"
};

interface TraceVisualizerViewProps {
  onBack: () => void;
}

const emptySkeleton = `public class Main {
    public static void main(String[] args) {
        // Write your custom Java code here!
        
    }
}`;

export const TraceVisualizerView: React.FC<TraceVisualizerViewProps> = ({ onBack }) => {
  const user = useUserStore((state) => state.user);
  const logActivity = useUserStore((state) => state.logActivity);

  // Mode States (Syllabus Templates vs Custom Code)
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customCode, setCustomCode] = useState(emptySkeleton);
  const [loadingTrace, setLoadingTrace] = useState(false);
  const [syntaxError, setSyntaxError] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof templates>('loop');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Execution Step States
  const [traceData, setTraceData] = useState<TraceData | null>(null);
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

  // Handle Sandbox code trace generation
  const handleGenerateTrace = async (codeToTrace: string) => {
    setIsCompiling(true);
    setSyntaxError(null);
    setIsPlaying(false);
    setStepIndex(0);
    setShowSummary(false);

    try {
      const res = await fetch(`http://localhost:8000/sandbox/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToTrace })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || "Java execution trace failed");
      }
      
      setTraceData(data);
    } catch (err: any) {
      console.error(err);
      setSyntaxError(err.message || "An execution error occurred in compiling this Java program.");
      setTraceData(null);
    } finally {
      setIsCompiling(false);
    }
  };

  // Load active template trace dynamically on template or mode changes
  useEffect(() => {
    if (isCustomMode) {
      setTraceData(null);
      setSyntaxError(null);
      setStepIndex(0);
    } else {
      setLoadingTrace(true);
      handleGenerateTrace(templates[selectedTemplate]).finally(() => {
        setLoadingTrace(false);
      });
    }
  }, [isCustomMode, selectedTemplate]);

  // Toggle mode switcher
  const handleToggleMode = (toCustom: boolean) => {
    setIsCustomMode(toCustom);
    setIsPlaying(false);
    setStepIndex(0);
    setShowSummary(false);
    setSyntaxError(null);
    setTraceData(null);
  };

  // Cleaned up handleTemplateChange since we use custom inline selectors now

  // Handle auto playback timer loop
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

  // Highlight active line decoration in Monaco
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !traceData) return;
    
    const step = traceData.steps[stepIndex];
    if (!step) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const line = step.lineNumber;

    // Scroll executed line in center view
    editor.revealLineInCenter(line);

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

  // Auto scroll output table
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
    const xpReward = isCustomMode ? 5 : 15;
    const title = isCustomMode ? 'Custom Code' : templateLabels[selectedTemplate];
    
    await logActivity(
      'arena_submit',
      `Completed Trace Visualizer: ${title}`,
      xpReward,
      { drillId: 'trace-visualizer', selectedTemplate, isCustomMode }
    );
    setShowSummary(true);
  };

  // Removed loadingQuestions check since template files are bundle-resident

  // Removed questions.length verification check

  const currentStep = traceData?.steps[stepIndex];
  const isLastStep = traceData ? stepIndex === traceData.steps.length - 1 : false;

  // Aggregate variable stack values
  const getAggregatedVariables = () => {
    if (!traceData) return {};
    const vars: Record<string, { value: string; type: string; changed: boolean }> = {};
    
    for (let i = 0; i <= stepIndex; i++) {
      const step = traceData.steps[i];
      if (!step) continue;
      Object.entries(step.variables).forEach(([name, details]) => {
        vars[name] = {
          value: details.value,
          type: details.type,
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
              <span className="text-[10px] uppercase font-bold text-gray-400">Drill Mode</span>
              <h4 className="font-display text-3xl text-purple-600 leading-none mt-2">
                {isCustomMode ? 'Custom Code' : 'Syllabus Templates'}
              </h4>
              <span className="text-[10px] font-extrabold text-gray-500 block mt-1">100% Comprehended</span>
            </div>
            <div className="bg-white border-2 border-black rounded-2xl p-4 flex flex-col justify-center items-center">
              <span className="text-[10px] uppercase font-bold text-gray-400">Rewards</span>
              <div className="flex items-center gap-1.5 text-amber-500 mt-1">
                <Sparkles size={20} fill="currentColor" />
                <h4 className="font-display text-4xl text-amber-600">+{isCustomMode ? 5 : 15} XP</h4>
              </div>
              <span className="text-xs font-extrabold text-gray-600">Streak Maintained!</span>
            </div>
          </div>

          <div className="text-left bg-white border-2 border-black rounded-2xl p-4">
            <h5 className="text-xs font-extrabold text-black uppercase mb-1">Interactive Summary</h5>
            <p className="text-xs text-gray-500 font-bold leading-relaxed">
              {isCustomMode 
                ? "You ran a custom Java compilation code trace! Highlighting variables scope and stdout tracing dynamically is the best way to master logic."
                : "By stepping through the variables, you witnessed how this ICSE Java concept modifies scoped stack frames, checks condition bounds, and outputs to the console."
              }
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
    <div className="flex flex-col gap-6 w-full h-full max-w-7xl mx-auto animate-fade-in">
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

        {/* Mode Toggle Selector cluster */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          
          {/* Syllabus Templates vs Custom Code toggle button */}
          <div className="flex bg-gray-100 p-1 border-2 border-black rounded-full shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] text-[10px] font-extrabold">
            <button
              onClick={() => handleToggleMode(false)}
              className={`px-3.5 py-1 rounded-full cursor-pointer transition-all ${
                !isCustomMode ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:text-black'
              }`}
            >
              Syllabus Templates
            </button>
            <button
              onClick={() => handleToggleMode(true)}
              className={`px-3.5 py-1 rounded-full cursor-pointer transition-all ${
                isCustomMode ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:text-black'
              }`}
            >
              Custom Code
            </button>
          </div>

          {!isCustomMode && (
            <div className="flex items-center gap-2 relative" ref={dropdownRef}>
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider shrink-0">
                Concept:
              </label>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-between gap-2 border-2 border-black rounded-xl px-3 py-1.5 font-bold text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-y-[0.5px] active:shadow-none min-w-[170px] text-left transition-all"
                >
                  <span>{templateLabels[selectedTemplate]}</span>
                  <ChevronDown size={14} className={`transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-52 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] overflow-hidden z-50 animate-fade-in">
                    <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
                      {Object.entries(templateLabels).map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            const newKey = key as keyof typeof templates;
                            setSelectedTemplate(newKey);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs font-bold transition-all flex items-center justify-between ${
                            selectedTemplate === key
                              ? 'bg-purple-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                          }`}
                        >
                          <span>{label}</span>
                          {selectedTemplate === key && (
                            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Onboarding Mode Explanation Card — dismissable */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="bg-purple-50/60 backdrop-blur-sm border-2 border-black rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] relative"
          >
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 text-white p-2 rounded-xl border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-black uppercase tracking-wider">How to use the Trace Visualizer</h4>
                <p className="text-[11px] text-gray-600 font-bold leading-normal mt-0.5 max-w-2xl">
                  <strong>Syllabus Templates</strong> — pick any ICSE Java concept and watch code run line-by-line automatically. &nbsp;<strong>Custom Code</strong> — write your own Java code and click Compile &amp; Run to trace it live.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex gap-3 font-extrabold text-[10px] uppercase text-gray-500">
                <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-2.5 py-1 rounded-lg">
                  <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                  <span>Templates: <strong>+15 XP</strong></span>
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-2.5 py-1 rounded-lg">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span>Custom: <strong>+5 XP</strong></span>
                </div>
              </div>
              <button
                onClick={() => setShowOnboarding(false)}
                className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all cursor-pointer shrink-0"
                title="Dismiss"
              >
                <X size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loadingTrace ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-400">Loading trace steps data...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          
          {/* THREE-PANEL CORE GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* PANEL 1: Monaco Code Display (Left: 5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                  Panel 1: Scoped Execution
                </span>
                
                {isCustomMode ? (
                  <button
                    onClick={() => handleGenerateTrace(customCode)}
                    disabled={isCompiling}
                    className="text-[9px] font-extrabold uppercase bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-black px-3 py-1 rounded-full shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none cursor-pointer flex items-center gap-1 transition-all animate-pulse"
                  >
                    <span>{isCompiling ? 'Compiling...' : 'Compile & Run'}</span>
                  </button>
                ) : (
                  <span className="text-[10px] bg-purple-50 text-purple-600 font-extrabold border border-purple-200 px-2 py-0.5 rounded">
                    Template: {templateLabels[selectedTemplate]}
                  </span>
                )}
              </div>
              <div className="border-4 border-black rounded-[1.5rem] overflow-hidden bg-[#1e1e1e] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex-1 min-h-[300px]">
                <Editor
                  height="340px"
                  language="java"
                  theme="vs-dark"
                  value={isCustomMode ? customCode : templates[selectedTemplate]}
                  onChange={(val) => {
                    if (isCustomMode && val !== undefined) {
                      setCustomCode(val);
                    }
                  }}
                  onMount={handleEditorDidMount}
                  options={{
                    readOnly: !isCustomMode,
                    minimap: { enabled: false },
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    fontSize: 13,
                    domReadOnly: !isCustomMode,
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
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-10 gap-2"
                      >
                        <Database size={32} />
                        {syntaxError ? (
                          <>
                            <span className="text-xs font-bold text-red-500">Memory State Inactive</span>
                            <span className="text-[9px] font-semibold text-red-400 max-w-[150px]">
                              Fix the compiler error in Panel 3 to inspect variables.
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs font-bold">Stack frame is empty</span>
                            <span className="text-[9px] font-semibold text-gray-400 max-w-[150px]">
                              Variables pop in once we execute lines allocating stack variables.
                            </span>
                          </>
                        )}
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
                  <div className="bg-black/40 border border-gray-800 rounded-xl p-3 min-h-[80px] text-emerald-400 whitespace-pre font-mono">
                    {syntaxError ? (
                      <span className="text-red-500 font-mono whitespace-pre-wrap">
                        {`> [Compilation Failed]\n\n${syntaxError}`}
                      </span>
                    ) : (
                      currentStep?.output || '> [No print operations outputted yet]'
                    )}
                  </div>

                  {/* Dry Run step list */}
                  <span className="text-[8px] uppercase text-gray-500 font-bold tracking-wider mt-2">Stepping history:</span>
                  <div 
                    key={`${isCustomMode ? 'custom' : selectedTemplate}-${traceData?.id || 'trace'}`} 
                    className="flex flex-col gap-1.5 max-h-36 overflow-y-auto"
                  >
                    {traceData ? (
                      traceData.steps.slice(0, stepIndex + 1).map((s, idx) => (
                        <div key={idx} className={`p-2 border rounded-xl flex justify-between gap-2 ${
                          idx === stepIndex 
                            ? 'border-purple-600 bg-purple-950/40 text-purple-200 font-bold' 
                            : 'border-gray-800 bg-transparent text-gray-500'
                        }`}>
                          <span className="font-extrabold shrink-0">L{s.lineNumber}:</span>
                          <span className="truncate flex-1">{s.narration}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 italic p-2">
                        No stepping execution steps generated. Fix compiler errors to start dry-run.
                      </div>
                    )}
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
              <div className={`${syntaxError ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'} p-2.5 rounded-xl border border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] shrink-0`}>
                <Tv size={20} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase">Step Explainer</span>
                <p className={`text-xs md:text-sm font-extrabold leading-normal font-body ${syntaxError ? 'text-red-500' : 'text-gray-800'}`}>
                  {syntaxError 
                    ? "Compilation failed. Review compiler outputs in Panel 3." 
                    : (currentStep?.narration || "Click 'Play' or 'Next' to start stepping.")
                  }
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
                  disabled={!!syntaxError || !traceData}
                  className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600 disabled:opacity-30"
                  title={`Speed: ${speedMs}ms`}
                />
                <span className="text-[9px] font-bold text-purple-600">{speedMs / 1000}s</span>
              </div>

              {/* Prev */}
              <button
                onClick={handlePrevStep}
                disabled={!!syntaxError || !traceData || stepIndex === 0}
                className="p-2 border-2 border-black rounded-xl bg-gray-50 text-black hover:bg-gray-100 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                title="Previous Step"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Play / Pause toggle */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={!!syntaxError || !traceData}
                className={`py-2 px-4 border-2 border-black rounded-full font-bold text-xs uppercase flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] disabled:opacity-30 disabled:pointer-events-none cursor-pointer ${
                  isPlaying ? 'bg-amber-400 text-black' : 'bg-purple-600 text-white'
                }`}
              >
                {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              {/* Next */}
              <button
                onClick={handleNextStep}
                disabled={!!syntaxError || !traceData || isLastStep}
                className="p-2 border-2 border-black rounded-xl bg-gray-50 text-black hover:bg-gray-100 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                title="Next Step"
              >
                <ChevronRight size={16} />
              </button>

              {/* Reset */}
              <button
                onClick={handleReset}
                disabled={!!syntaxError || !traceData}
                className="p-2 border-2 border-black rounded-xl bg-white text-black hover:bg-gray-50 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                title="Reset Execution"
              >
                <RotateCcw size={16} />
              </button>

              {/* Submit / Finish */}
              <button
                onClick={handleComplete}
                disabled={!!syntaxError || !traceData || !isLastStep}
                className="btn-primary py-2 px-4 text-xs disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none"
              >
                <span>Finish</span>
                <ChevronRight size={14} />
              </button>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

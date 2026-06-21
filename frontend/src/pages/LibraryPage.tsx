import React from 'react';
import { useUserStore } from '../store/userStore';
import { BookOpen, FileText, CheckCircle2, Circle } from 'lucide-react';

export const LibraryPage: React.FC = () => {
  const user = useUserStore((state) => state.user);

  if (!user) return null;

  // Track scoped chapters
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
        topics: ['Array Declaration & Allocation', 'Linear Search', 'Bubble Sort Algortihm'],
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

  const chapters = trackChapters[user.track] || trackChapters.ICSE9;

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h2 className="font-display text-4xl uppercase tracking-wider text-black">
          Syllabus Library
        </h2>
        <p className="text-xs font-bold text-gray-500">
          Scoping study guides, notes, and topics matching your syllabus.
        </p>
      </div>

      {/* Chapters list */}
      <div className="flex flex-col gap-6">
        {chapters.map((chap, idx) => {
          const completionRate = Math.round((chap.completed / chap.topics.length) * 100);
          return (
            <div 
              key={idx} 
              className="card flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
            >
              <div className="flex flex-col gap-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg border border-purple-200">
                    <BookOpen size={16} />
                  </div>
                  <h3 className="font-display text-2xl uppercase tracking-wide text-gray-900 leading-tight">
                    {chap.title}
                  </h3>
                </div>
                <p className="text-xs font-bold text-gray-500 leading-relaxed">
                  {chap.desc}
                </p>

                {/* Sub-Topics list chips */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {chap.topics.map((topic, tidx) => {
                    const isCompleted = tidx < chap.completed;
                    return (
                      <span
                        key={tidx}
                        className={`flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 size={10} /> : <Circle size={10} />}
                        <span>{topic}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Progress pill indicator */}
              <div className="flex flex-col gap-2 items-end shrink-0 w-full md:w-auto">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Completion</span>
                  <span className="font-display text-xl uppercase tracking-wider text-purple-600">
                    {completionRate}% Complete
                  </span>
                </div>
                <div className="w-full md:w-32 bg-gray-100 border border-black rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-purple-600 h-full rounded-full transition-all duration-700" 
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                
                <button className="flex items-center gap-1 text-[10px] font-extrabold text-purple-600 hover:text-purple-700 transition-colors mt-2">
                  <FileText size={12} />
                  <span>Download Revision PDF Notes</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { useUserStore } from '../../store/userStore';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, CheckCircle2, Award, HelpCircle, Sparkles, BookOpen, ChevronRight, ArrowLeft, Layers } from 'lucide-react';

interface FlashcardData {
  id: string;
  track: string;
  chapter_title: string;
  type: string;
  content: {
    front: string;
    back: string;
  };
  correct_answer: string;
  explanation: string;
  chapter_number?: number;
}

interface FlashcardsViewProps {
  onBack: () => void;
}

const themeColors = [
  { bg: '#fee2e2', border: 'border-red-600', text: 'text-red-700' },
  { bg: '#fef3c7', border: 'border-amber-600', text: 'text-amber-700' },
  { bg: '#dcfce7', border: 'border-emerald-600', text: 'text-emerald-700' },
  { bg: '#e0f2fe', border: 'border-sky-600', text: 'text-sky-700' },
  { bg: '#ffedd5', border: 'border-orange-600', text: 'text-orange-700' },
  { bg: '#fce7f3', border: 'border-pink-600', text: 'text-pink-700' },
  { bg: '#f0edfc', border: 'border-purple-600', text: 'text-purple-700' },
  { bg: '#e2f5ec', border: 'border-teal-600', text: 'text-teal-700' }
];

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ onBack }) => {
  const user = useUserStore((state) => state.user);
  const logActivity = useUserStore((state) => state.logActivity);

  const [allCards, setAllCards] = useState<FlashcardData[]>([]);
  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection state
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Drill state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionXp, setSessionXp] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`http://localhost:8000/questions?track=${user.track}&type=flashcard`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch questions");
        return res.json();
      })
      .then((data: FlashcardData[]) => {
        setAllCards(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading flashcards:", err);
        setLoading(false);
      });
  }, [user]);

  // Aggregate cards into unique topics/chapters dynamically
  const topics = useMemo(() => {
    const map = new Map<string, { num: number; title: string; count: number }>();
    allCards.forEach((c) => {
      const title = c.chapter_title;
      const num = c.chapter_number || 99;
      const existing = map.get(title);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(title, { num, title, count: 1 });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.num - b.num);
  }, [allCards]);

  const handleStartDeck = (topicTitle: string | 'mixed') => {
    setSelectedTopic(topicTitle);
    const filtered = topicTitle === 'mixed'
      ? [...allCards].sort(() => Math.random() - 0.5)
      : allCards.filter(c => c.chapter_title === topicTitle);
    
    setCards(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionXp(0);
    setShowSummary(false);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRate = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    const xpRewardMap = {
      again: 1,
      hard: 2,
      good: 3,
      easy: 3,
    };
    const xp = xpRewardMap[rating];
    setSessionXp((prev) => prev + xp);

    // Log individual card rating to backend database
    const card = cards[currentIndex];
    await logActivity(
      'arena_submit',
      `Reviewed flashcard: ${card.chapter_title}`,
      xp,
      { drillId: 'flashcards', cardId: card.id, rating }
    );

    // Go to next card
    if (currentIndex + 1 < cards.length) {
      setIsFlipped(false);
      // Wait a moment for flip transition before swapping content
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 150);
    } else {
      setShowSummary(true);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionXp(0);
    setShowSummary(false);
  };

  const handleExitToMenu = () => {
    setSelectedTopic(null);
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionXp(0);
    setShowSummary(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-gray-500">Loading flashcards from the memory deck...</p>
      </div>
    );
  }

  if (allCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <BookOpen className="text-gray-300 w-16 h-16" />
        <h3 className="font-display text-3xl uppercase">No Flashcards Seeded</h3>
        <p className="text-xs font-bold text-gray-500 max-w-sm">
          We couldn't find any Flashcard revision templates for track: {user?.track}. Run the seed script to start!
        </p>
        <button onClick={onBack} className="btn-primary py-2 px-6">
          Back to Arena
        </button>
      </div>
    );
  }

  // --- RENDERING LANDING SCREEN (TOPIC SELECTION) ---
  if (!selectedTopic) {
    return (
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-extrabold text-purple-600 hover:underline uppercase self-start mb-2">
            <ArrowLeft size={12} />
            <span>Back to Arena</span>
          </button>
          <h2 className="font-display text-4xl uppercase tracking-wider text-black">
            Theory Drill Deck
          </h2>
          <p className="text-xs font-bold text-gray-500">
            Select a sub-deck to review topic theory, or tackle the full track deck in Mixed mode.
          </p>
        </div>

        {/* Grid of Topics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic, index) => {
            const colorTheme = themeColors[index % themeColors.length];
            return (
              <div 
                key={topic.title} 
                className="card flex flex-col justify-between h-full border-2 border-black cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                onClick={() => handleStartDeck(topic.title)}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      Topic {topic.num !== 99 ? topic.num : index + 1}
                    </span>
                    <BookOpen size={16} className="text-gray-400" />
                  </div>

                  <h3 className="font-display text-2xl uppercase tracking-wide text-gray-900 leading-tight">
                    {topic.title}
                  </h3>
                  
                  <p className="text-xs font-bold text-gray-500">
                    {topic.count} cards available for active recall.
                  </p>
                </div>

                <div className="flex justify-between items-center mt-6 border-t border-gray-100 pt-4">
                  <span className="text-xs font-extrabold text-purple-600">
                    +{3} XP per card
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartDeck(topic.title);
                    }}
                    className="btn-primary py-1 px-3 text-xs bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50"
                  >
                    <span>Start Review</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Mixed Challenge Card */}
          <div 
            className="card flex flex-col justify-between h-full border-2 border-black bg-purple-50/40 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            onClick={() => handleStartDeck('mixed')}
          >
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-600 text-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                  All Topics
                </span>
                <Layers size={16} className="text-purple-500" />
              </div>

              <h3 className="font-display text-2xl uppercase tracking-wide text-purple-900 leading-tight">
                Mixed Revision Deck
              </h3>
              
              <p className="text-xs font-bold text-purple-600">
                Randomized practice covering all {allCards.length} cards in this track.
              </p>
            </div>

            <div className="flex justify-between items-center mt-6 border-t border-purple-100 pt-4">
              <span className="text-xs font-extrabold text-purple-600">
                Randomized Shuffle
              </span>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartDeck('mixed');
                }}
                className="btn-primary py-1.5 px-4 text-xs"
              >
                <span>Review All</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERING DRILL SUMMARY SCREEN ---
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
          <h2 className="font-display text-4xl uppercase tracking-wider text-black">Deck Finished!</h2>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Recall Mastery Session Completed</p>
        </div>

        <div className="bg-purple-50/50 border-4 border-black rounded-[2rem] p-8 w-full flex flex-col gap-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border-2 border-black rounded-2xl p-4">
              <span className="text-[10px] uppercase font-bold text-gray-400">Reviewed</span>
              <h4 className="font-display text-3xl text-purple-600">{cards.length} Cards</h4>
              <span className="text-xs font-extrabold text-gray-600">FSRS Engine Synced</span>
            </div>
            <div className="bg-white border-2 border-black rounded-2xl p-4 flex flex-col justify-center items-center">
              <span className="text-[10px] uppercase font-bold text-gray-400">Total Rewards</span>
              <div className="flex items-center gap-1.5 text-amber-500 mt-1">
                <Sparkles size={20} fill="currentColor" />
                <h4 className="font-display text-3xl text-amber-600">+{sessionXp} XP</h4>
              </div>
              <span className="text-xs font-extrabold text-gray-600">Streak Updated!</span>
            </div>
          </div>

          <div className="text-left bg-white border-2 border-black rounded-2xl p-4">
            <h5 className="text-xs font-extrabold text-black uppercase mb-1">Retention Tip</h5>
            <p className="text-xs text-gray-500 font-bold leading-relaxed">
              Spacing out your reviews ensures core concepts transfer from working memory to long-term storage. Good job!
            </p>
          </div>
        </div>

        <div className="flex gap-4 w-full justify-center">
          <button onClick={handleRetry} className="btn-primary py-3 px-6 bg-white text-black border-2 hover:bg-gray-50">
            <RotateCw size={16} />
            <span>Review Again</span>
          </button>
          <button onClick={handleExitToMenu} className="btn-primary py-3 px-6">
            <span>Choose Another Deck</span>
          </button>
        </div>
      </motion.div>
    );
  }

  // --- RENDERING DRILL PLAYING SCREEN ---
  const currentCard = cards[currentIndex];

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <button onClick={handleExitToMenu} className="text-xs font-extrabold text-purple-600 hover:underline uppercase flex items-center gap-1">
            <ArrowLeft size={12} />
            <span>Exit Deck</span>
          </button>
          <h2 className="font-display text-3xl uppercase mt-1">
            {selectedTopic === 'mixed' ? 'Mixed Revision' : selectedTopic}
          </h2>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Flashcard</span>
          <span className="text-sm font-extrabold text-black">
            {currentIndex + 1} of {cards.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-100 rounded-full border-2 border-black overflow-hidden">
        <div
          className="h-full bg-purple-600 border-r-2 border-black transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* 3D Card Area Container */}
      <div className="flex flex-col gap-6 items-center">
        
        {/* The 3D Flip Card */}
        <div 
          className="w-full h-80 relative cursor-pointer"
          style={{ perspective: '1200px' }}
          onClick={handleFlip}
        >
          <motion.div
            className="w-full h-full relative"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            {/* FRONT OF CARD */}
            <div 
              className="absolute inset-0 w-full h-full bg-white border-4 border-black rounded-[2rem] p-8 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
                  {currentCard.chapter_title}
                </span>
                <HelpCircle size={18} className="text-gray-400" />
              </div>

              <div className="flex-1 flex items-center justify-center py-4">
                <h3 className="text-xl md:text-2xl font-extrabold text-center text-gray-800 leading-normal font-body">
                  {currentCard.content.front}
                </h3>
              </div>

              <div className="flex justify-center items-center gap-1.5 text-xs font-bold text-gray-400 uppercase select-none animate-pulse">
                <RotateCw size={12} />
                <span>Click Card to Flip</span>
              </div>
            </div>

            {/* BACK OF CARD */}
            <div 
              className="absolute inset-0 w-full h-full bg-purple-900 border-4 border-black rounded-[2rem] p-8 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-800/40 text-purple-200 border border-purple-700/50">
                  Answer Reveal
                </span>
                <CheckCircle2 size={18} className="text-purple-300" />
              </div>

              <div className="flex-1 flex items-center justify-center py-4 overflow-y-auto">
                <p className="text-base md:text-lg font-bold text-center text-purple-100 leading-relaxed font-body">
                  {currentCard.content.back}
                </p>
              </div>

              <div className="flex justify-center items-center gap-1.5 text-xs font-bold text-purple-300 uppercase select-none">
                <span>Explanation & Info below</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Rating Actions Panel */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {!isFlipped ? (
              <motion.div
                key="flip-prompt"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-center"
              >
                <button
                  onClick={handleFlip}
                  className="btn-primary py-3 px-8 text-sm uppercase flex items-center gap-2"
                >
                  <RotateCw size={16} />
                  <span>Reveal Answer</span>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="rate-prompt"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6 w-full"
              >
                {/* Scheduling controls */}
                <div className="flex flex-col gap-2 bg-gray-50 border-2 border-black rounded-[1.5rem] p-4 text-center">
                  <span className="text-[10px] font-extrabold uppercase text-gray-500">How well did you recall this?</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                      onClick={() => handleRate('again')}
                      className="border-2 border-black rounded-xl p-3 bg-red-100/60 hover:bg-red-100 text-red-800 font-extrabold text-xs transition-all hover:scale-105 flex flex-col items-center gap-0.5 cursor-pointer"
                    >
                      <span className="text-[14px]">Again</span>
                      <span className="text-[9px] text-red-500 font-bold">Hard Reset (+1 XP)</span>
                    </button>
                    <button
                      onClick={() => handleRate('hard')}
                      className="border-2 border-black rounded-xl p-3 bg-amber-100/60 hover:bg-amber-100 text-amber-800 font-extrabold text-xs transition-all hover:scale-105 flex flex-col items-center gap-0.5 cursor-pointer"
                    >
                      <span className="text-[14px]">Hard</span>
                      <span className="text-[9px] text-amber-500 font-bold">Soon (+2 XP)</span>
                    </button>
                    <button
                      onClick={() => handleRate('good')}
                      className="border-2 border-black rounded-xl p-3 bg-indigo-100/60 hover:bg-indigo-100 text-indigo-800 font-extrabold text-xs transition-all hover:scale-105 flex flex-col items-center gap-0.5 cursor-pointer"
                    >
                      <span className="text-[14px]">Good</span>
                      <span className="text-[9px] text-indigo-500 font-bold">Normal (+3 XP)</span>
                    </button>
                    <button
                      onClick={() => handleRate('easy')}
                      className="border-2 border-black rounded-xl p-3 bg-green-100/60 hover:bg-green-100 text-green-800 font-extrabold text-xs transition-all hover:scale-105 flex flex-col items-center gap-0.5 cursor-pointer"
                    >
                      <span className="text-[14px]">Easy</span>
                      <span className="text-[9px] text-green-500 font-bold">Later (+3 XP)</span>
                    </button>
                  </div>
                </div>

                {/* Explanation Card */}
                <div className="bg-purple-50/30 border-2 border-purple-200 rounded-[1.5rem] p-5 flex flex-col gap-2">
                  <span className="text-[10px] font-extrabold uppercase text-purple-600 tracking-wide">Concept Explanation</span>
                  <p className="text-xs text-gray-600 font-bold leading-relaxed">
                    {currentCard.explanation}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

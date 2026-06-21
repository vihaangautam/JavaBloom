import React, { useState } from 'react';
import { useUserStore } from '../store/userStore';
import { BookOpen, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const login = useUserStore((state) => state.login);
  const signup = useUserStore((state) => state.signup);

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<'ICSE9' | 'ICSE10' | 'APCSA'>('ICSE9');
  const [step, setStep] = useState(1); // For signup: Step 1 = details, Step 2 = track selection
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username is required!');
      return;
    }
    setError('');
    await login(username);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim()) {
      setError('All fields are required!');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSignupSubmit = async () => {
    setError('');
    await signup(username, fullName, selectedTrack);
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4 flex flex-col items-center">
      {/* Brand logo banner */}
      <div className="flex items-center gap-2 mb-8 animate-bounce">
        <div className="bg-purple-600 border-2 border-black rounded-2xl p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <BookOpen className="text-white w-8 h-8" />
        </div>
        <h1 className="font-display text-4xl uppercase tracking-wider text-black">
          Java<span className="text-purple-600">Bloom</span>
        </h1>
      </div>

      <div className="w-full bg-white border-4 border-black rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
        {step === 1 ? (
          <>
            {/* Navigation Tabs */}
            <div className="flex border-2 border-black rounded-full p-1 bg-gray-100 mb-8 max-w-sm mx-auto">
              <button
                className={`flex-1 py-2 px-4 rounded-full text-sm font-bold transition-all ${
                  isLoginTab ? 'bg-purple-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black' : 'text-gray-500 border-2 border-transparent'
                }`}
                onClick={() => {
                  setIsLoginTab(true);
                  setError('');
                }}
              >
                Sign In
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-full text-sm font-bold transition-all ${
                  !isLoginTab ? 'bg-purple-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black' : 'text-gray-500 border-2 border-transparent'
                }`}
                onClick={() => {
                  setIsLoginTab(false);
                  setError('');
                }}
              >
                Create Profile
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-700 text-xs font-bold rounded-xl text-center">
                {error}
              </div>
            )}

            {isLoginTab ? (
              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Enter your Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. dev_fresher"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-black focus:outline-none focus:ring-2 focus:ring-purple-600 font-bold"
                  />
                </div>
                
                <button type="submit" className="btn-primary mt-4 py-4 text-lg">
                  Let's Code! 🚀
                </button>
                <p className="text-center text-xs text-gray-400 font-bold mt-2">
                  Don't worry, any username works! It saves your profile in this browser.
                </p>
              </form>
            ) : (
              <form onSubmit={handleNextStep} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Choose a Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. coder_rohit"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-black focus:outline-none focus:ring-2 focus:ring-purple-600 font-bold"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Your Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rohit Sharma"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-black focus:outline-none focus:ring-2 focus:ring-purple-600 font-bold"
                  />
                </div>

                <button type="submit" className="btn-primary mt-4 py-4 text-lg">
                  Next: Select Track ➜
                </button>
              </form>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center">
            <button
              onClick={() => setStep(1)}
              className="self-start text-xs font-bold text-gray-400 hover:text-purple-600 mb-4 transition-colors"
            >
              ← Back to Details
            </button>

            <h2 className="font-display text-3xl uppercase tracking-wider text-center text-black mb-2">
              Which course are you studying?
            </h2>
            <p className="text-sm font-bold text-gray-500 text-center mb-8">
              We will customize your exercises, trace snippets, and quizzes to match your syllabus.
            </p>

            {/* Track Selector Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
              {[
                { id: 'ICSE9', title: 'ICSE Class 9', desc: 'Computer Applications', badge: 'Java Basics' },
                { id: 'ICSE10', title: 'ICSE Class 10', desc: 'Computer Applications', badge: 'OOPs & Arrays' },
                { id: 'APCSA', title: 'AP Computer Science A', desc: 'College Level Java', badge: 'Algorithms & Data Structures' }
              ].map((track) => (
                <button
                  key={track.id}
                  onClick={() => setSelectedTrack(track.id as any)}
                  className={`flex flex-col text-left p-5 rounded-2xl border-3 transition-all relative overflow-hidden h-full ${
                    selectedTrack === track.id
                      ? 'border-purple-600 bg-purple-50/50 shadow-[4px_4px_0px_0px_rgba(147,51,234,1)] translate-y-[-2px]'
                      : 'border-black bg-white hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px]'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 w-max mb-3">
                    {track.badge}
                  </span>
                  <h4 className="font-display text-xl uppercase tracking-wide leading-tight text-gray-900 mb-1">
                    {track.title}
                  </h4>
                  <p className="text-xs font-bold text-gray-500">{track.desc}</p>
                  
                  {selectedTrack === track.id && (
                    <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-0.5 border border-black">
                      <Sparkles className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleSignupSubmit}
              className="btn-primary w-full max-w-md py-4 text-lg"
            >
              Start Earning XP! ✨
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

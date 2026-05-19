import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Timer, X, CheckCircle, ChefHat } from 'lucide-react';

function parseSteps(steps) {
  if (!steps) return [];
  if (Array.isArray(steps)) return steps.map(s => (typeof s === 'string' ? s : JSON.stringify(s)));
  try { return JSON.parse(steps); } catch { return steps.split('\n').filter(Boolean); }
}

function useWakeLock() {
  const lockRef = useRef(null);
  useEffect(() => {
    if (!('wakeLock' in navigator)) return;
    navigator.wakeLock.request('screen').then(lock => { lockRef.current = lock; }).catch(() => {});
    return () => { lockRef.current?.release().catch(() => {}); };
  }, []);
}

function TimerWidget({ onDone }) {
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  const start = () => {
    const secs = (parseInt(minutes) || 0) * 60;
    if (secs <= 0) return;
    setSeconds(secs);
    setRunning(true);
  };

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
          onDone?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (running || seconds > 0) {
    const total = (parseInt(minutes) || 1) * 60;
    const pct = ((total - seconds) / total) * 100;
    return (
      <div className="flex flex-col items-center gap-3">
        {/* Circular progress */}
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#f0dfc0" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="34" fill="none"
              stroke={seconds <= 10 ? '#ef4444' : '#ea7c2b'} strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (pct / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center font-bold text-base ${seconds <= 10 ? 'text-red-500' : 'text-gray-800'}`}>
            {fmt(seconds)}
          </span>
        </div>
        <button
          onClick={() => { clearInterval(intervalRef.current); setRunning(false); setSeconds(0); }}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Cancel timer
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl px-3 py-2">
        <Timer size={14} className="text-gray-400" />
        <input
          type="number"
          min="1"
          max="120"
          value={minutes}
          onChange={e => setMinutes(e.target.value)}
          placeholder="min"
          className="w-12 bg-transparent text-sm font-semibold text-gray-700 focus:outline-none placeholder-gray-300"
        />
        <span className="text-xs text-gray-400">min</span>
      </div>
      <button
        onClick={start}
        disabled={!minutes}
        className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-opacity"
        style={{ background: 'linear-gradient(135deg, #ea7c2b, #c4611a)' }}
      >
        Start
      </button>
    </div>
  );
}

export default function CookingModePage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const recipe = state?.recipe;
  const steps = parseSteps(recipe?.steps);
  const [step, setStep] = useState(0);
  const [voiceOn, setVoiceOn] = useState(false);
  const [done, setDone] = useState(false);
  const [timerDoneFlash, setTimerDoneFlash] = useState(false);

  useWakeLock();

  const speak = useCallback((text) => {
    if (!voiceOn || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  }, [voiceOn]);

  useEffect(() => {
    if (steps[step]) speak(steps[step]);
  }, [step, voiceOn]);

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  if (!recipe || steps.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-6">
        <ChefHat size={40} className="text-gray-300" />
        <p className="text-gray-500 text-center">No recipe steps found.<br />Go back and open a recipe first.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg,#ea7c2b,#c4611a)' }}>
          Go back
        </button>
      </div>
    );
  }

  const progress = ((step + 1) / steps.length) * 100;

  if (done) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8 text-center">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You did it!</h2>
        <p className="text-gray-500 text-base mb-2">{recipe.title}</p>
        <p className="text-gray-400 text-sm mb-10">Time to plate and enjoy.</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => navigate('/pantry')}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm"
            style={{ background: 'linear-gradient(135deg,#ea7c2b,#c4611a)' }}
          >
            Update my pantry
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-xl font-semibold text-gray-600 text-sm bg-gray-100"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col select-none" dir="ltr">

      {/* Progress bar + header */}
      <div className="flex-shrink-0">
        <div className="h-1 bg-gray-100">
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#ea7c2b,#f5a05a)' }}
          />
        </div>
        <div className="flex items-center justify-between px-5 py-3">
          <button onClick={() => navigate(-1)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl">
            <X size={20} />
          </button>
          <div className="text-center">
            <p className="text-xs text-gray-400 font-medium">{recipe.title}</p>
            <p className="text-sm font-bold text-gray-900">Step {step + 1} of {steps.length}</p>
          </div>
          <button
            onClick={() => { setVoiceOn(v => !v); }}
            className={`p-1.5 rounded-xl transition-colors ${voiceOn ? 'text-orange-500 bg-orange-50' : 'text-gray-400'}`}
          >
            {voiceOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        {/* Step number pill */}
        <div className="flex justify-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md"
            style={{ background: 'linear-gradient(135deg,#ea7c2b,#c4611a)' }}
          >
            {step + 1}
          </div>
        </div>

        {/* Step text */}
        <p
          key={step}
          className="text-gray-800 text-xl leading-relaxed font-medium text-center"
          style={{ animation: 'fadeInUp 0.3s ease' }}
        >
          {/* Strip leading "Step N:" prefix if present */}
          {steps[step].replace(/^step\s*\d+[:.]\s*/i, '')}
        </p>

        {/* Timer */}
        <div className={`flex justify-center mt-10 transition-all ${timerDoneFlash ? 'scale-110' : 'scale-100'}`}>
          <TimerWidget onDone={() => {
            setTimerDoneFlash(true);
            setTimeout(() => setTimerDoneFlash(false), 600);
          }} />
        </div>
      </div>

      {/* Step dots */}
      <div className="flex justify-center gap-1.5 pb-4">
        {steps.map((_, i) => (
          <div
            key={i}
            onClick={() => setStep(i)}
            className={`rounded-full transition-all cursor-pointer ${
              i === step ? 'w-5 h-2 bg-orange-500' : i < step ? 'w-2 h-2 bg-orange-300' : 'w-2 h-2 bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex-shrink-0 flex gap-3 px-5 pb-10">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gray-100 text-gray-600 font-semibold text-sm disabled:opacity-30 transition-opacity"
        >
          <ChevronLeft size={18} /> Previous
        </button>

        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold text-sm transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg,#ea7c2b,#c4611a)' }}
          >
            Next <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={() => setDone(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold text-sm"
            style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}
          >
            <CheckCircle size={18} /> Finish
          </button>
        )}
      </div>

      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}

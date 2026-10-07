import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Volume2, Sparkles, Check } from 'lucide-react';

export default function VoiceAssistantModal({ isOpen, onClose, onVoiceQuery }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [statusText, setStatusText] = useState('Click microphone and speak your shopping query...');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      setTranscript('');
      return;
    }

    // Check Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Indian English or generic English

      recognition.onstart = () => {
        setIsListening(true);
        setStatusText("I'm listening... Speak naturally.");
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error', event.error);
        setIsListening(false);
        setStatusText('Could not understand speech. Click to try again or type instead.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setStatusText('Speech Recognition is not supported on this browser. Try Chrome or Edge.');
    }

    return () => {
      stopListening();
    };
  }, [isOpen]);

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        setTranscript('');
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const handleConfirm = () => {
    if (transcript.trim()) {
      onVoiceQuery(transcript.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Voice Shopping Assistant</h3>
        </div>
        <p className="text-xs text-slate-500 mb-6">{statusText}</p>

        {/* Animated Mic Button & Pulse Wave */}
        <div className="relative flex items-center justify-center mb-6">
          {isListening && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="w-24 h-24 rounded-full bg-blue-500/20 animate-ping" />
              <span className="w-32 h-32 rounded-full bg-indigo-500/10 animate-pulse" />
            </div>
          )}

          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 cursor-pointer ${
              isListening
                ? 'bg-red-500 shadow-red-500/40 scale-105'
                : 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/30 hover:scale-105'
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
        </div>

        {/* Live Audio Waves when Listening */}
        {isListening && (
          <div className="flex items-center justify-center gap-1.5 h-8 mb-4">
            <span className="w-1.5 bg-blue-500 rounded-full animate-wave-1" />
            <span className="w-1.5 bg-indigo-500 rounded-full animate-wave-2" />
            <span className="w-1.5 bg-cyan-400 rounded-full animate-wave-3" />
            <span className="w-1.5 bg-blue-600 rounded-full animate-wave-4" />
            <span className="w-1.5 bg-purple-500 rounded-full animate-wave-2" />
          </div>
        )}

        {/* Live Transcription Box */}
        <div className="min-h-16 max-h-28 overflow-y-auto bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 mb-5 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-slate-100 flex items-center justify-center">
          {transcript ? (
            <span>"{transcript}"</span>
          ) : (
            <span className="text-slate-400 text-xs italic">
              Say e.g. "Find best gaming laptop under ₹80,000" or "Compare iPhone 16 and Samsung S25"
            </span>
          )}
        </div>

        {/* Quick Sample Prompts */}
        <div className="flex flex-wrap gap-1.5 justify-center mb-5">
          {[
            "Find gaming laptop under ₹80,000",
            "Compare iPhone 16 and Samsung S25",
            "Best headphones for coding"
          ].map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTranscript(sample);
              }}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              {sample}
            </button>
          ))}
        </div>

        {/* Action Button */}
        <button
          disabled={!transcript.trim()}
          onClick={handleConfirm}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Ask AI Assistant</span>
        </button>
      </div>
    </div>
  );
}

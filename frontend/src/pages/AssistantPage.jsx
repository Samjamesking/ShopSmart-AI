import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  User,
  Send,
  Mic,
  Camera,
  Sparkles,
  Volume2,
  VolumeX,
  Scale,
  Heart,
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCartWishlist } from '../context/CartWishlistContext';

export default function AssistantPage({ initialQuery, onSelectProduct, onOpenVoice, onOpenImage }) {
  const { user } = useAuth();
  const { formatPrice } = useTheme();
  const { isWishlisted, toggleWishlist, isComparing, toggleCompare } = useCartWishlist();

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      agentName: 'Product Finder Agent',
      content: 'Hello! I am your AI Shopping Assistant. Ask me anything—I can find top products, compare specs side-by-side, analyze customer reviews, or stick strictly to your budget.',
      suggestedFollowups: [
        'Find best gaming laptop under 80000',
        'Compare iPhone 16 and Samsung S25',
        'Show best headphones for coding',
        'Suggest gifts under 2000'
      ],
      products: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSend(initialQuery.trim());
    }
  }, [initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: query.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.sendChatMessage(query.trim());
      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        agentName: res.agent_name || 'Product Finder Agent',
        content: res.reply,
        products: res.products || [],
        comparisonData: res.comparison_data,
        reviewAnalysis: res.review_analysis,
        budgetAdvice: res.budget_advice,
        suggestedFollowups: res.suggested_followups || []
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          agentName: 'Error Handling',
          content: 'Sorry, I encountered an issue processing your request. Please try again.',
          products: [],
          suggestedFollowups: ['Show best gaming laptops', 'Compare iPhone 16 and Samsung S25']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (msgId, text) => {
    if (!window.speechSynthesis) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="h-[calc(100vh-4.5rem)] flex flex-col bg-slate-50 dark:bg-[#0b0f19] transition-colors">
      {/* Top Page Sub-header */}
      <div className="px-6 py-3.5 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">AI Shopping Assistant</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">Powered by Multi-Agent RAG & Real-Time Product Intelligence</p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 1,
                role: 'assistant',
                agentName: 'Product Finder Agent',
                content: 'Chat reset! How can I help you discover or compare products today?',
                suggestedFollowups: [
                  'Find best gaming laptop under 80000',
                  'Compare iPhone 16 and Samsung S25',
                  'Show best headphones for coding'
                ],
                products: []
              }
            ]);
          }}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-5xl w-full mx-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}
          >
            {/* Sender Badge */}
            <div className="flex items-center gap-2 px-1 text-xs">
              {msg.role === 'assistant' ? (
                <>
                  <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {msg.agentName || 'ShopSmart Agent'}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-semibold text-slate-500">You</span>
                  <div className="w-5 h-5 rounded-md bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-[10px] font-bold">
                    {user?.name ? user.name[0] : 'U'}
                  </div>
                </>
              )}
            </div>

            {/* Bubble Content */}
            <div
              className={`max-w-2xl sm:max-w-3xl rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-line">{msg.content}</div>

              {/* Text-to-speech button for assistant */}
              {msg.role === 'assistant' && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                  <button
                    onClick={() => handleSpeak(msg.id, msg.content)}
                    className="text-[11px] font-semibold text-slate-400 hover:text-blue-500 flex items-center gap-1 transition cursor-pointer"
                  >
                    {speakingMsgId === msg.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-rose-500">Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Interactive Product Carousel inside Assistant message */}
            {msg.products && msg.products.length > 0 && (
              <div className="w-full max-w-3xl mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {msg.products.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex flex-col justify-between hover:border-blue-500 dark:hover:border-blue-500 shadow-sm transition group"
                    >
                      <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2.5">
                        <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        {prod.discount_percent > 0 && (
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-bold">
                            {prod.discount_percent}% OFF
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">{prod.brand}</span>
                        <h4
                          onClick={() => onSelectProduct(prod.id)}
                          className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 hover:text-blue-500 cursor-pointer"
                        >
                          {prod.name}
                        </h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {formatPrice(prod.price)}
                          </span>
                          <span className="text-xs font-semibold text-amber-500">
                            ★ {prod.rating}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                        <button
                          onClick={() => onSelectProduct(prod.id)}
                          className="flex-1 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 text-xs font-semibold transition cursor-pointer text-center"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => toggleCompare(prod)}
                          title="Compare"
                          className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                            isComparing(prod.id)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-500'
                          }`}
                        >
                          <Scale className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleWishlist(prod)}
                          title="Wishlist"
                          className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                            isWishlisted(prod.id)
                              ? 'bg-rose-500 text-white border-rose-500'
                              : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-500'
                          }`}
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Suggested Followup Pills */}
            {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
              <div className="flex flex-wrap gap-1.5 max-w-3xl pt-1">
                <span className="text-[11px] text-slate-400 font-medium py-1">You can also ask:</span>
                {msg.suggestedFollowups.map((followup, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(followup)}
                    className="text-xs px-3 py-1 rounded-full bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-400 transition cursor-pointer shadow-2xs"
                  >
                    {followup}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-2 p-4 max-w-xs rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
            <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
            <span className="text-xs font-semibold text-slate-500">
              AI Agent is researching products & comparing specs...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Prompt Bar */}
      <div className="p-4 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-4xl mx-auto flex items-center gap-2"
        >
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything... (e.g. Find lightweight laptop for coding or Compare iPhone 16 and Samsung S25)"
              className="w-full pl-4 pr-24 py-3 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
            />
            <div className="absolute right-2 flex items-center gap-1">
              <button
                type="button"
                onClick={onOpenVoice}
                title="Voice Search"
                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onOpenImage}
                title="Visual Search"
                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

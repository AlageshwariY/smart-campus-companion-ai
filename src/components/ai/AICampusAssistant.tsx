import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Bot, User, Trash2, Paperclip, Copy, Check, RefreshCw, FileText, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { aiService } from '../../services/aiService';
import { AIChatMessage } from '../../types';

export const AICampusAssistant: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [conversationId] = useState(() => 'conv-' + Date.now());
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggested prompt chips
  const quickPrompts = [
    "What classes do I have today?",
    "When is my next exam?",
    "How much attendance do I have?",
    "Which subject has my lowest attendance?",
    "Where is Lab 402?",
    "Explain B-Tree indexing in DBMS",
    "What assignments are due this week?",
    "Help me prepare for placement interviews"
  ];

  useEffect(() => {
    async function loadHistory() {
      if (!user) return;
      const history = await aiService.getChatHistory(user.id);
      if (history.length > 0) {
        setMessages(history);
      } else {
        setMessages([
          {
            id: 'init-msg',
            student_id: user.id,
            conversation_id: conversationId,
            role: 'assistant',
            message: `Hello ${user.full_name}! 👋 I am your Smart Campus AI Operating System. I have direct context connection to your live database records (attendance, timetable, assignments, exams) and official campus document handbook.\n\nHow can I help you excel today?`,
            created_at: new Date().toISOString()
          }
        ]);
      }
    }
    loadHistory();
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || !user || loading) return;

    const userMsg: AIChatMessage = {
      id: 'usr-' + Date.now(),
      student_id: user.id,
      conversation_id: conversationId,
      role: 'user',
      message: query,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      const res = await aiService.askAssistant(user, query, conversationId);
      const assistantMsg: AIChatMessage = {
        id: 'ast-' + Date.now(),
        student_id: user.id,
        conversation_id: conversationId,
        role: 'assistant',
        message: res.reply,
        sources: res.sources,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (!user) return;
    setMessages([
      {
        id: 'init-msg-' + Date.now(),
        student_id: user.id,
        conversation_id: conversationId,
        role: 'assistant',
        message: `Conversation history reset. How can I assist you now, ${user.full_name}?`,
        created_at: new Date().toISOString()
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] glass-card rounded-2xl border border-slate-800 overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Campus AI Assistant
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LIVE RAG & DB SYNC
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Context: {user?.full_name} ({user?.register_number}, {user?.department})</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            title="Clear Conversation"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950/40">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isUser 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed space-y-2 relative group ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20 font-medium'
                    : 'glass-panel text-slate-200 rounded-tl-none border border-slate-800/80'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.message}</div>

                {/* Sources attribution tag */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="font-bold text-indigo-400">Reference Sources:</span>
                    {msg.sources.map((src, sIdx) => (
                      <span key={sIdx} className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {src}
                      </span>
                    ))}
                  </div>
                )}

                {/* Copy button */}
                {!isUser && (
                  <button
                    onClick={() => handleCopyMessage(msg.id, msg.message)}
                    className="absolute top-2 right-2 p-1 rounded-lg bg-slate-900/80 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy response"
                  >
                    {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="glass-panel p-3.5 rounded-2xl text-xs text-indigo-300 flex items-center gap-2 border border-indigo-500/30">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
              <span>Searching student DB records & RAG campus documents...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Prompts:</span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1 rounded-full text-[11px] font-medium bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-800 transition-all whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about your attendance, timetable, exams, campus rules, or concepts..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-md shadow-indigo-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

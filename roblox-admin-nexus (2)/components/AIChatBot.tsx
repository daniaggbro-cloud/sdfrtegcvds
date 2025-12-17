
import React, { useState, useRef, useEffect } from 'react';
import { generateAIResponse } from '../services/geminiService';
import { AIChatMessage } from '../types';

export const AIChatBot: React.FC = () => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    { role: 'model', text: 'Nexus AI в здании помогу с клиентами и роблоксом пиши че надо' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input;
    setInput('');
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    try {
      const responseText = await generateAIResponse(userText);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "ошибка связи с базой чекай коннект" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/40 border-l border-white/5 animate-fade-in relative">
      {/* Header */}
      <div className="bg-indigo-950/20 p-6 flex items-center justify-between border-b border-white/5 backdrop-blur-3xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-black text-white text-xs uppercase italic tracking-widest leading-none">Nexus AI</h3>
            <p className="text-[8px] text-indigo-400 font-black uppercase mt-1">Assistant Online</p>
          </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar text-[13px] leading-relaxed">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
            <div className={`max-w-[88%] rounded-2xl px-4 py-2.5 shadow-md ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-slate-900 text-slate-200 border border-white/5 rounded-bl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900/50 rounded-xl px-4 py-2 flex gap-1.5 items-center border border-white/5">
              <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce delay-100"></span>
              <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field - Fixed at bottom of container */}
      <div className="p-6 bg-slate-950/80 border-t border-white/5 shrink-0">
        <div className="relative group">
          <input
            type="text"
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:border-indigo-500/50 text-white placeholder-slate-600 transition-all font-bold"
            placeholder="Пиши сюда..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-all shadow-lg flex items-center justify-center disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

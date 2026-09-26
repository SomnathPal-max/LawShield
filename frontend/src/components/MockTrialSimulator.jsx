import React, { useState } from 'react';
import { Gavel, Send, Mic, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export const MockTrialSimulator = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { 
      role: 'judge', 
      text: "Court is now in session. The opposing counsel may begin their cross-examination of the witness. Remember to speak clearly and stick to the facts." 
    },
    { 
      role: 'opposing_counsel', 
      text: "Isn't it true that you were not even present at the location when the incident occurred, and you are simply fabricating this story to extract a settlement?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userText = input.trim();
    const newMessages = [...messages, { role: 'witness', text: userText }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      // Simulate backend/AI response offline for instantaneous demo, 
      // or we can call our generic AI endpoint
      // Using generic /api/ai/analyze for this mock trial logic
      const prompt = `Act as an opposing counsel in a mock trial. The witness just said: "${userText}". 
      Reply with a tough follow-up question or an objection. Keep it under 2 sentences. 
      Also provide a strict 1-sentence feedback on the witness's answer in brackets at the end like [Feedback: ...].`;
      
      const res = await api.post('/ai/analyze', { problem: prompt });
      const fullText = res.data.analysis || "I have no further questions at this time. [Feedback: Your response was acceptable but slightly defensive.]";
      
      // Parse out the feedback
      const feedbackMatch = fullText.match(/\[Feedback:(.*?)\]/i);
      const aiResponse = fullText.replace(/\[Feedback:(.*?)\]/gi, '').trim();
      const feedbackText = feedbackMatch ? feedbackMatch[1].trim() : "Keep your answers concise and factual.";

      setMessages([...newMessages, { role: 'opposing_counsel', text: aiResponse }]);
      setFeedback(feedbackText);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'opposing_counsel', text: "Objection, hearsay. Answer the question directly." }]);
      setFeedback("Avoid guessing or emotional responses. State only what you observed.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden flex flex-col h-[70vh] min-h-[500px]">
      <div className="bg-[#0f172a] p-4 flex items-center justify-between text-white">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
            <Gavel size={20} />
          </div>
          <div>
            <h3 className="font-bold">AI Mock Trial Simulator</h3>
            <p className="text-xs text-slate-300">Practice Testimony & Cross-Examination</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-lg px-2">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'witness' ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 px-1">
              {msg.role.replace('_', ' ')}
            </span>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.role === 'witness' 
                ? 'bg-[#0f172a] text-white rounded-tr-sm' 
                : msg.role === 'judge'
                  ? 'bg-amber-100 text-amber-950 border border-amber-200 rounded-tl-sm'
                  : 'bg-white border border-stone-200 text-slate-800 rounded-tl-sm shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-start">
            <div className="bg-white border border-stone-200 text-slate-500 p-3 rounded-2xl rounded-tl-sm text-sm italic">
              Opposing counsel is speaking...
            </div>
          </div>
        )}
      </div>

      {feedback && (
        <div className="bg-emerald-50 border-t border-emerald-100 p-3 flex items-start space-x-3 text-emerald-900 text-xs">
          <ShieldAlert size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Live AI Feedback:</strong> {feedback}
          </div>
        </div>
      )}

      <div className="p-4 bg-white border-t border-stone-200 flex items-center space-x-3">
        <button className="p-3 bg-stone-100 hover:bg-stone-200 text-slate-600 rounded-xl transition">
          <Mic size={18} />
        </button>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="State your answer for the court..."
          className="flex-1 bg-stone-50 border-2 border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0f172a] transition"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="p-3 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-xl transition disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

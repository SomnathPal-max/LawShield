import React from 'react';
import { Calendar, Clock, FileText, UserCheck, ShieldAlert, Sparkles, Scale } from 'lucide-react';

export default function VisualStoryboard({ storyboard }) {
  if (!storyboard) return null;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-10 space-y-8 shadow-xl">
      {/* Header & Primary Offense */}
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-2 text-emerald-400 font-black uppercase tracking-widest text-xs mb-2">
          <Sparkles size={14} />
          <span>AI Synthesized Brief</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white">{storyboard.primaryOffense || 'Legal Case Brief'}</h2>
      </div>

      {/* Executive Summary */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
          <Scale size={16} className="text-blue-400" />
          <span>Executive Legal Summary</span>
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed bg-slate-950 p-5 rounded-2xl border border-slate-800 font-medium">
          {storyboard.executiveSummary}
        </p>
      </div>

      {/* Entities Involved */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
          <UserCheck size={16} className="text-indigo-400" />
          <span>Key Entities</span>
        </h3>
        <div className="flex flex-wrap gap-3">
          {storyboard.entities?.map((ent, idx) => (
            <div key={idx} className="bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-xl flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase">{ent.role}</span>
              <span className="text-sm font-bold text-white">{ent.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chronological Timeline */}
      <div className="space-y-6 pt-4 border-t border-slate-800">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
          <Calendar size={16} className="text-amber-400" />
          <span>Chronological Timeline</span>
        </h3>

        <div className="relative border-l-2 border-slate-700 ml-4 space-y-8 pb-4">
          {storyboard.timeline?.map((event, idx) => (
            <div key={idx} className="relative pl-6">
              {/* Timeline Dot */}
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              
              <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl hover:border-slate-500 transition">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded-md border border-emerald-500/20 flex items-center space-x-1">
                    <Calendar size={12} />
                    <span>{event.date}</span>
                  </span>
                  <span className="text-xs font-bold text-amber-400 bg-amber-950/50 px-2 py-1 rounded-md border border-amber-500/20 flex items-center space-x-1">
                    <Clock size={12} />
                    <span>{event.time}</span>
                  </span>
                </div>
                
                <p className="text-sm font-semibold text-slate-200 mt-2">
                  {event.event}
                </p>

                {event.evidenceLink && (
                  <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center space-x-2 text-xs font-bold text-blue-400 bg-blue-950/30 p-2 rounded-lg border border-blue-500/20 w-fit">
                    <FileText size={14} />
                    <span>Evidence Attached: {event.evidenceLink}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

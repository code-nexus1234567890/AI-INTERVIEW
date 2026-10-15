"use client";

import React from "react";
import { EmotionSnapshot } from "@/lib/emotionEngine";

export interface EmotionTimelineProps {
  timeline: EmotionSnapshot[];
}

export function EmotionTimeline({ timeline }: EmotionTimelineProps) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="w-full h-48 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-500 text-sm font-medium">
        No timeline data collected for this interview session.
      </div>
    );
  }

  const maxTime = Math.max(...timeline.map((t) => t.timestamp), 1);
  const points = timeline.map((item) => {
    const x = (item.timestamp / maxTime) * 100;
    const y = 100 - item.engagementScore;
    return `${x},${y}`;
  });

  const pathD = `M 0,100 ${points.map((p) => `L ${p}`).join(" ")} L 100,100 Z`;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Engagement & Emotion Timeline</h3>
          <p className="text-xs font-medium text-slate-500">Fluctuations in engagement score & facial composure over time</p>
        </div>
        <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
          Duration: {maxTime}s
        </span>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full h-44 bg-slate-50 rounded-xl overflow-hidden p-2 border border-slate-200">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="25" x2="100" y2="25" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2,2" />

          {/* Area Fill */}
          <path d={pathD} fill="url(#engagementGradient)" />

          {/* Line Path */}
          <path
            d={`M ${points.join(" L ")}`}
            fill="none"
            stroke="#4f46e5"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Eye Contact Markers */}
          {timeline.map((snap, i) => {
            if (snap.isEyeContact) {
              const x = (snap.timestamp / maxTime) * 100;
              const y = 100 - snap.engagementScore;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="1.2"
                  className="fill-emerald-500 stroke-white"
                  strokeWidth="0.5"
                />
              );
            }
            return null;
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-2 border-t border-slate-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-indigo-600 rounded-full" />
            <span>Engagement Curve</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span>Direct Eye Contact Point</span>
          </div>
        </div>
        <span>0s → {maxTime}s</span>
      </div>
    </div>
  );
}

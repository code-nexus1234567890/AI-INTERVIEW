"use client";

import React from "react";
import { Smile, Eye, Activity, Sparkles } from "lucide-react";
import { FaceAnalysisResult, EmotionScores } from "@/lib/emotionEngine";

export interface EmotionAnalyzerProps {
  analysis: FaceAnalysisResult;
}

const emotionConfig: Record<
  keyof EmotionScores,
  { label: string; color: string; bg: string; emoji: string }
> = {
  Happy: { label: "Happy", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", emoji: "😊" },
  Neutral: { label: "Neutral", color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200", emoji: "😐" },
  Sad: { label: "Sad / Pensive", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", emoji: "😔" },
  Angry: { label: "Tense / Focused", color: "text-rose-700", bg: "bg-rose-50 border-rose-200", emoji: "😠" },
  Fear: { label: "Nervous", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", emoji: "😰" },
  Surprise: { label: "Surprised", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", emoji: "😲" },
  Disgust: { label: "Discomfort", color: "text-orange-700", bg: "bg-orange-50 border-orange-200", emoji: "😖" },
};

export function EmotionAnalyzer({ analysis }: EmotionAnalyzerProps) {
  const currentConfig = emotionConfig[analysis.dominantEmotion] || emotionConfig.Neutral;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs tracking-wider uppercase">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Real-Time AI Telemetry</span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono font-semibold">
          Confidence: {Math.round(analysis.confidence * 100)}%
        </span>
      </div>

      {/* Dominant Emotion Card */}
      <div className={`p-4 rounded-xl border flex items-center justify-between ${currentConfig.bg}`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{currentConfig.emoji}</span>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Dominant Emotion</p>
            <p className={`text-lg font-bold ${currentConfig.color}`}>{currentConfig.label}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-slate-500">Probability</p>
          <p className={`text-base font-mono font-bold ${currentConfig.color}`}>
            {Math.round((analysis.emotionScores[analysis.dominantEmotion] || 0) * 100)}%
          </p>
        </div>
      </div>

      {/* Grid Indicators: Eye Contact, Engagement, Smile */}
      <div className="grid grid-cols-3 gap-3">
        {/* Eye Contact */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            <span>Eye Contact</span>
          </div>
          <p
            className={`text-sm font-bold mt-1 ${
              analysis.isEyeContact ? "text-emerald-600" : "text-amber-600"
            }`}
          >
            {analysis.isEyeContact ? "Direct" : "Averted"}
          </p>
        </div>

        {/* Engagement */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Activity className="w-3.5 h-3.5 text-indigo-600" />
            <span>Engagement</span>
          </div>
          <p className="text-sm font-bold text-indigo-600 mt-1">{analysis.engagementScore}/100</p>
        </div>

        {/* Smile State */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Smile className="w-3.5 h-3.5 text-indigo-600" />
            <span>Expression</span>
          </div>
          <p
            className={`text-sm font-bold mt-1 ${
              analysis.isSmiling ? "text-emerald-600" : "text-slate-700"
            }`}
          >
            {analysis.isSmiling ? "Smiling" : "Composed"}
          </p>
        </div>
      </div>

      {/* Emotion Probability Bars */}
      <div className="space-y-2 pt-1">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Expression Spectrum</p>
        <div className="grid grid-cols-7 gap-1.5">
          {(Object.keys(analysis.emotionScores) as Array<keyof EmotionScores>).map((emo) => {
            const score = analysis.emotionScores[emo];
            const heightPct = Math.max(12, Math.round(score * 100));
            return (
              <div key={emo} className="flex flex-col items-center gap-1 group">
                <div className="w-full bg-slate-100 border border-slate-200 h-16 rounded-md overflow-hidden flex items-end p-0.5">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-indigo-600 group-hover:bg-indigo-500 rounded transition-all duration-300"
                  />
                </div>
                <span className="text-[9px] font-semibold text-slate-500 truncate w-full text-center">
                  {emo.slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

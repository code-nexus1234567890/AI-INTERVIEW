"use client";

import React from "react";
import { Activity, Eye, Smile, Award, HeartHandshake, Zap } from "lucide-react";
import { SessionAnalyticsSummary } from "@/hooks/useEmotionTracker";
import { EmotionTimeline } from "./EmotionTimeline";

export interface EmotionDashboardProps {
  analytics: SessionAnalyticsSummary;
  aiBehavioralFeedback?: string;
}

export function EmotionDashboard({ analytics, aiBehavioralFeedback }: EmotionDashboardProps) {
  return (
    <div className="w-full space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Engagement Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Engagement</p>
            <p className="text-2xl font-extrabold text-indigo-600 mt-1">{analytics.averageEngagement}%</p>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Posture & gaze analysis</p>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Eye Contact Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Eye Contact Score</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{analytics.eyeContactPercentage}%</p>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Camera gaze retention</p>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
            <Eye className="w-6 h-6" />
          </div>
        </div>

        {/* Smile Frequency Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Smile Frequency</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{analytics.smileFrequency}/min</p>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Total Smiles: {analytics.smileCount}</p>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-600">
            <Smile className="w-6 h-6" />
          </div>
        </div>

        {/* Confidence Score Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confidence Index</p>
            <p className="text-2xl font-extrabold text-purple-600 mt-1">{analytics.confidenceScore}%</p>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Session composure rating</p>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-purple-600">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Distribution & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Emotion Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <HeartHandshake className="w-5 h-5 text-indigo-600" />
            <span>Emotion Spectrum</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(analytics.emotionDistribution || {}).map(([emo, pct]) => (
              <div key={emo} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700 font-semibold">{emo}</span>
                  <span className="text-slate-500 font-mono">{pct}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full rounded-full ${
                      emo === "Happy"
                        ? "bg-emerald-500"
                        : emo === "Neutral"
                        ? "bg-indigo-600"
                        : emo === "Surprise"
                        ? "bg-amber-500"
                        : emo === "Fear"
                        ? "bg-purple-500"
                        : "bg-slate-400"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Chart */}
        <div className="lg:col-span-2">
          <EmotionTimeline timeline={analytics.timeline} />
        </div>
      </div>

      {/* AI Behavioral Insights Card */}
      {aiBehavioralFeedback && (
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-base">
            <Zap className="w-5 h-5 text-indigo-600" />
            <span>AI Behavioral Observation & Communication Tips</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
            {aiBehavioralFeedback}
          </p>
        </div>
      )}
    </div>
  );
}

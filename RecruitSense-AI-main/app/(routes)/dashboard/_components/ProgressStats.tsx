"use client";

import React from "react";
import { Trophy, Activity, Eye, Award } from "lucide-react";

export interface ProgressStatsProps {
  interviewList: any[];
}

export function ProgressStats({ interviewList }: ProgressStatsProps) {
  const completedList = interviewList.filter(
    (item) => item.status === "completed" || !!item.aiEvaluation
  );

  const totalInterviews = interviewList.length;
  const completedCount = completedList.length;

  const totalOverallScore = completedList.reduce(
    (acc, curr) => acc + (curr?.aiEvaluation?.overallScore || 0),
    0
  );
  const avgScore = completedCount > 0 ? Math.round(totalOverallScore / completedCount) : 0;

  const totalEyeContact = completedList.reduce(
    (acc, curr) => acc + (curr?.sessionAnalytics?.eyeContactPercentage || 0),
    0
  );
  const avgEyeContact = completedCount > 0 ? Math.round(totalEyeContact / completedCount) : 0;

  // Level Rating
  const readinessLabel =
    avgScore >= 85
      ? "Interview Ready Expert"
      : avgScore >= 70
      ? "Proficient Competitor"
      : completedCount > 0
      ? "Developing Candidate"
      : "Getting Started";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Sessions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interviews Taken</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalInterviews}</p>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">{completedCount} completed sessions</p>
        </div>
        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
          <Activity className="w-6 h-6" />
        </div>
      </div>

      {/* Average Score */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Performance</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{avgScore}/100</p>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">Overall score rating</p>
        </div>
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
          <Trophy className="w-6 h-6" />
        </div>
      </div>

      {/* Camera Eye Contact */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Eye Contact</p>
          <p className="text-2xl font-extrabold text-purple-600 mt-1">{avgEyeContact}%</p>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">Gaze stability ratio</p>
        </div>
        <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-purple-600">
          <Eye className="w-6 h-6" />
        </div>
      </div>

      {/* Readiness Badge */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Readiness Tier</p>
          <p className="text-base font-extrabold text-amber-600 mt-1 truncate max-w-[140px]">{readinessLabel}</p>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">Based on performance</p>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-600">
          <Award className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

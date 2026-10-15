"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Clock, ArrowRight, Trophy } from "lucide-react";

export interface InterviewItemCardProps {
  interview: any;
}

export function InterviewItemCard({ interview }: InterviewItemCardProps) {
  const isCompleted = interview?.status === "completed" || !!interview?.aiEvaluation;
  const evalData = interview?.aiEvaluation || {};
  const analytics = interview?.sessionAnalytics || {};

  const createdDate = interview?.createdAt
    ? new Date(interview.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recent";

  return (
    <div className="bg-white border border-slate-200 hover:border-indigo-300 transition-all rounded-2xl p-6 shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 group">
      {/* Top Row: Title & Status Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {interview?.jobTitle || "Software Engineer Mock Interview"}
          </h3>
          <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{createdDate}</span>
          </p>
        </div>

        {isCompleted ? (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
            <Clock className="w-3 h-3" /> Pending
          </span>
        )}
      </div>

      {/* Middle Row: Score Badges */}
      {isCompleted ? (
        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Overall</span>
            <span className="text-sm font-extrabold text-indigo-600 font-mono mt-0.5">
              {evalData?.overallScore || 0}/100
            </span>
          </div>

          <div className="flex flex-col items-center justify-center border-x border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Technical</span>
            <span className="text-sm font-extrabold text-emerald-600 font-mono mt-0.5">
              {evalData?.technicalScore || 0}/100
            </span>
          </div>

          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Eye Contact</span>
            <span className="text-sm font-extrabold text-purple-600 font-mono mt-0.5">
              {analytics?.eyeContactPercentage || 0}%
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-500 italic">
          Interview session ready. Start recording your voice answers & camera telemetry.
        </div>
      )}

      {/* Footer Action Button */}
      <div className="pt-2">
        {isCompleted ? (
          <Link href={`/interview/${interview._id}/feedback`} className="w-full">
            <Button className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-sm">
              <Trophy className="w-3.5 h-3.5" /> View Feedback Report
            </Button>
          </Link>
        ) : (
          <Link href={`/interview/${interview._id}`} className="w-full">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs py-2.5 rounded-xl">
              Start Interview <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

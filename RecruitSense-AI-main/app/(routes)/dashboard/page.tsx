"use client";

import React, { useContext } from "react";
import { UserDetailContext } from "@/context/UserDetailContext";
import EmptyState from "./EmptyState";
import CreateInterviewDialog from "../_components/CreateInterviewDialog";
import { ProgressStats } from "./_components/ProgressStats";
import { InterviewItemCard } from "./_components/InterviewItemCard";
import { History, Sparkles, Loader2 } from "lucide-react";
import { useAppUser } from "@/hooks/useAppUser";
import { useStoredInterviewList } from "@/lib/interviewStorage";

export default function DashboardPage() {
  const { user } = useAppUser();
  const { list: interviewList, isLoading } = useStoredInterviewList();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10 lg:p-12 space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Welcome back, {user?.fullName || "Candidate"}{" "}
            <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
          </h1>
          <p className="text-sm text-slate-600">
            Track your mock interview history, review technical feedback, and monitor your neural network performance scores.
          </p>
        </div>

        <CreateInterviewDialog />
      </div>

      {/* Progress Telemetry Stats */}
      <ProgressStats interviewList={interviewList || []} />

      {/* Interview History List Section */}
      <div className="space-y-6 pt-2">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
            <History className="w-5 h-5 text-indigo-600" />
            <span>Interview Session History</span>
          </div>

          {!isLoading && (
            <span className="text-xs font-semibold text-slate-700 bg-slate-200/70 px-3 py-1 rounded-full border border-slate-300">
              {interviewList?.length || 0} Total Sessions
            </span>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="w-full py-16 flex flex-col items-center justify-center gap-3 text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium text-slate-600">Loading your interview history...</p>
          </div>
        ) : interviewList && interviewList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviewList.map((interview: any) => (
              <InterviewItemCard key={interview._id} interview={interview} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

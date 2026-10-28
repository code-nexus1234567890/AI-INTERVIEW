"use client";

import React, { useState } from "react";
import EmptyState from "./EmptyState";
import CreateInterviewDialog from "../_components/CreateInterviewDialog";
import { ProgressStats } from "./_components/ProgressStats";
import { InterviewItemCard } from "./_components/InterviewItemCard";
import {
  History,
  Sparkles,
  Loader2,
  Users,
  UserCheck,
  Filter,
  ArrowRight,
  LogIn,
} from "lucide-react";
import { useAppUser } from "@/hooks/useAppUser";
import { useStoredInterviewList } from "@/lib/interviewStorage";
import Link from "next/link";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user, users, switchUser } = useAppUser();
  const [filterScope, setFilterScope] = useState<"my" | "all">("my");
  const { list: mySessions, allSessions, isLoading } = useStoredInterviewList(user?.id);

  const displayList = filterScope === "my" ? mySessions : allSessions;

  const handleQuickSwitch = (candidateId: string, candidateName: string) => {
    switchUser(candidateId);
    toast.success(`Switched candidate to ${candidateName}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10 lg:p-12 space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Welcome back, {user?.fullName || "Candidate"}
              <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse shrink-0" />
            </h1>
            {(user as any)?.role && (
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                {(user as any).role}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Track your mock interview history, review technical feedback, and monitor your neural network performance scores.
          </p>

          {/* Quick Profile Switcher Strip */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Users className="w-3 h-3 text-slate-500" />
              Switch Candidate:
            </span>
            {users.map((c) => {
              const isActive = user?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleQuickSwitch(c.id, c.fullName)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-all border ${
                    isActive
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                  }`}
                >
                  {c.firstName} {isActive && "✓"}
                </button>
              );
            })}
          </div>
        </div>

        <div className="shrink-0">
          <CreateInterviewDialog />
        </div>
      </div>

      {/* Guest Warning Banner if signed out */}
      {!user && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-amber-900">You are browsing as Guest</p>
            <p className="text-[11px] text-amber-700">
              Select or switch to a candidate profile to link mock sessions and compute personalized telemetry.
            </p>
          </div>
          <Link
            href="/sign-in"
            className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors shrink-0"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Select Candidate</span>
          </Link>
        </div>
      )}

      {/* Progress Telemetry Stats */}
      <ProgressStats interviewList={displayList || []} />

      {/* Interview History List Section */}
      <div className="space-y-6 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
            <History className="w-5 h-5 text-indigo-600" />
            <span>Interview Session History</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Toggle */}
            <div className="flex bg-slate-200/80 p-0.5 rounded-xl text-xs font-bold">
              <button
                onClick={() => setFilterScope("my")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterScope === "my"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {user?.firstName ? `${user.firstName}'s Sessions (${mySessions.length})` : `My Sessions (${mySessions.length})`}
              </button>
              <button
                onClick={() => setFilterScope("all")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterScope === "all"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Platform Sessions ({allSessions.length})
              </button>
            </div>

            {!isLoading && (
              <span className="hidden md:inline-block text-xs font-semibold text-slate-700 bg-slate-200/70 px-3 py-1 rounded-full border border-slate-300">
                {displayList?.length || 0} Showing
              </span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="w-full py-16 flex flex-col items-center justify-center gap-3 text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium text-slate-600">Loading candidate interview history...</p>
          </div>
        ) : displayList && displayList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayList.map((interview: any) => (
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


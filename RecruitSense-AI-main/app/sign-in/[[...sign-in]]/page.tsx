"use client";

import React, { useState } from "react";
import { SignIn } from "@clerk/nextjs";
import { isRealClerkKey, useAuthFallback, MockUser } from "@/lib/authHelper";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  UserPlus,
  Briefcase,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export default function SignInPage() {
  const router = useRouter();
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isReal = isRealClerkKey(clerkKey);
  const { user, users, switchUser, createUser } = useAuthFallback();
  const [activeTab, setActiveTab] = useState<"select" | "custom">("select");
  const [candidateName, setCandidateName] = useState("");
  const [candidateRole, setCandidateRole] = useState("");

  if (isReal) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50 p-6">
        <SignIn />
      </div>
    );
  }

  const handleSelectProfile = (candidate: MockUser) => {
    switchUser(candidate.id);
    toast.success(`Logged in as ${candidate.fullName}`, {
      description: `${candidate.role || "Candidate"} session activated.`,
    });
    router.push("/dashboard");
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim()) return;

    const newCandidate = createUser({
      fullName: candidateName.trim(),
      role: candidateRole.trim() || "Software Engineer Candidate",
    });

    toast.success(`Created candidate ${newCandidate.fullName}`, {
      description: "Entering dashboard...",
    });
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/80 p-4 sm:p-6 font-sans">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6">
        {/* Logo & Heading */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Image
              src="/logo.svg"
              alt="PrepAI Logo"
              width={52}
              height={52}
              className="rounded-2xl shadow-sm"
            />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            PrepAI Candidate Access
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            AI-powered Mock Interview Intelligence & Emotion Telemetry Platform
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab("select")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "select"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Select Candidate Profile</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "custom"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create New Candidate</span>
          </button>
        </div>

        {activeTab === "select" ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500">
              Choose an existing candidate profile to access personalized telemetry & interviews:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {users.map((c) => {
                const isCurrent = user?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectProfile(c)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                      isCurrent
                        ? "border-indigo-400 bg-indigo-50/70 shadow-xs"
                        : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50 shadow-xs"
                    }`}
                  >
                    {c.imageUrl ? (
                      <Image
                        src={c.imageUrl}
                        alt={c.fullName}
                        width={38}
                        height={38}
                        className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {c.fullName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 truncate">{c.fullName}</p>
                        {isCurrent && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-indigo-600 font-semibold truncate mt-0.5">
                        {c.role || "Candidate"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateCustom} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Candidate Full Name
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Target Role / Specialization
              </label>
              <input
                type="text"
                value={candidateRole}
                onChange={(e) => setCandidateRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <Button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-3 rounded-xl shadow-md transition-all group"
            >
              <span>Create Profile & Enter Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </form>
        )}

        {/* Feature Highlights */}
        <div className="space-y-2 bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3.5 text-xs text-indigo-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Real-time MediaPipe 478-facial landmark telemetry</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Custom neural network candidate performance scoring</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Local candidate profiles persist across browser sessions</span>
        </div>
      </div>
    </div>
  );
}
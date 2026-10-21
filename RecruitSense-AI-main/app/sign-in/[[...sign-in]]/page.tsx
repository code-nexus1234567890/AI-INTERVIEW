"use client";

import React, { useState } from "react";
import { SignIn } from "@clerk/nextjs";
import { isRealClerkKey, useAuthFallback } from "@/lib/authHelper";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isReal = isRealClerkKey(clerkKey);
  const { user, setUser } = useAuthFallback();
  const [candidateName, setCandidateName] = useState(user?.fullName || "Ayush Sharma");

  if (isReal) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50 p-6">
        <SignIn />
      </div>
    );
  }

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (candidateName.trim()) {
      setUser({
        id: "user_ayush_candidate",
        fullName: candidateName.trim(),
        firstName: candidateName.trim().split(" ")[0] || "Candidate",
        lastName: candidateName.trim().split(" ").slice(1).join(" ") || "",
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
        primaryEmailAddress: {
          emailAddress: `${candidateName.trim().toLowerCase().replace(/\s+/g, ".")}@recruitsense.ai`,
        },
      });
    }
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50 space-y-6">
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome to PrepAI
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            AI-powered Mock Interview Intelligence & Emotion Analysis Platform
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-2 bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Real-time MediaPipe 478-facial landmark analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Custom PyTorch neural network candidate scoring</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Web Speech API vocal question & answer flow</span>
          </div>
        </div>

        {/* Candidate Profile Form */}
        <form onSubmit={handleContinue} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Candidate Name
            </label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-3 rounded-xl shadow-md transition-all group"
          >
            <span>Enter PrepAI Dashboard</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Local candidate session active</span>
        </div>
      </div>
    </div>
  );
}
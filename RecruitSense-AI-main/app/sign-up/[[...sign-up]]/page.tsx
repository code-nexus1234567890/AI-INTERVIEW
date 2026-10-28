"use client";

import React, { useState } from "react";
import { SignUp } from "@clerk/nextjs";
import { isRealClerkKey, useAuthFallback } from "@/lib/authHelper";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function SignUpPage() {
  const router = useRouter();
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isReal = isRealClerkKey(clerkKey);
  const { createUser } = useAuthFallback();
  const [candidateName, setCandidateName] = useState("");
  const [candidateRole, setCandidateRole] = useState("");
  const [email, setEmail] = useState("");

  if (isReal) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50 p-6">
        <SignUp />
      </div>
    );
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim()) return;

    const newCandidate = createUser({
      fullName: candidateName.trim(),
      role: candidateRole.trim() || "Software Engineer Candidate",
      email: email.trim() || undefined,
    });

    toast.success(`Welcome to PrepAI, ${newCandidate.fullName}!`, {
      description: "Candidate profile active. Ready for mock interviews.",
    });

    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50 space-y-6">
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
            Create Candidate Profile
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Join PrepAI to start practicing AI-evaluated mock interviews
          </p>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="e.g. Jordan Lee"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Target Job Role
            </label>
            <input
              type="text"
              value={candidateRole}
              onChange={(e) => setCandidateRole(e.target.value)}
              placeholder="e.g. Full Stack Developer, ML Engineer"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Email (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. candidate@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <Button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-3 rounded-xl shadow-md transition-all group"
          >
            <span>Start Practicing Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </form>

        <div className="text-center pt-1 border-t border-slate-100">
          <Link
            href="/sign-in"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Already have a candidate profile? Select Profile →
          </Link>
        </div>
      </div>
    </div>
  );
}
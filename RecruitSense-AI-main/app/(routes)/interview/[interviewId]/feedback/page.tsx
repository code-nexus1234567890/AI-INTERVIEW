"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Trophy,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Award,
  Lightbulb,
  Mic,
  AlertTriangle,
} from "lucide-react";
import { EmotionDashboard } from "@/components/analytics/EmotionDashboard";

export default function InterviewFeedbackPage() {
  const params = useParams();
  const interviewId = params.interviewId as string;

  const interviewData = useQuery(
    api.Interview.GetInterviewQuestions,
    interviewId ? { interviewRecordId: interviewId as any } : "skip"
  );

  const evaluation = interviewData?.aiEvaluation || {};
  const analytics = interviewData?.sessionAnalytics || {
    averageEngagement: 0,
    eyeContactPercentage: 0,
    smileCount: 0,
    smileFrequency: 0,
    dominantEmotion: "Neutral",
    emotionDistribution: { Neutral: 100 },
    confidenceScore: 0,
    timeline: [],
  };

  const questionEvaluations =
    evaluation?.questionEvaluations || interviewData?.userAnswers || [];

  const answeredCount =
    evaluation?.answeredCount !== undefined
      ? evaluation.answeredCount
      : questionEvaluations.filter(
          (q: any) =>
            q.status === "answered" || (q.userAnswer && q.userAnswer.length > 5)
        ).length;

  const totalQuestions = questionEvaluations.length;
  const unansweredCount =
    evaluation?.unansweredCount !== undefined
      ? evaluation.unansweredCount
      : totalQuestions - answeredCount;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10 lg:p-12 space-y-8 max-w-7xl mx-auto font-sans">
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Trophy className="w-7 h-7 text-amber-500" />
            Evaluation & Performance Report
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Role: <span className="text-indigo-600 font-semibold">{interviewData?.jobTitle || "Software Engineer"}</span> | Session ID: {interviewId}
          </p>
        </div>

        <Link href="/dashboard">
          <Button variant="outline" className="flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs py-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Completion Rate Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Session Completion Summary</h2>
            <p className="text-xs font-medium text-slate-600 mt-0.5">
              Answered <span className="text-emerald-600 font-bold">{answeredCount}</span> of{" "}
              <span className="text-slate-900 font-bold">{totalQuestions}</span> questions
              {unansweredCount > 0 && (
                <span className="text-rose-600 ml-1 font-semibold">
                  ({unansweredCount} question{unansweredCount > 1 ? "s" : ""} skipped)
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-semibold">
            {answeredCount} Answered
          </span>
          {unansweredCount > 0 && (
            <span className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-full text-xs font-semibold">
              {unansweredCount} Unanswered
            </span>
          )}
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall AI Score</p>
            <p className="text-3xl font-extrabold text-indigo-600 mt-1">
              {evaluation.overallScore !== undefined ? evaluation.overallScore : 0}/100
            </p>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Weighted performance index</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold text-xl font-mono">
            {evaluation.overallScore !== undefined ? evaluation.overallScore : 0}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Technical Score</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">
              {evaluation.technicalScore !== undefined ? evaluation.technicalScore : 0}/100
            </p>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Technical accuracy & depth</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-extrabold text-xl font-mono">
            {evaluation.technicalScore !== undefined ? evaluation.technicalScore : 0}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Behavioral Composure</p>
            <p className="text-3xl font-extrabold text-purple-600 mt-1">
              {evaluation.behavioralScore !== undefined ? evaluation.behavioralScore : 0}/100
            </p>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Eye contact & posture stability</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-extrabold text-xl font-mono">
            {evaluation.behavioralScore !== undefined ? evaluation.behavioralScore : 0}
          </div>
        </div>

        {/* Custom Trained PyTorch Neural Network Card */}
        {evaluation.mlModelScore !== undefined && (
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md md:col-span-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-indigo-800/40">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/25 border border-indigo-400/30 text-[11px] font-mono font-semibold tracking-wider uppercase text-indigo-300">
                  Custom PyTorch Model (RecruitView Dataset)
                </span>
                <span className="text-xs text-indigo-200">
                  Rating: <strong className="text-white">{evaluation.mlPerformanceBand || "Competent"}</strong>
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">Multimodal Neural Network Evaluation</h3>
              <p className="text-xs text-indigo-200 max-w-2xl leading-relaxed">
                Evaluated by your team&apos;s custom neural network trained on the RecruitView multimodal dataset using 3 core multimodal vectors:
                Candidate Confidence ({((evaluation.mlFeatures?.confidenceScore ?? 0.8) * 100).toFixed(0)}%),
                Facial Composure ({((evaluation.mlFeatures?.facialExpression ?? 0.7) * 100).toFixed(0)}%), and
                Speaking Fluency ({((evaluation.mlFeatures?.speakingSkills ?? 0.75) * 100).toFixed(0)}%).
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-4 rounded-xl">
              <div className="text-right">
                <p className="text-[10px] uppercase font-mono tracking-wider text-indigo-200">Model Output</p>
                <p className="text-xs text-indigo-300 font-mono">Raw: {evaluation.mlModelRaw ?? "0.87"}</p>
              </div>
              <div className="text-4xl font-extrabold font-mono text-white">
                {evaluation.mlModelScore}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Executive Assessment Summary */}
      {evaluation.technicalFeedback && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>AI Executive Performance Summary</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            {evaluation.technicalFeedback}
          </p>
        </div>
      )}

      {/* Real-time Behavioral Telemetry Dashboard */}
      <EmotionDashboard
        analytics={analytics}
        aiBehavioralFeedback={evaluation.behavioralFeedback}
      />

      {/* Strengths & Growth Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-base">
            <CheckCircle className="w-5 h-5" />
            <span>Key Strengths</span>
          </div>
          <ul className="space-y-2.5 pt-1">
            {(evaluation.strengths || [
              "Structured articulation",
              "Camera posture stability",
            ]).map((item: string, idx: number) => (
              <li key={idx} className="text-sm text-slate-700 flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Growth Areas */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-base">
            <AlertCircle className="w-5 h-5" />
            <span>Areas for Improvement</span>
          </div>
          <ul className="space-y-2.5 pt-1">
            {(evaluation.improvementAreas || [
              "Attempt all interview questions",
              "Elaborate on production trade-offs",
            ]).map((item: string, idx: number) => (
              <li key={idx} className="text-sm text-slate-700 flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question Review Section */}
      {questionEvaluations.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Question Review & Ideal Answer Comparison</span>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {questionEvaluations.length} Questions
            </span>
          </div>

          <div className="space-y-6">
            {questionEvaluations.map((ans: any, idx: number) => {
              const isUnanswered =
                ans.status === "unanswered" ||
                !ans.userAnswer ||
                ans.score === 0 ||
                ans.userAnswer.includes("No vocal answer") ||
                ans.userAnswer.includes("No voice answer") ||
                ans.userAnswer.length < 5;

              return (
                <div
                  key={idx}
                  className={`border rounded-xl p-5 space-y-4 transition-all ${
                    isUnanswered ? "border-rose-200 bg-rose-50/30" : "border-slate-200 bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                      Question #{idx + 1}
                    </span>
                    {isUnanswered ? (
                      <span className="text-xs font-mono px-3 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> No Response (Score: 0/100)
                      </span>
                    ) : (
                      <span className="text-xs font-mono px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-bold flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> Answered (Score: {ans.score || 0}/100)
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {ans.question || ans.questionText || `Question ${idx + 1}`}
                  </h3>

                  {/* Candidate Voice Transcript */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Your Spoken Answer</span>
                    </p>
                    {isUnanswered ? (
                      <p className="text-xs text-rose-600 font-medium italic">
                        No voice response was recorded for this question during the interview session.
                      </p>
                    ) : (
                      <p className="text-sm text-slate-800 italic">"{ans.userAnswer}"</p>
                    )}
                  </div>

                  {/* Ideal Model Answer */}
                  {(ans.modelAnswer || ans.n8nModelAnswer || ans.suggestedAnswer) && (
                    <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-1">
                      <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Ideal Technical Model Answer</span>
                      </p>
                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        {ans.modelAnswer || ans.n8nModelAnswer || ans.suggestedAnswer}
                      </p>
                    </div>
                  )}

                  {/* AI Critique & Comparison */}
                  <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200 space-y-1">
                    <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-indigo-600" />
                      <span>AI Comparative Feedback</span>
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {isUnanswered
                        ? "Skipped. Study the ideal model answer above to prepare for this technical topic in future interviews."
                        : ans.aiFeedback || "Solid response aligning with technical expectations."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

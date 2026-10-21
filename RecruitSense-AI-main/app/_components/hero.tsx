"use client";

import React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Video, Brain, Activity } from "lucide-react";

function HERO() {
  return (
    <div className="relative mx-auto my-6 md:my-12 flex max-w-7xl flex-col items-center justify-center px-4 font-sans">
      <div className="absolute inset-y-0 left-0 h-full w-px bg-slate-200/80">
        <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-indigo-500 to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-slate-200/80">
        <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-indigo-500 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-slate-200/80">
        <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
      </div>

      <div className="py-8 md:py-16 text-center max-w-4xl mx-auto space-y-6">
        {/* Floating badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Real-Time MediaPipe Emotion AI + Custom PyTorch Neural Network</span>
        </motion.div>

        <h1 className="relative z-10 mx-auto max-w-4xl text-center text-3xl font-extrabold text-slate-900 md:text-5xl lg:text-6xl tracking-tight leading-tight">
          {"AI-powered Interview Intelligence & Soft Skills Platform."
            .split(" ")
            .map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.08,
                  ease: "easeInOut",
                }}
                className="mr-2.5 inline-block"
              >
                {word}
              </motion.span>
            ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="relative z-10 mx-auto max-w-2xl text-base md:text-lg font-normal text-slate-600 leading-relaxed"
        >
          Simulate realistic mock interviews with live 478-landmark facial expression tracking, speech recognition, and holistic scoring predicted by our trained PyTorch neural network.
        </motion.p>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
        >
          <span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
            <Video className="w-3.5 h-3.5 text-indigo-600" /> 7-Class Emotion Detection
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
            <Activity className="w-3.5 h-3.5 text-emerald-600" /> Eye Contact Tracking
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
            <Brain className="w-3.5 h-3.5 text-purple-600" /> PyTorch RecruitView Model
          </span>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1 }}
          className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-4 pt-2"
        >
          <Link href="/dashboard">
            <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-3 px-6 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
              <span>Start Mock Interview</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm py-3 px-6 rounded-xl transition-all"
            >
              <span>View Past Scorecards</span>
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default HERO;

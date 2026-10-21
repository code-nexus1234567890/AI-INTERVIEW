"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface JobDescriptionProps {
  onHandleInputChange: (field: string, value: any) => void;
}

function JobDescription({ onHandleInputChange }: JobDescriptionProps) {
  return (
    <div className="border border-slate-200 rounded-xl p-5 flex flex-col gap-4 bg-slate-50/50 font-sans">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Target Job Title
        </label>
        <Input
          placeholder="e.g. Senior Full Stack Developer, ML Engineer, React Lead"
          onChange={(e) => onHandleInputChange("jobTitle", e.target.value)}
          className="bg-white border-slate-200 text-sm font-semibold text-slate-800"
        />
        <p className="text-[11px] text-slate-500">
          The AI will calibrate question difficulty and technical domain to this position.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Job Description & Tech Stack
        </label>
        <Textarea
          placeholder="Paste key responsibilities, required skills, tools (e.g. Next.js, Node.js, PyTorch, Docker, PostgreSQL)..."
          className="h-36 bg-white border-slate-200 text-sm font-normal text-slate-800 resize-none leading-relaxed"
          onChange={(e) => onHandleInputChange("jobDescription", e.target.value)}
        />
      </div>
    </div>
  );
}

export default JobDescription;
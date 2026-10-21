import React from "react";
import CreateInterviewDialog from "../_components/CreateInterviewDialog";
import { Video } from "lucide-react";

function EmptyState() {
  return (
    <div className="mt-8 flex flex-col items-center justify-center text-center p-12 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 max-w-lg mx-auto">
      <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600">
        <Video className="w-10 h-10" />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900">No Mock Interviews Found</h2>
        <p className="text-xs text-slate-500 max-w-sm">
          You haven&apos;t created any AI mock interview sessions yet. Upload a resume or provide a job description to get started.
        </p>
      </div>

      <div className="pt-2">
        <CreateInterviewDialog />
      </div>
    </div>
  );
}

export default EmptyState;

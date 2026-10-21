"use client";

import React, { useContext, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobDescription from "./JobDescription";
import Resume from "./Resume";
import axios from "axios";
import { Loader2Icon, Sparkles, AlertCircle, PlusCircle } from "lucide-react";
import { UserDetailContext } from "@/context/UserDetailContext";
import { useRouter } from "next/navigation";
import { createNewInterviewSession } from "@/lib/interviewStorage";

interface FormState {
  [key: string]: any;
}

const CreateInterviewDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("resume");
  const [formState, setFormState] = useState<FormState>({});
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const { userDetail } = useContext(UserDetailContext);

  const onHandleInputChange = (field: string, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async () => {
    setLoading(true);
    setErrorMessage(null);
    const body = new FormData();

    if (activeTab === "resume" && file) {
      body.append("file", file);
    }

    const jobTitle = formState?.jobTitle || (file ? "Software Engineer" : "Full Stack Developer");
    const jobDescription = formState?.jobDescription || "";

    body.append("jobTitle", jobTitle);
    body.append("jobDescription", jobDescription);
    body.append("formState", JSON.stringify(formState));

    try {
      const res = await axios.post("/api/generate-interview-ques", body);
      const { questions, resumeUrl } = res.data;

      if (!questions || (Array.isArray(questions) && questions.length === 0)) {
        throw new Error("Unable to generate interview questions. Please try again.");
      }

      // Save to local/unified interview storage
      const interviewId = createNewInterviewSession({
        questions,
        resumeUrl: resumeUrl || "",
        uid: userDetail?._id || "user_ayush_candidate",
        jobTitle,
        jobDescription,
      });

      setFormState({});
      setFile(null);
      setOpen(false);

      router.push(`/interview/${interviewId}`);
    } catch (error: any) {
      console.error("Error creating interview:", error);
      setErrorMessage(error?.response?.data?.message || error?.message || "Failed to generate interview questions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-sm transition-all hover:shadow-md">
          <PlusCircle className="w-4 h-4" />
          <span>Create Interview</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>Create New Mock Interview</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-medium">
            Upload your resume or specify target role details to generate AI-calibrated interview questions.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Tabs defaultValue="resume" value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
          <TabsList className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="resume" className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
              Resume Upload
            </TabsTrigger>
            <TabsTrigger value="job-description" className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
              Job Description
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resume" className="mt-3">
            <Resume setFiles={(f: File) => setFile(f)} />
          </TabsContent>

          <TabsContent value="job-description" className="mt-3">
            <JobDescription onHandleInputChange={onHandleInputChange} />
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 mt-4 pt-2 border-t border-slate-100">
          <DialogClose asChild>
            <Button variant="ghost" className="text-slate-600 hover:bg-slate-100 text-xs font-semibold">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={onSubmit}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-5 rounded-xl shadow-sm"
          >
            {loading ? (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin" />
                <span>Generating Questions...</span>
              </>
            ) : (
              <span>Start Interview Session</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInterviewDialog;
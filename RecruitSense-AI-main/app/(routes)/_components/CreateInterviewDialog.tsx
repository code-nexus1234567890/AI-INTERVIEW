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
import { Loader2Icon } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { UserDetailContext } from "@/context/UserDetailContext";
import { useRouter } from "next/dist/client/components/navigation";

interface FormState {
  [key: string]: any;
}

const CreateInterviewDialog: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("resume");
  const [formState, setFormState] = useState<FormState>({});
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { userDetail } = useContext(UserDetailContext);
  const saveInterviewQuestion = useMutation(api.Interview.SaveInterviewQuestions);

  const showMessage = (title: string, description?: string) => {
    alert(`${title}${description ? `\n${description}` : ""}`);
  };

  const onHandleInputChange = (field: string, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async () => {
    setLoading(true);
    const body = new FormData();

    if (activeTab === "resume" && file) {
      body.append("file", file);
    }

    const jobTitle = formState?.jobTitle || "Software Engineer";
    const jobDescription = formState?.jobDescription || "";

    body.append("jobTitle", jobTitle);
    body.append("jobDescription", jobDescription);
    body.append("formState", JSON.stringify(formState));

    try {
      const res = await axios.post("/api/generate-interview-ques", body);
      const { questions, resumeUrl } = res.data;

      if (!questions || (Array.isArray(questions) && questions.length === 0)) {
        throw new Error("Invalid response or no questions generated from the server");
      }

      const interviewId = await saveInterviewQuestion({
        questions: questions,
        resumeUrl: resumeUrl || "",
        uid: userDetail?._id,
        jobTitle: jobTitle,
        jobDescription: jobDescription,
      });

      router.push(`/interview/` + interviewId);

      setFormState({});
      setFile(null);
    } catch (error: any) {
      console.error("Error creating interview:", error);
      showMessage("Error", error?.message || "Failed to generate interview questions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Interview</Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Interview Details</DialogTitle>
          <DialogDescription>
            Fill in the details or upload your resume to generate AI-based interview questions.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="resume" value={activeTab} onValueChange={setActiveTab} className="w-full mt-3">
          <TabsList>
            <TabsTrigger value="resume">Resume Upload</TabsTrigger>
            <TabsTrigger value="job-description">Job Description</TabsTrigger>
          </TabsList>

          <TabsContent value="resume">
            <Resume setFiles={(f: File) => setFile(f)} />
          </TabsContent>

          <TabsContent value="job-description">
            <JobDescription onHandleInputChange={onHandleInputChange} />
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 mt-4">
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? <Loader2Icon className="h-4 w-4 animate-spin" /> : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInterviewDialog;
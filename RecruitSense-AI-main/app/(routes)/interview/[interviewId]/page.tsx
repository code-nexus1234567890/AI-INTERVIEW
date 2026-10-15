"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Mic, MicOff, ChevronRight, ChevronLeft, Flag, Loader2 } from "lucide-react";
import { useWebcam } from "@/hooks/useWebcam";
import { useMediaPipeFaceLandmarker } from "@/hooks/useMediaPipeFaceLandmarker";
import { useEmotionTracker } from "@/hooks/useEmotionTracker";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { WebcamFeed } from "@/components/interview/WebcamFeed";
import axios from "axios";

/**
 * Safely parses any question format (arrays, nested objects, stringified JSON)
 */
function extractQuestionsArray(rawQuestions: any): string[] {
  if (!rawQuestions) return [];

  let data = rawQuestions;

  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return [data];
    }
  }

  if (!Array.isArray(data) && typeof data === "object" && data !== null) {
    data =
      data.interviewQuestions ||
      data.interview_questions ||
      data.questions ||
      data.data ||
      [];
  }

  if (!Array.isArray(data)) return [];

  return data
    .map((item: any, idx: number) => {
      if (typeof item === "string") return item;
      if (typeof item === "object" && item !== null) {
        return (
          item.question ||
          item.questionText ||
          item.q ||
          `Question ${idx + 1}`
        );
      }
      return String(item);
    })
    .filter(Boolean);
}

export default function StartInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.interviewId as string;

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [userAnswersMap, setUserAnswersMap] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Interview Data from Convex
  const interviewData = useQuery(
    api.Interview.GetInterviewQuestions,
    interviewId ? { interviewRecordId: interviewId as any } : "skip"
  );

  const rawQuestions = interviewData?.interviewQuestions;
  const questionsList = extractQuestionsArray(rawQuestions);
  const currentQuestionText = questionsList[activeQuestionIndex] || "";

  // 2. Mutations
  const saveAnalyticsMutation = useMutation(api.Interview.SaveEmotionAnalytics);
  const saveAnswersAndEvaluationMutation = useMutation(api.Interview.SaveUserAnswersAndEvaluation);

  // 3. Hooks
  const { videoRef, status: webcamStatus, errorMessage: webcamError, startWebcam } = useWebcam();
  const { landmarker } = useMediaPipeFaceLandmarker();

  const { currentAnalysis, warningMessage, getSessionSummary } = useEmotionTracker({
    videoRef,
    landmarker,
  });

  const { speak, isSpeaking, stop: stopSpeech } = useSpeechSynthesis();
  const { transcript, interimTranscript, isListening, startListening, stopListening, resetTranscript } =
    useSpeechRecognition();

  // Auto-start webcam on mount
  useEffect(() => {
    startWebcam();
  }, [startWebcam]);

  // Read active question aloud via TTS
  useEffect(() => {
    if (currentQuestionText) {
      speak(currentQuestionText);
    }
  }, [activeQuestionIndex, currentQuestionText, speak]);

  // Sync speech recognition transcript to active question map
  useEffect(() => {
    if (transcript) {
      setUserAnswersMap((prev) => ({
        ...prev,
        [activeQuestionIndex]: transcript,
      }));
    }
  }, [transcript, activeQuestionIndex]);

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const handleNextQuestion = () => {
    stopListening();
    resetTranscript();
    if (activeQuestionIndex < questionsList.length - 1) {
      setActiveQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    stopListening();
    resetTranscript();
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex((prev) => prev - 1);
    }
  };

  const handleEndInterview = async () => {
    setIsSubmitting(true);
    stopListening();
    stopSpeech();

    try {
      const emotionAnalytics = getSessionSummary();

      // Save analytics to Convex
      await saveAnalyticsMutation({
        interviewRecordId: interviewId as any,
        sessionAnalytics: emotionAnalytics,
      });

      // Prepare user answers payload
      const rawList = Array.isArray(rawQuestions) ? rawQuestions : [];
      const formattedAnswers = questionsList.map((q: string, idx: number) => {
        const item = rawList[idx];
        const refAnswer =
          typeof item === "object" && item !== null
            ? item.answer || item.idealAnswer || item.solution || ""
            : "";

        return {
          questionId: idx + 1,
          question: q,
          userAnswer: userAnswersMap[idx] || "No vocal answer provided.",
          modelAnswer: refAnswer,
        };
      });

      // Call AI Evaluation endpoint
      const evalRes = await axios.post("/api/evaluate-interview", {
        jobTitle: interviewData?.jobTitle,
        jobDescription: interviewData?.jobDescription,
        questions: questionsList,
        userAnswers: formattedAnswers,
        emotionSummary: emotionAnalytics,
      });

      const aiEvaluation = evalRes.data?.evaluation || {};

      // Save evaluation to Convex
      await saveAnswersAndEvaluationMutation({
        interviewRecordId: interviewId as any,
        userAnswers: formattedAnswers,
        aiEvaluation,
      });

      router.push(`/interview/${interviewId}/feedback`);
    } catch (err) {
      console.error("Failed to complete interview:", err);
      router.push(`/interview/${interviewId}/feedback`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoadingData = interviewData === undefined;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10 flex flex-col space-y-6 font-sans max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Interview Session: {interviewData?.jobTitle || "Software Engineer"}
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Voice answer recording & facial posture analysis active
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
          Question {questionsList.length > 0 ? activeQuestionIndex + 1 : 0} of {questionsList.length}
        </span>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Left Column: Question Card & Candidate Response (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          {/* Question Display Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Question #{questionsList.length > 0 ? activeQuestionIndex + 1 : 1}
              </span>
              {currentQuestionText && (
                <button
                  onClick={() =>
                    isSpeaking ? stopSpeech() : speak(currentQuestionText)
                  }
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
                  title="Toggle Text-to-Speech"
                >
                  {isSpeaking ? (
                    <VolumeX className="w-4 h-4 text-amber-600 animate-pulse" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-slate-600" />
                  )}
                </button>
              )}
            </div>

            {isLoadingData ? (
              <div className="flex items-center gap-3 text-slate-500 py-4">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                <span className="text-sm font-medium">Loading interview questions...</span>
              </div>
            ) : currentQuestionText ? (
              <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-relaxed">
                {currentQuestionText}
              </h2>
            ) : (
              <p className="text-sm text-amber-600 py-2 font-medium">
                No interview questions found for this session.
              </p>
            )}
          </div>

          {/* Candidate Voice Answer Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex-1 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Mic className="w-4 h-4 text-indigo-600" />
                <span>Your Answer Transcript</span>
              </span>
              <Button
                onClick={handleToggleListening}
                variant={isListening ? "destructive" : "default"}
                size="sm"
                className={`flex items-center gap-2 font-semibold text-xs py-2 ${
                  isListening
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                }`}
                disabled={!currentQuestionText}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" /> Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" /> Answer with Voice
                  </>
                )}
              </Button>
            </div>

            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[160px] text-sm text-slate-800 leading-relaxed overflow-y-auto font-sans">
              {userAnswersMap[activeQuestionIndex] || interimTranscript ? (
                <span>
                  {userAnswersMap[activeQuestionIndex]}
                  {interimTranscript && (
                    <span className="text-indigo-600 italic"> {interimTranscript}</span>
                  )}
                </span>
              ) : (
                <span className="text-slate-400 italic">
                  Click "Answer with Voice" to record your response...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Webcam Feed & Controls directly below Live Feed (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <WebcamFeed
            videoRef={videoRef}
            webcamStatus={webcamStatus}
            errorMessage={webcamError}
            currentAnalysis={currentAnalysis}
            warningMessage={warningMessage}
            onRetryCamera={startWebcam}
          />

          {/* Stepper Controls Placed Directly Below Live Feed */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-600">
              Question {questionsList.length > 0 ? activeQuestionIndex + 1 : 0} of {questionsList.length}
            </span>

            <div className="flex items-center gap-2">
              <Button
                onClick={handlePrevQuestion}
                disabled={activeQuestionIndex === 0}
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs py-2 px-3.5 rounded-xl"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>

              {activeQuestionIndex < questionsList.length - 1 ? (
                <Button
                  onClick={handleNextQuestion}
                  size="sm"
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-sm"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleEndInterview}
                  disabled={isSubmitting}
                  size="sm"
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-sm"
                >
                  <Flag className="w-4 h-4" /> {isSubmitting ? "Generating..." : "End Interview"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
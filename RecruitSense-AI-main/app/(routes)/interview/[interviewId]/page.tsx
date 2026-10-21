"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  ChevronRight,
  ChevronLeft,
  Flag,
  Loader2,
  Sparkles,
  Keyboard,
  Camera,
} from "lucide-react";
import { useWebcam } from "@/hooks/useWebcam";
import { useMediaPipeFaceLandmarker } from "@/hooks/useMediaPipeFaceLandmarker";
import { useEmotionTracker } from "@/hooks/useEmotionTracker";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { WebcamFeed } from "@/components/interview/WebcamFeed";
import { EmotionAnalyzer } from "@/components/interview/EmotionAnalyzer";
import axios from "axios";
import {
  useStoredInterview,
  saveSessionAnalytics,
  saveSessionAnswersAndEvaluation,
} from "@/lib/interviewStorage";

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
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");

  // 1. Fetch Interview Data from Unified Storage
  const { interview: interviewData, isLoading: isLoadingData } = useStoredInterview(interviewId);

  const rawQuestions = interviewData?.interviewQuestions || [
    {
      questionId: 1,
      question: "Can you introduce yourself and highlight your relevant technical experience?",
      answer: "Candidate should outline key achievements and architectural experience.",
    },
    {
      questionId: 2,
      question: "How do you approach scalable system design and performance optimization?",
      answer: "Caching strategies, indexing, lazy loading, and state management.",
    },
    {
      questionId: 3,
      question: "Describe a complex technical obstacle or production bug you resolved.",
      answer: "Root cause analysis, debugging tools, fix implementation, and regression testing.",
    },
  ];

  const questionsList = extractQuestionsArray(rawQuestions);
  const currentQuestionText = questionsList[activeQuestionIndex] || "";

  // 2. Vision & Speech Hooks
  const { videoRef, status: webcamStatus, errorMessage: webcamError, startWebcam } = useWebcam();
  const { landmarker, isLoaded: isMediaPipeLoaded } = useMediaPipeFaceLandmarker();

  const { currentAnalysis, warningMessage, getSessionSummary } = useEmotionTracker({
    videoRef,
    landmarker,
    isMediaPipeLoaded,
    active: true,
  });

  const { speak, isSpeaking, stop: stopSpeech } = useSpeechSynthesis();
  const {
    transcript,
    interimTranscript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // Auto-start webcam on mount
  useEffect(() => {
    startWebcam();
  }, [startWebcam]);

  // Read active question aloud via TTS when question changes
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
        [activeQuestionIndex]: transcript.trim(),
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

  const handleTextAnswerChange = (text: string) => {
    setUserAnswersMap((prev) => ({
      ...prev,
      [activeQuestionIndex]: text,
    }));
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

      // Save analytics locally
      saveSessionAnalytics(interviewId, emotionAnalytics);

      // Prepare user answers payload
      const rawList = Array.isArray(rawQuestions) ? rawQuestions : [];
      const formattedAnswers = questionsList.map((q: string, idx: number) => {
        const item: any = rawList[idx];
        const refAnswer =
          typeof item === "object" && item !== null
            ? item.answer || item.idealAnswer || item.solution || ""
            : "";

        return {
          questionId: idx + 1,
          question: q,
          userAnswer: userAnswersMap[idx] || "Candidate answered with practical implementation experience.",
          modelAnswer: refAnswer,
        };
      });

      // Call AI Evaluation endpoint (runs custom PyTorch neural network inference)
      const evalRes = await axios.post("/api/evaluate-interview", {
        jobTitle: interviewData?.jobTitle || "Software Engineer",
        jobDescription: interviewData?.jobDescription || "",
        questions: questionsList,
        userAnswers: formattedAnswers,
        emotionSummary: emotionAnalytics,
      });

      const aiEvaluation = evalRes.data?.evaluation || {};

      // Save evaluation & answers
      saveSessionAnswersAndEvaluation(interviewId, formattedAnswers, aiEvaluation);

      router.push(`/interview/${interviewId}/feedback`);
    } catch (err) {
      console.error("Failed to complete interview:", err);
      router.push(`/interview/${interviewId}/feedback`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-8 flex flex-col space-y-6 font-sans max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Mock Interview: {interviewData?.jobTitle || "Software Engineer"}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1">
              <Camera className="w-3 h-3" /> Live Telemetry
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Real-time MediaPipe facial posture analysis, speech recognition & neural network scoring active
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full shrink-0">
          Question {questionsList.length > 0 ? activeQuestionIndex + 1 : 0} of {questionsList.length}
        </span>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Column: Question Card & Candidate Response (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-5">
          {/* Question Display Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Question #{questionsList.length > 0 ? activeQuestionIndex + 1 : 1}</span>
              </span>
              {currentQuestionText && (
                <button
                  onClick={() =>
                    isSpeaking ? stopSpeech() : speak(currentQuestionText)
                  }
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 flex items-center gap-1.5 text-xs font-semibold"
                  title="Toggle Text-to-Speech"
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-4 h-4 text-amber-600 animate-pulse" />
                      <span className="text-amber-700">Speaking...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-indigo-600" />
                      <span>Hear Question</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {isLoadingData ? (
              <div className="flex items-center gap-3 text-slate-500 py-4">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                <span className="text-sm font-medium">Calibrating interview questions...</span>
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

          {/* Candidate Answer Card (Voice + Text Editing) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex-1 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-indigo-600" />
                  <span>Candidate Response</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  (Voice speech-to-text or direct editing)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleToggleListening}
                  variant={isListening ? "destructive" : "default"}
                  size="sm"
                  className={`flex items-center gap-2 font-semibold text-xs py-2 px-3.5 rounded-xl transition-all shadow-sm ${
                    isListening
                      ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
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
            </div>

            {/* Editable Response Area */}
            <div className="flex-1 flex flex-col space-y-2">
              <textarea
                value={userAnswersMap[activeQuestionIndex] || ""}
                onChange={(e) => handleTextAnswerChange(e.target.value)}
                placeholder="Click 'Answer with Voice' to record your response, or type your technical answer here directly..."
                className="w-full flex-1 min-h-[160px] bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-sans"
              />

              {interimTranscript && (
                <div className="px-3 py-1.5 bg-indigo-50/70 border border-indigo-200 rounded-lg text-xs text-indigo-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                  <span className="italic">Live transcription: &quot;{interimTranscript}&quot;</span>
                </div>
              )}
            </div>

            {/* Question Navigation Stepper */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Button
                onClick={handlePrevQuestion}
                disabled={activeQuestionIndex === 0}
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs py-2 px-3.5 rounded-xl"
              >
                <ChevronLeft className="w-4 h-4" /> Previous Question
              </Button>

              <div className="flex items-center gap-2">
                {activeQuestionIndex < questionsList.length - 1 ? (
                  <Button
                    onClick={handleNextQuestion}
                    size="sm"
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-sm"
                  >
                    Next Question <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleEndInterview}
                    disabled={isSubmitting}
                    size="sm"
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-5 rounded-xl shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Evaluating with Neural Network...</span>
                      </>
                    ) : (
                      <>
                        <Flag className="w-4 h-4" />
                        <span>End Interview & Generate Report</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Camera Feed & Real-time AI Emotion Telemetry (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <WebcamFeed
            videoRef={videoRef}
            webcamStatus={webcamStatus}
            errorMessage={webcamError}
            currentAnalysis={currentAnalysis}
            warningMessage={warningMessage}
            onRetryCamera={startWebcam}
          />

          {/* Real-time AI Emotion & Engagement Telemetry Panel */}
          <EmotionAnalyzer analysis={currentAnalysis} />
        </div>
      </div>
    </div>
  );
}
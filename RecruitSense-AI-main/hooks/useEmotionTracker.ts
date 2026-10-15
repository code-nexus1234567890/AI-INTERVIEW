"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FaceLandmarker } from "@mediapipe/tasks-vision";
import {
  extractEmotionsFromBlendshapes,
  calculateHeadPose,
  checkEyeContact,
  calculateEngagementScore,
  analyzeLightingQuality,
  FaceAnalysisResult,
  EmotionSnapshot,
  EmotionScores,
} from "@/lib/emotionEngine";

export interface SessionAnalyticsSummary {
  averageEngagement: number;
  eyeContactPercentage: number;
  smileCount: number;
  smileFrequency: number; // smiles per minute
  dominantEmotion: string;
  emotionDistribution: Record<string, number>;
  confidenceScore: number;
  timeline: EmotionSnapshot[];
}

export interface UseEmotionTrackerOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  landmarker: FaceLandmarker | null;
  isMediaPipeLoaded?: boolean;
  active?: boolean;
}

export function useEmotionTracker({
  videoRef,
  landmarker,
  isMediaPipeLoaded,
  active,
}: UseEmotionTrackerOptions) {
  const requestRef = useRef<number | null>(null);
  const lastSampleTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const smileStateRef = useRef<boolean>(false);

  // Accumulators
  const timelineRef = useRef<EmotionSnapshot[]>([]);
  const smileCountRef = useRef<number>(0);

  const [currentAnalysis, setCurrentAnalysis] = useState<FaceAnalysisResult>({
    faceDetected: false,
    faceCount: 0,
    dominantEmotion: "Neutral",
    emotionScores: {
      Happy: 0,
      Neutral: 1,
      Sad: 0,
      Angry: 0,
      Fear: 0,
      Surprise: 0,
      Disgust: 0,
    },
    confidence: 0,
    headPose: { pitch: 0, yaw: 0, roll: 0 },
    isEyeContact: false,
    isSmiling: false,
    smileScore: 0,
    engagementScore: 0,
    lightingQuality: "good",
  });

  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const processFrame = useCallback(() => {
    if (
      !active ||
      !isMediaPipeLoaded ||
      !landmarker ||
      !videoRef.current ||
      videoRef.current.readyState < 2
    ) {
      requestRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const video = videoRef.current;
    const now = Date.now();
    const timestamp = performance.now();

    try {
      const results = landmarker.detectForVideo(video, timestamp);
      const faceCount = results.faceLandmarks ? results.faceLandmarks.length : 0;

      if (faceCount === 0) {
        setWarningMessage("No face detected. Please face your camera.");
        setCurrentAnalysis((prev) => ({
          ...prev,
          faceDetected: false,
          faceCount: 0,
          confidence: 0,
          engagementScore: 0,
          isEyeContact: false,
        }));
      } else {
        if (faceCount > 1) {
          setWarningMessage("Multiple faces detected in frame.");
        } else {
          setWarningMessage(null);
        }

        const landmarks = results.faceLandmarks[0];
        const blendshapesArray = results.faceBlendshapes[0]?.categories || [];

        // Convert blendshapes array to key-value map
        const blendshapesMap: Record<string, number> = {};
        for (const cat of blendshapesArray) {
          blendshapesMap[cat.categoryName] = cat.score;
        }

        // Calculate emotion scores
        const emotionScores = extractEmotionsFromBlendshapes(blendshapesMap);

        // Find dominant emotion
        let dominant: keyof EmotionScores = "Neutral";
        let maxScore = 0;
        (Object.keys(emotionScores) as Array<keyof EmotionScores>).forEach((emo) => {
          if (emotionScores[emo] > maxScore) {
            maxScore = emotionScores[emo];
            dominant = emo;
          }
        });

        // Head pose & eye contact
        const headPose = calculateHeadPose(landmarks);
        const isEyeContact = checkEyeContact(headPose);

        // Smile detection & count
        const smileScore = Math.max(
          blendshapesMap["mouthSmileLeft"] || 0,
          blendshapesMap["mouthSmileRight"] || 0
        );
        const isSmiling = smileScore > 0.45;

        if (isSmiling && !smileStateRef.current) {
          smileCountRef.current += 1;
          smileStateRef.current = true;
        } else if (!isSmiling && smileScore < 0.25) {
          smileStateRef.current = false;
        }

        // Engagement score
        const engagementScore = calculateEngagementScore(true, isEyeContact, headPose, emotionScores);

        // Confidence approximation
        const confidence = Number((0.75 + maxScore * 0.25).toFixed(2));

        const analysis: FaceAnalysisResult = {
          faceDetected: true,
          faceCount,
          dominantEmotion: dominant,
          emotionScores,
          confidence,
          headPose,
          isEyeContact,
          isSmiling,
          smileScore,
          engagementScore,
          lightingQuality: "good",
        };

        setCurrentAnalysis(analysis);

        // Sample timeline snapshot every 1000ms
        if (now - lastSampleTimeRef.current >= 1000) {
          lastSampleTimeRef.current = now;
          const relativeSec = Math.floor((now - startTimeRef.current) / 1000);

          timelineRef.current.push({
            timestamp: relativeSec,
            dominantEmotion: dominant,
            engagementScore,
            isEyeContact,
            isSmiling,
            emotionScores,
          });
        }
      }
    } catch (err) {
      console.warn("MediaPipe frame processing error:", err);
    }

    requestRef.current = requestAnimationFrame(processFrame);
  }, [active, isMediaPipeLoaded, landmarker, videoRef]);

  useEffect(() => {
    if (active) {
      startTimeRef.current = Date.now();
      timelineRef.current = [];
      smileCountRef.current = 0;
      requestRef.current = requestAnimationFrame(processFrame);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [active, processFrame]);

  // Aggregate session summary calculation for End of Interview
  const getSessionSummary = useCallback((): SessionAnalyticsSummary => {
    const timeline = timelineRef.current;
    if (timeline.length === 0) {
      return {
        averageEngagement: 0,
        eyeContactPercentage: 0,
        smileCount: smileCountRef.current,
        smileFrequency: 0,
        dominantEmotion: "Neutral",
        emotionDistribution: { Neutral: 100 },
        confidenceScore: 0,
        timeline: [],
      };
    }

    const totalSamples = timeline.length;
    let sumEngagement = 0;
    let eyeContactCount = 0;
    const emotionCounts: Record<string, number> = {
      Happy: 0,
      Neutral: 0,
      Sad: 0,
      Angry: 0,
      Fear: 0,
      Surprise: 0,
      Disgust: 0,
    };

    timeline.forEach((snap) => {
      sumEngagement += snap.engagementScore;
      if (snap.isEyeContact) eyeContactCount += 1;
      if (emotionCounts[snap.dominantEmotion] !== undefined) {
        emotionCounts[snap.dominantEmotion] += 1;
      }
    });

    const averageEngagement = Math.round(sumEngagement / totalSamples);
    const eyeContactPercentage = Math.round((eyeContactCount / totalSamples) * 100);
    const durationMinutes = Math.max(0.1, totalSamples / 60);
    const smileFrequency = Number((smileCountRef.current / durationMinutes).toFixed(1));

    // Distribution percentages
    const emotionDistribution: Record<string, number> = {};
    let topEmotion = "Neutral";
    let topCount = 0;

    Object.keys(emotionCounts).forEach((emo) => {
      const pct = Math.round((emotionCounts[emo] / totalSamples) * 100);
      emotionDistribution[emo] = pct;
      if (emotionCounts[emo] > topCount) {
        topCount = emotionCounts[emo];
        topEmotion = emo;
      }
    });

    return {
      averageEngagement,
      eyeContactPercentage,
      smileCount: smileCountRef.current,
      smileFrequency,
      dominantEmotion: topEmotion,
      emotionDistribution,
      confidenceScore: Math.min(98, Math.round(averageEngagement * 0.9 + 10)),
      timeline,
    };
  }, []);

  return {
    currentAnalysis,
    warningMessage,
    getSessionSummary,
  };
}

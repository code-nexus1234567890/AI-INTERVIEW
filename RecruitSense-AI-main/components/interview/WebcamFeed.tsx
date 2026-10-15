"use client";

import React from "react";
import { Camera, AlertTriangle, ShieldCheck, UserX, Users } from "lucide-react";
import { FaceAnalysisResult } from "@/lib/emotionEngine";

export interface WebcamFeedProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  webcamStatus: "idle" | "requesting" | "active" | "error";
  errorMessage: string | null;
  currentAnalysis: FaceAnalysisResult;
  warningMessage: string | null;
  onRetryCamera?: () => void;
}

export function WebcamFeed({
  videoRef,
  webcamStatus,
  errorMessage,
  currentAnalysis,
  warningMessage,
  onRetryCamera,
}: WebcamFeedProps) {
  return (
    <div className="relative w-full max-w-xl mx-auto rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md group">
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-80 object-cover transform -scale-x-100 transition-opacity duration-300 ${
          webcamStatus === "active" ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Loading / Offline Placeholder */}
      {webcamStatus !== "active" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-50">
          {webcamStatus === "requesting" && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-700">Accessing camera feed...</p>
            </div>
          )}

          {webcamStatus === "error" && (
            <div className="flex flex-col items-center gap-3 text-rose-600">
              <AlertTriangle className="w-10 h-10" />
              <p className="text-sm font-semibold">{errorMessage || "Camera unavailable"}</p>
              {onRetryCamera && (
                <button
                  onClick={onRetryCamera}
                  className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                >
                  Retry Camera
                </button>
              )}
            </div>
          )}

          {webcamStatus === "idle" && (
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <Camera className="w-10 h-10" />
              <p className="text-sm font-medium">Camera inactive</p>
            </div>
          )}
        </div>
      )}

      {/* Top Left: Camera Status Badge */}
      <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-xs font-semibold text-slate-800 shadow-sm">
        <span
          className={`w-2 h-2 rounded-full ${
            webcamStatus === "active" ? "bg-emerald-500 animate-ping" : "bg-amber-500"
          }`}
        />
        <span>{webcamStatus === "active" ? "Live Feed" : "Camera Off"}</span>
      </div>

      {/* Top Right: Face Status Badge */}
      {webcamStatus === "active" && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-xs font-semibold shadow-sm">
          {currentAnalysis.faceCount === 1 ? (
            <span className="flex items-center gap-1 text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" /> Face Detected
            </span>
          ) : currentAnalysis.faceCount > 1 ? (
            <span className="flex items-center gap-1 text-amber-700">
              <Users className="w-3.5 h-3.5" /> Multiple Faces
            </span>
          ) : (
            <span className="flex items-center gap-1 text-rose-700">
              <UserX className="w-3.5 h-3.5" /> No Face
            </span>
          )}
        </div>
      )}

      {/* Warning Overlay Banner */}
      {warningMessage && webcamStatus === "active" && (
        <div className="absolute bottom-3 left-3 right-3 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg backdrop-blur-md animate-bounce">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{warningMessage}</span>
        </div>
      )}
    </div>
  );
}

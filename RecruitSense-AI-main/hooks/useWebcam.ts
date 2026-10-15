"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface UseWebcamOptions {
  width?: number;
  height?: number;
  facingMode?: "user" | "environment";
  autoStart?: boolean;
}

export interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  status: "idle" | "requesting" | "active" | "error";
  errorMessage: string | null;
  startWebcam: () => Promise<void>;
  stopWebcam: () => void;
}

export function useWebcam({
  width = 640,
  height = 480,
  facingMode = "user",
  autoStart = true,
}: UseWebcamOptions = {}): UseWebcamReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<"idle" | "requesting" | "active" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stopWebcam = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus("idle");
  }, [stream]);

  const startWebcam = useCallback(async () => {
    setStatus("requesting");
    setErrorMessage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Webcam API is not supported in this browser.");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: width },
          height: { ideal: height },
          facingMode,
        },
        audio: false,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {
          // Play interrupted or handled by video event
        });
      }

      setStatus("active");
    } catch (err: any) {
      setStatus("error");
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMessage("Camera permission denied. Please allow camera access in browser settings.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setErrorMessage("No webcam device found on your system.");
      } else {
        setErrorMessage(err.message || "Failed to access webcam.");
      }
    }
  }, [width, height, facingMode]);

  useEffect(() => {
    if (autoStart) {
      startWebcam();
    }

    return () => {
      stopWebcam();
    };
  }, [autoStart]);

  return {
    videoRef,
    stream,
    status,
    errorMessage,
    startWebcam,
    stopWebcam,
  };
}

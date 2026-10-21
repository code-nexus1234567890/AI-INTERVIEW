"use client";

import { useEffect, useRef, useState } from "react";
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";

export interface UseMediaPipeReturn {
  landmarker: FaceLandmarker | null;
  isLoaded: boolean;
  error: string | null;
}

export function useMediaPipeFaceLandmarker(): UseMediaPipeReturn {
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const [landmarker, setLandmarker] = useState<FaceLandmarker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initializeMediaPipe() {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
        );

        let faceLandmarkerInstance: FaceLandmarker;
        try {
          faceLandmarkerInstance = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
              delegate: "GPU",
            },
            outputFaceBlendshapes: true,
            outputFacialTransformationMatrixes: true,
            runningMode: "VIDEO",
            numFaces: 2,
          });
        } catch (gpuErr) {
          console.warn("GPU delegate failed for MediaPipe, attempting CPU delegate:", gpuErr);
          faceLandmarkerInstance = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
              delegate: "CPU",
            },
            outputFaceBlendshapes: true,
            outputFacialTransformationMatrixes: true,
            runningMode: "VIDEO",
            numFaces: 2,
          });
        }

        if (isMounted) {
          landmarkerRef.current = faceLandmarkerInstance;
          setLandmarker(faceLandmarkerInstance);
          setIsLoaded(true);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Failed to initialize MediaPipe FaceLandmarker:", err);
          setError(err.message || "Failed to load MediaPipe models.");
        }
      }
    }

    initializeMediaPipe();

    return () => {
      isMounted = false;
      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch {
          // ignore
        }
        landmarkerRef.current = null;
      }
    };
  }, []);

  return {
    landmarker,
    isLoaded,
    error,
  };
}

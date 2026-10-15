/**
 * emotionEngine.ts
 * Core computer vision & landmark processing module for MediaPipe Face Landmarker.
 */

export interface EmotionScores {
  Happy: number;
  Neutral: number;
  Sad: number;
  Angry: number;
  Fear: number;
  Surprise: number;
  Disgust: number;
}

export interface HeadPose {
  pitch: number; // looking up / down in degrees
  yaw: number;   // looking left / right in degrees
  roll: number;  // tilting side to side in degrees
}

export interface FaceAnalysisResult {
  faceDetected: boolean;
  faceCount: number;
  dominantEmotion: keyof EmotionScores;
  emotionScores: EmotionScores;
  confidence: number;
  headPose: HeadPose;
  isEyeContact: boolean;
  isSmiling: boolean;
  smileScore: number;
  engagementScore: number;
  lightingQuality: 'good' | 'poor' | 'overexposed' | 'unknown';
}

export interface EmotionSnapshot {
  timestamp: number; // relative second from interview start
  dominantEmotion: string;
  engagementScore: number;
  isEyeContact: boolean;
  isSmiling: boolean;
  emotionScores: EmotionScores;
}

/**
 * Maps MediaPipe Blendshapes (52 facial weights) into 7 core emotion probabilities.
 */
export function extractEmotionsFromBlendshapes(blendshapes: Record<string, number>): EmotionScores {
  const getWeight = (name: string) => blendshapes[name] || 0;

  // Blendshape signals
  const smileLeft = getWeight('mouthSmileLeft');
  const smileRight = getWeight('mouthSmileRight');
  const jawOpen = getWeight('jawOpen');
  const browDownLeft = getWeight('browDownLeft');
  const browDownRight = getWeight('browDownRight');
  const browInnerUp = getWeight('browInnerUp');
  const browOuterUpLeft = getWeight('browOuterUpLeft');
  const browOuterUpRight = getWeight('browOuterUpRight');
  const mouthFrownLeft = getWeight('mouthFrownLeft');
  const mouthFrownRight = getWeight('mouthFrownRight');
  const eyeWideLeft = getWeight('eyeWideLeft');
  const eyeWideRight = getWeight('eyeWideRight');
  const noseSneerLeft = getWeight('noseSneerLeft');
  const noseSneerRight = getWeight('noseSneerRight');
  const mouthPucker = getWeight('mouthPucker');

  // Emotion calculations
  const happyRaw = (smileLeft + smileRight) / 2;
  const surpriseRaw = Math.min(1, (jawOpen * 0.5 + (eyeWideLeft + eyeWideRight) * 0.5));
  const angryRaw = Math.min(1, (browDownLeft + browDownRight) * 0.8 + (noseSneerLeft + noseSneerRight) * 0.2);
  const sadRaw = Math.min(1, (browInnerUp * 0.6 + (mouthFrownLeft + mouthFrownRight) * 0.6));
  const fearRaw = Math.min(1, (browInnerUp * 0.4 + (eyeWideLeft + eyeWideRight) * 0.4 + jawOpen * 0.2));
  const disgustRaw = Math.min(1, (noseSneerLeft + noseSneerRight) * 0.7 + (mouthPucker * 0.3));

  // Neutral calculation (inverse of strong expressions)
  const maxExpression = Math.max(happyRaw, surpriseRaw, angryRaw, sadRaw, fearRaw, disgustRaw);
  const neutralRaw = Math.max(0.1, 1 - maxExpression);

  // Normalize scores to sum to 1.0
  const total = happyRaw + surpriseRaw + angryRaw + sadRaw + fearRaw + disgustRaw + neutralRaw;

  return {
    Happy: Number((happyRaw / total).toFixed(3)),
    Neutral: Number((neutralRaw / total).toFixed(3)),
    Sad: Number((sadRaw / total).toFixed(3)),
    Angry: Number((angryRaw / total).toFixed(3)),
    Fear: Number((fearRaw / total).toFixed(3)),
    Surprise: Number((surpriseRaw / total).toFixed(3)),
    Disgust: Number((disgustRaw / total).toFixed(3)),
  };
}

/**
 * Calculates Head Pose (Pitch, Yaw, Roll) from 3D Face Landmarks.
 */
export function calculateHeadPose(landmarks: Array<{ x: number; y: number; z: number }>): HeadPose {
  if (!landmarks || landmarks.length < 468) {
    return { pitch: 0, yaw: 0, roll: 0 };
  }

  // Key 3D facial landmark indices
  const noseTip = landmarks[1];
  const chin = landmarks[152];
  const leftEyeOuter = landmarks[33];
  const rightEyeOuter = landmarks[263];

  // Yaw: horizontal rotation (looking left/right)
  const dxEye = rightEyeOuter.x - leftEyeOuter.x;
  const noseRelativeX = (noseTip.x - leftEyeOuter.x) / (dxEye || 0.001);
  const yaw = Number(((noseRelativeX - 0.5) * 120).toFixed(1)); // -60 to +60 degrees approx

  // Pitch: vertical rotation (looking up/down)
  const dyNoseChin = chin.y - noseTip.y;
  const dzNoseChin = chin.z - noseTip.z;
  const pitch = Number((Math.atan2(dzNoseChin, dyNoseChin) * (180 / Math.PI)).toFixed(1));

  // Roll: side tilt
  const dyEye = rightEyeOuter.y - leftEyeOuter.y;
  const roll = Number((Math.atan2(dyEye, dxEye) * (180 / Math.PI)).toFixed(1));

  return { pitch, yaw, roll };
}

/**
 * Evaluates whether candidate is maintaining eye contact with the camera.
 */
export function checkEyeContact(pose: HeadPose): boolean {
  // Candidate is looking at camera if head yaw is within +- 15 deg and pitch within +- 15 deg
  return Math.abs(pose.yaw) <= 15 && Math.abs(pose.pitch) <= 18;
}

/**
 * Calculates composite engagement score (0 - 100).
 */
export function calculateEngagementScore(
  faceDetected: boolean,
  isEyeContact: boolean,
  pose: HeadPose,
  emotions: EmotionScores
): number {
  if (!faceDetected) return 0;

  let score = 50; // Base score for present face

  if (isEyeContact) score += 30; // Strong bonus for direct eye contact

  // Penalty for extreme head tilt or looking away
  if (Math.abs(pose.yaw) > 25 || Math.abs(pose.pitch) > 25) {
    score -= 20;
  }

  // Positive emotional expressiveness bonus
  if (emotions.Happy > 0.2 || emotions.Surprise > 0.2) {
    score += 15;
  }

  // Negative emotion / disengagement penalty
  if (emotions.Sad > 0.4 || emotions.Angry > 0.4) {
    score -= 10;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Measures video frame lighting quality from canvas pixel data.
 */
export function analyzeLightingQuality(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): 'good' | 'poor' | 'overexposed' | 'unknown' {
  try {
    const frame = ctx.getImageData(0, 0, Math.min(100, width), Math.min(100, height));
    const data = frame.data;
    let sumBrightness = 0;

    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      sumBrightness += (0.299 * r + 0.587 * g + 0.114 * b);
    }

    const avgBrightness = sumBrightness / (data.length / 16);

    if (avgBrightness < 45) return 'poor';
    if (avgBrightness > 220) return 'overexposed';
    return 'good';
  } catch {
    return 'unknown';
  }
}

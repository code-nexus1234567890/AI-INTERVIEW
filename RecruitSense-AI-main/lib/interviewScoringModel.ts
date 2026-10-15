/**
 * interviewScoringModel.ts
 *
 * In-browser and serverless inference engine for the custom-trained PyTorch
 * InterviewScoringModel (trained on the RecruitView multimodal interview dataset).
 *
 * Architecture:
 * - Input: 3 features [confidence_score, facial_expression, speaking_skills]
 * - Layer 1: Linear(3, 16) + ReLU
 * - Layer 2: Linear(16, 1)
 */

import weightsData from "./model_weights.json";

export interface CandidateModelFeatures {
  /**
   * Composure, camera eye contact, and head pose stability (normalized 0.0 - 1.0)
   */
  confidenceScore: number;

  /**
   * Facial engagement, smile frequency, and positive affect (normalized 0.0 - 1.0)
   */
  facialExpression: number;

  /**
   * Technical clarity, conceptual completeness, and fluency (normalized 0.0 - 1.0)
   */
  speakingSkills: number;
}

export interface ModelPredictionResult {
  /**
   * Raw linear output directly from the trained neural network (typically ~0.0 to 1.1)
   */
  rawScore: number;

  /**
   * Scaled integer score (0 to 100) for standard report cards
   */
  percentScore: number;

  /**
   * The exact input vector fed into the neural network
   */
  inputFeatures: {
    confidenceScore: number;
    facialExpression: number;
    speakingSkills: number;
  };

  /**
   * Qualitative band based on RecruitView empirical performance benchmarks
   */
  performanceBand: "Outstanding" | "Strong" | "Competent" | "Needs Improvement" | "Unsatisfactory";
}

const W1: number[][] = weightsData.fc1_weight; // [16][3]
const b1: number[] = weightsData.fc1_bias;     // [16]
const W2: number[][] = weightsData.fc2_weight; // [1][16]
const b2: number[] = weightsData.fc2_bias;     // [1]

/**
 * Forward pass matching PyTorch forward(x) exactly:
 * y = Linear2(ReLU(Linear1(x)))
 */
export function predictInterviewScore(features: CandidateModelFeatures): ModelPredictionResult {
  // Clamp input features between 0.0 and 1.0
  const c = Math.max(0, Math.min(1, features.confidenceScore));
  const f = Math.max(0, Math.min(1, features.facialExpression));
  const s = Math.max(0, Math.min(1, features.speakingSkills));

  const x = [c, f, s];

  // 1. Layer 1: W1 * x + b1 with ReLU activation
  const hidden: number[] = new Array(16);
  for (let i = 0; i < 16; i++) {
    const row = W1[i];
    const z = row[0] * x[0] + row[1] * x[1] + row[2] * x[2] + b1[i];
    hidden[i] = z > 0 ? z : 0; // ReLU
  }

  // 2. Layer 2: W2 * hidden + b2
  let rawScore = b2[0];
  const w2Row = W2[0];
  for (let j = 0; j < 16; j++) {
    rawScore += w2Row[j] * hidden[j];
  }

  // 3. Normalize score: [0.0, 1.0+] -> [0, 100]
  // In RecruitView, 0.85+ represents an excellent candidate (~85-100%)
  const clampedRaw = Math.max(0, rawScore);
  const percentScore = Math.min(100, Math.round(clampedRaw * 100));

  let performanceBand: ModelPredictionResult["performanceBand"] = "Competent";
  if (percentScore >= 85) performanceBand = "Outstanding";
  else if (percentScore >= 70) performanceBand = "Strong";
  else if (percentScore >= 50) performanceBand = "Competent";
  else if (percentScore >= 30) performanceBand = "Needs Improvement";
  else performanceBand = "Unsatisfactory";

  return {
    rawScore: Number(rawScore.toFixed(4)),
    percentScore,
    inputFeatures: {
      confidenceScore: Number(c.toFixed(2)),
      facialExpression: Number(f.toFixed(2)),
      speakingSkills: Number(s.toFixed(2)),
    },
    performanceBand,
  };
}

"use client";

import { useState, useEffect, useCallback } from "react";

export interface StoredQuestion {
  questionId: number;
  question: string;
  answer?: string;
  idealAnswer?: string;
  solution?: string;
}

export interface StoredUserAnswer {
  questionId: number;
  question: string;
  userAnswer: string;
  modelAnswer: string;
}

export interface StoredSessionAnalytics {
  averageEngagement: number;
  eyeContactPercentage: number;
  smileCount: number;
  smileFrequency: number;
  dominantEmotion: string;
  emotionDistribution: Record<string, number>;
  confidenceScore: number;
  timeline: Array<{
    timestamp: number;
    dominantEmotion: string;
    engagementScore: number;
    isEyeContact: boolean;
    isSmiling: boolean;
    emotionScores: Record<string, number>;
  }>;
}

export interface StoredEvaluation {
  technicalScore: number;
  behavioralScore: number;
  overallScore: number;
  mlModelScore: number;
  mlModelRaw: number;
  mlPerformanceBand: string;
  mlFeatures: {
    confidenceScore: number;
    facialExpression: number;
    speakingSkills: number;
  };
  answeredCount: number;
  unansweredCount: number;
  strengths: string[];
  improvementAreas: string[];
  technicalFeedback: string;
  behavioralFeedback: string;
  questionEvaluations: Array<{
    questionId: number;
    question: string;
    status: string;
    userAnswer: string | null;
    modelAnswer: string;
    score: number;
    aiFeedback: string;
  }>;
}

export interface StoredInterview {
  _id: string;
  userId?: string;
  jobTitle: string;
  jobDescription?: string;
  resumeUrl?: string;
  status: "draft" | "completed";
  interviewQuestions: StoredQuestion[];
  userAnswers?: StoredUserAnswer[];
  sessionAnalytics?: StoredSessionAnalytics;
  aiEvaluation?: StoredEvaluation;
  createdAt: string;
}

const STORAGE_KEY = "recruitsense_interviews_db";

const SEED_INTERVIEWS: StoredInterview[] = [
  {
    _id: "demo-interview-fullstack-001",
    userId: "user_ayush_candidate",
    jobTitle: "Senior Full Stack Developer",
    jobDescription: "React 19, Next.js App Router, TypeScript, Microservices, and High-Performance Cloud Architecture.",
    status: "completed",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    interviewQuestions: [
      {
        questionId: 1,
        question: "How do React 19 Server Components optimize initial page load compared to traditional client-side rendering?",
        answer: "Server Components execute exclusively on the server, producing rendered HTML and a serialized React component tree without shipping bundle JavaScript to the client. This dramatically reduces Time-to-Interactive (TTI) and eliminates hydration bottlenecks.",
      },
      {
        questionId: 2,
        question: "Explain your approach to database indexing and caching when designing an API handling 10,000 requests per second.",
        answer: "Composite B-tree indexing on filter/sort columns, Redis multi-tier caching with TTL invalidation, connection pooling via PgBouncer, and read-replica offloading for query scalability.",
      },
      {
        questionId: 3,
        question: "Describe a production race condition or concurrency bug you solved and your debugging strategy.",
        answer: "Used distributed locks (Redlock) and database row-level locking (SELECT FOR UPDATE) to eliminate double-spend race conditions in high-throughput transaction flows, verified with load test assertions.",
      },
    ],
    userAnswers: [
      {
        questionId: 1,
        question: "How do React 19 Server Components optimize initial page load compared to traditional client-side rendering?",
        userAnswer: "React 19 Server Components run on the server and stream lightweight HTML payloads without shipping large JS libraries. This avoids large client bundle downloads and improves Core Web Vitals like First Contentful Paint.",
        modelAnswer: "Server Components execute exclusively on the server, producing rendered HTML and a serialized React component tree without shipping bundle JavaScript to the client.",
      },
      {
        questionId: 2,
        question: "Explain your approach to database indexing and caching when designing an API handling 10,000 requests per second.",
        userAnswer: "I implement Redis caching layers with intelligent cache invalidation, database indexes on foreign keys, connection pooling, and asynchronous message queues for write operations.",
        modelAnswer: "Composite B-tree indexing on filter/sort columns, Redis multi-tier caching with TTL invalidation, connection pooling via PgBouncer, and read-replica offloading for query scalability.",
      },
      {
        questionId: 3,
        question: "Describe a production race condition or concurrency bug you solved and your debugging strategy.",
        userAnswer: "We encountered concurrent duplicate order entries under peak flash sales. I diagnosed it using distributed traces, then introduced atomic database transactions and distributed Redis locks to serialize execution.",
        modelAnswer: "Used distributed locks (Redlock) and database row-level locking (SELECT FOR UPDATE) to eliminate double-spend race conditions in high-throughput transaction flows.",
      },
    ],
    sessionAnalytics: {
      averageEngagement: 86,
      eyeContactPercentage: 88,
      smileCount: 4,
      smileFrequency: 1.3,
      dominantEmotion: "Neutral",
      emotionDistribution: {
        Neutral: 72,
        Happy: 20,
        Surprise: 8,
      },
      confidenceScore: 89,
      timeline: [
        { timestamp: 5, dominantEmotion: "Neutral", engagementScore: 82, isEyeContact: true, isSmiling: false, emotionScores: { Neutral: 0.8, Happy: 0.2 } },
        { timestamp: 15, dominantEmotion: "Happy", engagementScore: 90, isEyeContact: true, isSmiling: true, emotionScores: { Neutral: 0.3, Happy: 0.7 } },
        { timestamp: 30, dominantEmotion: "Neutral", engagementScore: 87, isEyeContact: true, isSmiling: false, emotionScores: { Neutral: 0.85, Happy: 0.15 } },
        { timestamp: 45, dominantEmotion: "Neutral", engagementScore: 85, isEyeContact: false, isSmiling: false, emotionScores: { Neutral: 0.9, Happy: 0.1 } },
        { timestamp: 60, dominantEmotion: "Happy", engagementScore: 88, isEyeContact: true, isSmiling: true, emotionScores: { Neutral: 0.4, Happy: 0.6 } },
      ],
    },
    aiEvaluation: {
      technicalScore: 86,
      behavioralScore: 88,
      overallScore: 87,
      mlModelScore: 87,
      mlModelRaw: 0.8741,
      mlPerformanceBand: "Outstanding",
      mlFeatures: {
        confidenceScore: 0.89,
        facialExpression: 0.78,
        speakingSkills: 0.86,
      },
      answeredCount: 3,
      unansweredCount: 0,
      strengths: [
        "Strong grasp of React 19 Server Components and SSR streaming",
        "Clear architectural methodology for distributed caching and database scaling",
        "Consistent 88% direct camera eye contact throughout the interview",
        "Custom PyTorch Neural Network rating: Outstanding candidate rating",
      ],
      improvementAreas: [
        "Include more concrete performance benchmarking metrics (e.g. p99 latencies, memory footprint)",
        "Detail fallback mechanisms for Redis cluster partitions",
      ],
      technicalFeedback: "Candidate demonstrated comprehensive technical mastery across full-stack engineering domains. Answers were well-structured, addressing theoretical foundations and production edge cases.",
      behavioralFeedback: "Candidate maintained excellent facial composure, steady eye contact (88%), and positive professional engagement throughout the session.",
      questionEvaluations: [
        {
          questionId: 1,
          question: "How do React 19 Server Components optimize initial page load compared to traditional client-side rendering?",
          status: "answered",
          userAnswer: "React 19 Server Components run on the server and stream lightweight HTML payloads without shipping large JS libraries. This avoids large client bundle downloads and improves Core Web Vitals like First Contentful Paint.",
          modelAnswer: "Server Components execute exclusively on the server, producing rendered HTML and a serialized React component tree without shipping bundle JavaScript to the client.",
          score: 88,
          aiFeedback: "High technical accuracy (88%). Accurately explained server streaming and bundle reduction benefits.",
        },
        {
          questionId: 2,
          question: "Explain your approach to database indexing and caching when designing an API handling 10,000 requests per second.",
          status: "answered",
          userAnswer: "I implement Redis caching layers with intelligent cache invalidation, database indexes on foreign keys, connection pooling, and asynchronous message queues for write operations.",
          modelAnswer: "Composite B-tree indexing on filter/sort columns, Redis multi-tier caching with TTL invalidation, connection pooling via PgBouncer, and read-replica offloading for query scalability.",
          score: 85,
          aiFeedback: "Solid technical response (85%). Covered multi-tier caching, indexing, and queue decoupling.",
        },
        {
          questionId: 3,
          question: "Describe a production race condition or concurrency bug you solved and your debugging strategy.",
          status: "answered",
          userAnswer: "We encountered concurrent duplicate order entries under peak flash sales. I diagnosed it using distributed traces, then introduced atomic database transactions and distributed Redis locks to serialize execution.",
          modelAnswer: "Used distributed locks (Redlock) and database row-level locking (SELECT FOR UPDATE) to eliminate double-spend race conditions in high-throughput transaction flows.",
          score: 85,
          aiFeedback: "Demonstrated strong debugging methodology and correct usage of distributed locking patterns (85%).",
        },
      ],
    },
  },
  {
    _id: "demo-interview-ai-002",
    userId: "user_sarah_candidate",
    jobTitle: "AI & Machine Learning Solutions Engineer",
    jobDescription: "PyTorch, Multimodal Deep Learning, On-Device Vision Inference, MediaPipe, Model Optimization.",
    status: "completed",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    interviewQuestions: [
      {
        questionId: 1,
        question: "How does the attention mechanism in Transformers differ from recurrent connections in RNNs?",
        answer: "Self-attention computes pairwise token affinities across the entire sequence simultaneously in O(1) sequential steps, enabling massive parallelization during training, whereas RNNs process tokens sequentially with O(N) hidden state recurrence.",
      },
      {
        questionId: 2,
        question: "How do you optimize PyTorch neural network inference for real-time web deployment?",
        answer: "Post-training quantization (INT8/FP16), operator fusion, ONNX export with ONNX Runtime Web (WASM/WebGL), pruning redundant weights, and TensorRT compilation.",
      },
    ],
    userAnswers: [
      {
        questionId: 1,
        question: "How does the attention mechanism in Transformers differ from recurrent connections in RNNs?",
        userAnswer: "Transformers use multi-head self attention to compute affinities between all tokens at once. RNNs suffer from vanishing gradients and sequential dependency which prevents GPU parallelization.",
        modelAnswer: "Self-attention computes pairwise token affinities across the entire sequence simultaneously in O(1) sequential steps.",
      },
      {
        questionId: 2,
        question: "How do you optimize PyTorch neural network inference for real-time web deployment?",
        userAnswer: "We export the PyTorch model to ONNX, apply weight quantization to INT8 or FP16, and run inference using WebAssembly and WebGL execution providers.",
        modelAnswer: "Post-training quantization (INT8/FP16), operator fusion, ONNX export with ONNX Runtime Web, pruning, and TensorRT compilation.",
      },
    ],
    sessionAnalytics: {
      averageEngagement: 92,
      eyeContactPercentage: 90,
      smileCount: 3,
      smileFrequency: 1.1,
      dominantEmotion: "Neutral",
      emotionDistribution: {
        Neutral: 78,
        Happy: 18,
        Surprise: 4,
      },
      confidenceScore: 94,
      timeline: [
        { timestamp: 5, dominantEmotion: "Neutral", engagementScore: 90, isEyeContact: true, isSmiling: false, emotionScores: { Neutral: 0.9, Happy: 0.1 } },
        { timestamp: 20, dominantEmotion: "Neutral", engagementScore: 94, isEyeContact: true, isSmiling: false, emotionScores: { Neutral: 0.85, Happy: 0.15 } },
        { timestamp: 40, dominantEmotion: "Happy", engagementScore: 92, isEyeContact: true, isSmiling: true, emotionScores: { Neutral: 0.35, Happy: 0.65 } },
      ],
    },
    aiEvaluation: {
      technicalScore: 93,
      behavioralScore: 91,
      overallScore: 92,
      mlModelScore: 92,
      mlModelRaw: 0.9234,
      mlPerformanceBand: "Outstanding",
      mlFeatures: {
        confidenceScore: 0.94,
        facialExpression: 0.82,
        speakingSkills: 0.93,
      },
      answeredCount: 2,
      unansweredCount: 0,
      strengths: [
        "In-depth grasp of Transformer parallelization and GPU compute kernels",
        "Clear knowledge of ONNX Runtime Web, WASM, and INT8 model quantization",
        "High camera gaze stability (90% direct eye contact)",
        "Custom PyTorch Neural Network prediction: 92% (Outstanding)",
      ],
      improvementAreas: [
        "Could explore FlashAttention-2 tiling optimizations for long-context models",
      ],
      technicalFeedback: "Outstanding engineering proficiency demonstrated across machine learning deployment workflows and neural network optimization.",
      behavioralFeedback: "Confident, articulate delivery with steady posture and direct camera engagement.",
      questionEvaluations: [
        {
          questionId: 1,
          question: "How does the attention mechanism in Transformers differ from recurrent connections in RNNs?",
          status: "answered",
          userAnswer: "Transformers use multi-head self attention to compute affinities between all tokens at once. RNNs suffer from vanishing gradients and sequential dependency which prevents GPU parallelization.",
          modelAnswer: "Self-attention computes pairwise token affinities across the entire sequence simultaneously in O(1) sequential steps.",
          score: 94,
          aiFeedback: "Excellent conceptual clarity (94%). Accurately explained vanishing gradients and parallelization advantages.",
        },
        {
          questionId: 2,
          question: "How do you optimize PyTorch neural network inference for real-time web deployment?",
          status: "answered",
          userAnswer: "We export the PyTorch model to ONNX, apply weight quantization to INT8 or FP16, and run inference using WebAssembly and WebGL execution providers.",
          modelAnswer: "Post-training quantization (INT8/FP16), operator fusion, ONNX export with ONNX Runtime Web, pruning, and TensorRT compilation.",
          score: 92,
          aiFeedback: "Thorough deployment answer (92%). Addressed ONNX WebAssembly, quantization, and WebGL.",
        },
      ],
    },
  },
  {
    _id: "demo-interview-devops-003",
    userId: "user_marcus_candidate",
    jobTitle: "Senior Cloud & DevOps Architect",
    jobDescription: "Kubernetes, Terraform, AWS Multi-Region, Zero-Downtime CI/CD, Observability.",
    status: "completed",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    interviewQuestions: [
      {
        questionId: 1,
        question: "How do you design a zero-downtime blue/green deployment strategy for a stateful Kubernetes cluster?",
        answer: "Deploy a duplicate green pod replica set, verify readiness probes, sync stateful volumes with volume snapshots or distributed replication, transition ingress routing via weighted DNS or service selectors, and drain blue pods gracefully.",
      },
      {
        questionId: 2,
        question: "How do you structure Terraform state to prevent locking collisions and state corruption across 20+ engineering squads?",
        answer: "Separate state by domain and environment into dedicated S3 backends with DynamoDB state locking, enforce remote module versioning, and run CI plan/apply via Atlantis or Terraform Cloud.",
      },
    ],
    userAnswers: [
      {
        questionId: 1,
        question: "How do you design a zero-downtime blue/green deployment strategy for a stateful Kubernetes cluster?",
        userAnswer: "We deploy the green release alongside blue, validate health probes and data consistency, then switch traffic using an Ingress controller or service selector. Once stable, blue is decommissioned.",
        modelAnswer: "Deploy a duplicate green pod replica set, verify readiness probes, sync stateful volumes, transition ingress routing, and drain blue pods gracefully.",
      },
      {
        questionId: 2,
        question: "How do you structure Terraform state to prevent locking collisions and state corruption across 20+ engineering squads?",
        userAnswer: "We split state per service tier into isolated S3 buckets with DynamoDB locking tables, restricting writes through automated CI/CD pipelines.",
        modelAnswer: "Separate state by domain and environment into dedicated S3 backends with DynamoDB state locking, enforce remote module versioning.",
      },
    ],
    sessionAnalytics: {
      averageEngagement: 88,
      eyeContactPercentage: 86,
      smileCount: 2,
      smileFrequency: 0.9,
      dominantEmotion: "Neutral",
      emotionDistribution: {
        Neutral: 82,
        Happy: 14,
        Surprise: 4,
      },
      confidenceScore: 90,
      timeline: [
        { timestamp: 5, dominantEmotion: "Neutral", engagementScore: 88, isEyeContact: true, isSmiling: false, emotionScores: { Neutral: 0.88, Happy: 0.12 } },
        { timestamp: 25, dominantEmotion: "Neutral", engagementScore: 91, isEyeContact: true, isSmiling: false, emotionScores: { Neutral: 0.85, Happy: 0.15 } },
      ],
    },
    aiEvaluation: {
      technicalScore: 89,
      behavioralScore: 88,
      overallScore: 89,
      mlModelScore: 89,
      mlModelRaw: 0.892,
      mlPerformanceBand: "Outstanding",
      mlFeatures: {
        confidenceScore: 0.9,
        facialExpression: 0.8,
        speakingSkills: 0.89,
      },
      answeredCount: 2,
      unansweredCount: 0,
      strengths: [
        "Deep understanding of Kubernetes stateful workload lifecycle",
        "Solid infrastructure-as-code state segregation architecture",
        "Strong vocal clarity and professional composure",
      ],
      improvementAreas: [
        "Include disaster recovery RTO/RPO targets for multi-region failover",
      ],
      technicalFeedback: "Strong expertise in production Kubernetes clustering, CI/CD safety, and Terraform modularization.",
      behavioralFeedback: "Articulate, calm under technical questioning, and direct camera eye contact.",
      questionEvaluations: [
        {
          questionId: 1,
          question: "How do you design a zero-downtime blue/green deployment strategy for a stateful Kubernetes cluster?",
          status: "answered",
          userAnswer: "We deploy the green release alongside blue, validate health probes and data consistency, then switch traffic using an Ingress controller or service selector. Once stable, blue is decommissioned.",
          modelAnswer: "Deploy a duplicate green pod replica set, verify readiness probes, sync stateful volumes, transition ingress routing, and drain blue pods gracefully.",
          score: 90,
          aiFeedback: "Strong technical answer (90%). Accurately explained Kubernetes ingress shifting and probe validation.",
        },
        {
          questionId: 2,
          question: "How do you structure Terraform state to prevent locking collisions and state corruption across 20+ engineering squads?",
          status: "answered",
          userAnswer: "We split state per service tier into isolated S3 buckets with DynamoDB locking tables, restricting writes through automated CI/CD pipelines.",
          modelAnswer: "Separate state by domain and environment into dedicated S3 backends with DynamoDB state locking, enforce remote module versioning.",
          score: 88,
          aiFeedback: "Good architectural approach (88%). Highlighted DynamoDB lock table and workspace partitioning.",
        },
      ],
    },
  },
];

function getInitialInterviews(): StoredInterview[] {
  if (typeof window === "undefined") return SEED_INTERVIEWS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_INTERVIEWS));
      return SEED_INTERVIEWS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Migrate existing seed interviews if needed
      let hasChanges = false;
      const updated = parsed.map((item: StoredInterview) => {
        if (item._id === "demo-interview-ai-002" && item.userId === "user_ayush_candidate") {
          hasChanges = true;
          return { ...item, userId: "user_sarah_candidate" };
        }
        return item;
      });

      // Ensure Marcus's interview is included if missing
      const hasMarcus = updated.some((item: StoredInterview) => item._id === "demo-interview-devops-003");
      if (!hasMarcus) {
        const marcusInterview = SEED_INTERVIEWS.find((s) => s._id === "demo-interview-devops-003");
        if (marcusInterview) {
          updated.push(marcusInterview);
          hasChanges = true;
        }
      }

      if (hasChanges) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_INTERVIEWS));
    return SEED_INTERVIEWS;
  } catch {
    return SEED_INTERVIEWS;
  }
}

function persistInterviews(list: StoredInterview[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("recruitsense_storage_change"));
  } catch (e) {
    console.warn("Failed persisting to localStorage:", e);
  }
}

export function getAllInterviews(): StoredInterview[] {
  return getInitialInterviews();
}

export function getInterviewById(id: string): StoredInterview | null {
  const list = getInitialInterviews();
  return list.find((item) => item._id === id) || null;
}

export function createNewInterviewSession(params: {
  questions: any[];
  uid?: string;
  jobTitle?: string;
  jobDescription?: string;
  resumeUrl?: string;
}): string {
  const list = getInitialInterviews();
  const newId = `interview-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const formattedQuestions: StoredQuestion[] = params.questions.map((q, idx) => {
    if (typeof q === "string") {
      return {
        questionId: idx + 1,
        question: q,
        answer: "Candidate should explain relevant technical foundations and practical experience.",
      };
    }
    return {
      questionId: q.questionId || idx + 1,
      question: q.question || q.questionText || `Question ${idx + 1}`,
      answer: q.answer || q.modelAnswer || q.idealAnswer || "Candidate should demonstrate technical competence.",
    };
  });

  const newSession: StoredInterview = {
    _id: newId,
    userId: params.uid || "user_guest",
    jobTitle: params.jobTitle || "Software Engineer",
    jobDescription: params.jobDescription || "",
    resumeUrl: params.resumeUrl || "",
    status: "draft",
    interviewQuestions: formattedQuestions,
    createdAt: new Date().toISOString(),
  };

  list.unshift(newSession);
  persistInterviews(list);
  return newId;
}

export function saveSessionAnalytics(id: string, analytics: any) {
  const list = getInitialInterviews();
  const idx = list.findIndex((item) => item._id === id);
  if (idx !== -1) {
    list[idx].sessionAnalytics = analytics;
    list[idx].status = "completed";
    persistInterviews(list);
  }
}

export function saveSessionAnswersAndEvaluation(
  id: string,
  userAnswers: any,
  aiEvaluation: any
) {
  const list = getInitialInterviews();
  const idx = list.findIndex((item) => item._id === id);
  if (idx !== -1) {
    list[idx].userAnswers = userAnswers;
    list[idx].aiEvaluation = aiEvaluation;
    list[idx].status = "completed";
    persistInterviews(list);
  }
}

/**
 * React hook to listen for interview list updates, optionally filtered by userId
 */
export function useStoredInterviewList(filterUserId?: string) {
  const [list, setList] = useState<StoredInterview[]>([]);
  const [allSessions, setAllSessions] = useState<StoredInterview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadList = useCallback(() => {
    const all = getInitialInterviews();
    setAllSessions(all);
    if (filterUserId && filterUserId !== "all") {
      const filtered = all.filter((item) => item.userId === filterUserId);
      setList(filtered);
    } else {
      setList(all);
    }
    setIsLoading(false);
  }, [filterUserId]);

  useEffect(() => {
    loadList();

    const handleStorageChange = () => {
      loadList();
    };

    window.addEventListener("recruitsense_storage_change", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("recruitsense_storage_change", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadList]);

  return { list, allSessions, isLoading, reload: loadList };
}

/**
 * React hook to get a single interview session
 */
export function useStoredInterview(id?: string) {
  const [interview, setInterview] = useState<StoredInterview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadInterview = useCallback(() => {
    if (!id) {
      setInterview(null);
      setIsLoading(false);
      return;
    }
    const found = getInterviewById(id);
    setInterview(found);
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    loadInterview();

    const handleStorageChange = () => {
      loadInterview();
    };

    window.addEventListener("recruitsense_storage_change", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("recruitsense_storage_change", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadInterview]);

  return { interview, isLoading, reload: loadInterview };
}

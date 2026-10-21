import { NextRequest, NextResponse } from "next/server";
import Imagekit from "imagekit";
import axios from "axios";

function getImageKit() {
  const publicKey = process.env.IMAGEKIT_URL_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_URL_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    return null;
  }

  return new Imagekit({
    publicKey,
    privateKey,
    urlEndpoint,
  });
}

function parseN8nQuestions(data: any): any[] {
  if (!data) return [];

  let raw: any = data;

  if (Array.isArray(data)) {
    raw = data[0]?.json || data[0];
  }

  if (raw?.output) {
    let out = raw.output;
    if (typeof out === "string") {
      try {
        const match = out.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
          if (parsed?.interviewQuestions && Array.isArray(parsed.interviewQuestions)) {
            return parsed.interviewQuestions;
          }
        }
      } catch (e) {
        console.warn("Failed parsing raw.output string:", e);
      }
    } else if (Array.isArray(out)) {
      return out;
    }
  }

  if (raw?.message?.content) {
    let content = raw.message.content;
    if (typeof content === "string") {
      try {
        const match = content.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          if (parsed?.interviewQuestions && Array.isArray(parsed.interviewQuestions)) {
            return parsed.interviewQuestions;
          }
        }
      } catch {
        // ignore
      }
    } else if (typeof content === "object" && content !== null) {
      const extracted =
        content?.interviewQuestions ||
        content?.interview_questions ||
        content?.questions;
      if (Array.isArray(extracted) && extracted.length > 0) {
        return extracted;
      }
    }
  }

  const direct =
    raw?.interviewQuestions ||
    raw?.interview_questions ||
    raw?.questions ||
    raw?.data;

  if (Array.isArray(direct) && direct.length > 0) {
    return direct;
  }

  if (Array.isArray(raw)) {
    return raw;
  }

  return [];
}

/**
 * Generates tailored role-specific questions based on job title and description
 */
function getRoleSpecificQuestions(jobTitle: string, jobDescription: string) {
  const title = jobTitle.toLowerCase();
  const desc = jobDescription.toLowerCase();

  if (title.includes("front") || title.includes("react") || title.includes("next") || desc.includes("react")) {
    return [
      {
        questionId: 1,
        question: `Can you introduce yourself and explain your experience building performant frontend applications with ${jobTitle}?`,
        answer: "Candidate should outline component architecture, state management approaches, Core Web Vitals optimization, and real-world project deliveries.",
      },
      {
        questionId: 2,
        question: "How do React 19 Server Components and SSR streaming improve user experience over standard client-side SPA rendering?",
        answer: "Server Components execute on the server, avoiding client JS bundle download. Streaming HTML allows earlier First Contentful Paint and progressive hydration.",
      },
      {
        questionId: 3,
        question: "How do you handle client-side state, caching, and re-renders in a large-scale React application?",
        answer: "Explain memoization (useMemo, useCallback), context splitting, atomic state libraries, server state caching (TanStack Query/SWR), and render profiling.",
      },
      {
        questionId: 4,
        question: "Describe a complex UI bug or performance bottleneck (such as layout shifts or re-rendering loops) you resolved.",
        answer: "Systematic performance profiling with Chrome DevTools, identifying unnecessary DOM re-computations or layout thrashing, and implementing virtualization or debounce.",
      },
      {
        questionId: 5,
        question: "How do you ensure accessibility (a11y), responsive design, and robust automated UI testing?",
        answer: "Semantic HTML5, ARIA roles, keyboard navigability, contrast standards, responsive CSS layout, and testing with Jest, Playwright, or Cypress.",
      },
    ];
  }

  if (title.includes("back") || title.includes("node") || title.includes("go") || title.includes("api") || desc.includes("database")) {
    return [
      {
        questionId: 1,
        question: `Can you introduce yourself and walk us through your backend architecture experience for the ${jobTitle} role?`,
        answer: "Candidate should discuss REST/GraphQL/gRPC APIs, microservices or modular monolith architecture, database schema design, and asynchronous workers.",
      },
      {
        questionId: 2,
        question: "How do you design database schemas, indexing strategies, and caching for high-read, high-write workloads?",
        answer: "Composite B-tree indexes, Redis caching with TTL/write-through policies, connection pooling, read replicas, and partitioning strategies.",
      },
      {
        questionId: 3,
        question: "How do you address race conditions, idempotent request handling, and distributed transactions?",
        answer: "Idempotency keys, database row-level locking (SELECT FOR UPDATE), distributed locks (Redlock), and Saga patterns or two-phase commit.",
      },
      {
        questionId: 4,
        question: "Explain your methodology for logging, telemetry, and diagnosing production performance degradation or memory leaks.",
        answer: "Structured JSON logging, OpenTelemetry traces, APM monitoring (Prometheus/Grafana), heap dumps, and p99 latency metric tracking.",
      },
      {
        questionId: 5,
        question: "How do you secure backend endpoints against common vulnerabilities (SQL injection, CSRF, rate-limiting, and JWT management)?",
        answer: "Parameterized queries/ORMs, HTTPS-only secure cookies, token rotation, rate limiting via Redis token bucket, and principle of least privilege.",
      },
    ];
  }

  if (title.includes("ml") || title.includes("ai") || title.includes("machine") || title.includes("data") || desc.includes("pytorch")) {
    return [
      {
        questionId: 1,
        question: `Introduce yourself and describe your machine learning pipeline experience relevant to ${jobTitle}.`,
        answer: "Model selection, data preprocessing, feature engineering, loss formulation, training loops, evaluation metrics, and inference deployment.",
      },
      {
        questionId: 2,
        question: "How do you optimize deep learning model inference latency and memory footprint for production deployment?",
        answer: "Post-training quantization (INT8/FP16), model pruning, knowledge distillation, ONNX export, and hardware acceleration (TensorRT/WebAssembly).",
      },
      {
        questionId: 3,
        question: "Explain the architectural difference between self-attention in Transformers and recurrence in LSTM/RNN models.",
        answer: "Self-attention computes global pairwise affinities in parallel O(1) sequential steps, whereas RNNs process tokens sequentially with O(N) hidden recurrence.",
      },
      {
        questionId: 4,
        question: "How do you detect and mitigate data drift, concept drift, and overfitting in deployed ML systems?",
        answer: "Monitoring distribution divergence (KL-divergence, Kolmogorov-Smirnov test), automated shadow testing, regular retraining, and regularization techniques.",
      },
      {
        questionId: 5,
        question: "Describe your workflow for managing ML experiments, reproducibility, and versioning.",
        answer: "Tracking tools (MLflow/Weights & Biases), deterministic seeding, containerized environments, and DVC for dataset versioning.",
      },
    ];
  }

  // Default Full Stack / Software Engineer Questions
  return [
    {
      questionId: 1,
      question: `Can you introduce yourself and highlight your relevant technical experience for the ${jobTitle} role?`,
      answer: `Candidate should outline key technical achievements and project experience relevant to ${jobTitle}.`,
    },
    {
      questionId: 2,
      question: `What core technologies and frameworks have you used that relate to ${jobTitle}?`,
      answer: `Explanation of core stack, libraries, database design, and architecture decisions.`,
    },
    {
      questionId: 3,
      question: `Describe a challenging bug or technical obstacle you encountered in a recent project and how you solved it.`,
      answer: `Systematic debugging workflow, root cause analysis, fix implementation, and regression testing.`,
    },
    {
      questionId: 4,
      question: `How do you approach performance optimization and scalable system design?`,
      answer: `Caching strategies, indexing, lazy loading, API optimization, and state management.`,
    },
    {
      questionId: 5,
      question: `How do you ensure code quality, error handling, and effective team collaboration?`,
      answer: `Unit testing, code reviews, clean code practices, and agile communication.`,
    },
  ];
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const jobTitle = (formData.get("jobTitle") as string) || "Software Engineer";
    const jobDescription = (formData.get("jobDescription") as string) || "Full Stack Developer";

    let resumeUrl = "";

    // 1. Handle File Upload (ImageKit)
    if (file && file.size > 0) {
      try {
        const imageKit = getImageKit();
        if (imageKit) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          const uploadResponse = await imageKit.upload({
            file: buffer,
            fileName: `resume-${Date.now()}-${file.name || "document.pdf"}`,
            isPrivateFile: false,
            useUniqueFileName: true,
          });
          resumeUrl = uploadResponse?.url || "";
        } else {
          resumeUrl = "https://ik.imagekit.io/placeholder/sample-resume.pdf";
        }
      } catch (uploadError) {
        console.warn("ImageKit upload failed, proceeding with fallback URL:", uploadError);
        resumeUrl = "https://ik.imagekit.io/placeholder/sample-resume.pdf";
      }
    }

    let questions: any[] = [];

    // 2. Google Gemini Question Generator (if API key configured)
    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const prompt = `Generate exactly 5 realistic, technical interview questions and reference ideal answers for a ${jobTitle} role.
Job Description Context: ${jobDescription || "Full Stack Engineering"}
Return STRICTLY a JSON array of 5 objects with keys: "questionId" (1-5), "question" (string), "answer" (string concise ideal answer). No markdown formatting.`;

        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          { contents: [{ parts: [{ text: prompt }] }] },
          { timeout: 8000 }
        );

        const rawText = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const match = rawText.match(/\[[\s\S]*\]/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            questions = parsed;
          }
        }
      } catch (geminiError: any) {
        console.warn("Gemini question generation error, proceeding to next generator:", geminiError?.message);
      }
    }

    // 3. n8n AI Workflow Integration Call (with fast 2s timeout)
    if (questions.length === 0) {
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
      if (n8nWebhookUrl && !n8nWebhookUrl.includes("localhost:5678")) {
        try {
          const n8nPayload = resumeUrl ? { resumeUrl } : { jobTitle, jobDescription };
          const n8nResponse = await axios.post(n8nWebhookUrl, n8nPayload, {
            headers: { "Content-Type": "application/json" },
            timeout: 3000,
          });
          questions = parseN8nQuestions(n8nResponse.data);
        } catch (n8nError: any) {
          console.warn("n8n webhook error or connection timeout:", n8nError?.message);
        }
      }
    }

    // 4. Role-Tailored Question Generator (Instantaneous & Contextual)
    if (!questions || questions.length === 0) {
      questions = getRoleSpecificQuestions(jobTitle, jobDescription);
    }

    return NextResponse.json({
      success: true,
      questions,
      resumeUrl,
    });
  } catch (error: any) {
    console.error("Generate interview questions error:", error);
    return NextResponse.json(
      {
        success: true,
        questions: getRoleSpecificQuestions("Software Engineer", "Full Stack Development"),
        resumeUrl: "",
      },
      { status: 200 }
    );
  }
}

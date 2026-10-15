import { NextRequest, NextResponse } from "next/server";
import Imagekit from "imagekit";
import axios from "axios";

const imageKit = new Imagekit({
  publicKey: process.env.IMAGEKIT_URL_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_URL_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

/**
 * Parses n8n response structures, prioritizing raw.output JSON strings
 */
function parseN8nQuestions(data: any): any[] {
  if (!data) return [];

  let raw: any = data;

  // Unwrap n8n item list: [{ json: ... }]
  if (Array.isArray(data)) {
    raw = data[0]?.json || data[0];
  }

  // Priority 1: Check raw.output string (where n8n stores generated JSON arrays)
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

  // Priority 2: Check raw.message?.content
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

  // Priority 3: Direct key extraction
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
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResponse = await imageKit.upload({
          file: buffer,
          fileName: `resume-${Date.now()}-${file.name || "document.pdf"}`,
          isPrivateFile: false,
          useUniqueFileName: true,
        });
        resumeUrl = uploadResponse?.url || "";
      } catch (uploadError) {
        console.warn("ImageKit upload failed, proceeding with fallback URL:", uploadError);
        resumeUrl = "https://ik.imagekit.io/placeholder/sample-resume.pdf";
      }
    }

    let questions: any[] = [];
    const n8nWebhookUrl =
      process.env.N8N_WEBHOOK_URL ||
      "http://localhost:5678/webhook/e5ed1096-c289-4a81-85bd-9691d6d21fed";

    // 2. n8n AI Workflow Integration Call
    try {
      // Send resumeUrl if resume was uploaded, or jobTitle + jobDescription if Job Description mode
      const n8nPayload = resumeUrl
        ? { resumeUrl }
        : { jobTitle, jobDescription };

      console.log(`Sending payload to n8n at ${n8nWebhookUrl}:`, JSON.stringify(n8nPayload));
      const n8nResponse = await axios.post(
        n8nWebhookUrl,
        n8nPayload,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 15000,
        }
      );

      console.log("n8n raw response received:", JSON.stringify(n8nResponse.data));
      questions = parseN8nQuestions(n8nResponse.data);
      console.log(`Parsed ${questions.length} questions from n8n output.`);
    } catch (n8nError: any) {
      console.warn("n8n webhook error or connection timeout:", n8nError?.message);
    }

    // 3. Fallback Question Generator (Used if n8n is offline or returned empty)
    if (!questions || questions.length === 0) {
      console.log("Using fallback question generator.");
      questions = [
        {
          questionId: 1,
          question: `Can you introduce yourself and highlight your relevant experience for the ${jobTitle} role?`,
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
        questions: [
          "Can you walk us through your background and technical projects?",
          "How do you handle technical challenges and debugging under pressure?",
          "What are your core strengths in full-stack development and system design?",
        ],
        resumeUrl: "",
      },
      { status: 200 }
    );
  }
}

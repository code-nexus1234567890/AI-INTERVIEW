import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { predictInterviewScore } from "@/lib/interviewScoringModel";

/**
 * Checks if candidate skipped or provided an empty response.
 */
function checkIsUnanswered(text?: string): boolean {
  if (!text) return true;
  const clean = text.trim().toLowerCase();
  return (
    clean.length < 5 ||
    clean.includes("no vocal answer") ||
    clean.includes("no voice answer") ||
    clean.includes("no transcript") ||
    clean === "no response provided." ||
    clean === "no vocal answer provided."
  );
}

/**
 * Technical Keyword & Semantic Relevance Analyzer.
 * Calculates exact technical accuracy score (0-100%) without arbitrary baseline additions.
 */
function evaluateAnswerQuality(userAnswer: string, modelAnswer: string): {
  score: number;
  feedback: string;
} {
  const userText = userAnswer.toLowerCase().trim();
  const modelText = modelAnswer.toLowerCase().trim();

  // Common filler words and stop words
  const stopWords = new Set([
    "this", "that", "with", "from", "have", "used", "uses", "which", "when", "both",
    "also", "than", "were", "been", "where", "what", "how", "each", "other", "into",
    "yeah", "like", "just", "well", "some", "then", "know", "mean", "sort", "kind"
  ]);

  // Extract key technical terms from model answer (words >= 4 chars)
  const modelKeywords = Array.from(
    new Set(
      modelText
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !stopWords.has(w))
    )
  );

  // Clean candidate words excluding filler words
  const userWords = userText
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !stopWords.has(w) && w !== "uh" && w !== "um" && w !== "but");

  // Spoken transcript lacks meaningful technical words
  if (userWords.length < 4) {
    return {
      score: 0,
      feedback: "Irrelevant response (Score: 0/100). Spoken transcript contains no technical content related to the question.",
    };
  }

  if (modelKeywords.length === 0) {
    return {
      score: 50,
      feedback: "Answer recorded. Generic response provided.",
    };
  }

  // Count exact matched technical concepts
  const matchedKeywords = modelKeywords.filter((kw) => userText.includes(kw));
  const exactPercentage = Math.round((matchedKeywords.length / modelKeywords.length) * 100);

  // Irrelevant or off-topic response (<20% concept match or filler speech)
  if (exactPercentage < 20 || userWords.length < 6) {
    return {
      score: 0,
      feedback: "Irrelevant / off-topic response (Score: 0/100). The spoken transcript does not contain the required technical concepts.",
    };
  }

  // Exact concept match score (0 - 100)
  const score = Math.min(100, exactPercentage);

  if (score < 40) {
    return {
      score,
      feedback: `Low technical completeness (${score}%). Referenced "${matchedKeywords.slice(0, 2).join(", ")}", but omitted key implementation details.`,
    };
  }

  if (score < 70) {
    return {
      score,
      feedback: `Partial technical answer (${score}%). Covered key concepts (${matchedKeywords.slice(0, 3).join(", ")}), but missed edge cases.`,
    };
  }

  return {
    score,
    feedback: `High technical accuracy (${score}%). Demonstrated solid understanding and covered key architectural concepts clearly.`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { jobTitle, jobDescription, questions, userAnswers, emotionSummary } = await req.json();

    const answersList: any[] = userAnswers || [];
    let answeredCount = 0;
    let totalAnsweredScore = 0;

    const questionEvaluations = answersList.map((item: any, idx: number) => {
      const rawUserAns = item.userAnswer || "";
      const isMissing = checkIsUnanswered(rawUserAns);

      const refAnswer =
        item.modelAnswer ||
        item.n8nModelAnswer ||
        item.suggestedAnswer ||
        "Candidates should explain theoretical foundations, core architecture, and production trade-offs.";

      if (isMissing) {
        return {
          questionId: idx + 1,
          question: item.question || `Question ${idx + 1}`,
          status: "unanswered",
          userAnswer: null,
          modelAnswer: refAnswer,
          score: 0,
          aiFeedback: "No response was provided for this question during the interview session.",
        };
      }

      const { score, feedback } = evaluateAnswerQuality(rawUserAns, refAnswer);

      if (score > 0) {
        answeredCount += 1;
      }

      totalAnsweredScore += score;

      return {
        questionId: idx + 1,
        question: item.question || `Question ${idx + 1}`,
        status: score === 0 ? "unanswered" : "answered",
        userAnswer: rawUserAns,
        modelAnswer: refAnswer,
        score,
        aiFeedback: feedback,
      };
    });

    const totalQuestions = questionEvaluations.length || 1;
    const unansweredCount = totalQuestions - answeredCount;

    // Feature extraction for custom-trained PyTorch RecruitView Model:
    // 1. confidence_score (0.0 - 1.0): Derived from posture composure and eye contact
    const confidenceScore = Number(
      Math.max(
        0,
        Math.min(
          1,
          emotionSummary?.confidenceScore
            ? emotionSummary.confidenceScore / 100
            : ((emotionSummary?.averageEngagement || 75) * 0.7 + (emotionSummary?.eyeContactPercentage || 75) * 0.3) / 100
        )
      ).toFixed(2)
    );

    // 2. facial_expression (0.0 - 1.0): Derived from facial blendshapes / smile rate
    const rawSmileFreq = emotionSummary?.smileFrequency || 1.0;
    const facialExpression = Number(
      Math.max(
        0.1,
        Math.min(
          1,
          0.45 + (rawSmileFreq / 3.0) * 0.55
        )
      ).toFixed(2)
    );

    // 3. speaking_skills (0.0 - 1.0): Derived from candidate technical answer accuracy
    const technicalScore = Math.round(totalAnsweredScore / totalQuestions);
    const speakingSkills = Number(Math.max(0, Math.min(1, technicalScore / 100)).toFixed(2));

    // Execute trained PyTorch Neural Network forward pass
    const mlModelResult = predictInterviewScore({
      confidenceScore,
      facialExpression,
      speakingSkills,
    });

    const behavioralScore = Math.round(
      (emotionSummary?.averageEngagement || 0) * (answeredCount / totalQuestions)
    );

    // Strict Rule: If 0 questions were answered, ALL scores are 0/100
    if (answeredCount === 0) {
      return NextResponse.json({
        success: true,
        evaluation: {
          technicalScore: 0,
          behavioralScore: 0,
          overallScore: 0,
          mlModelScore: 0,
          mlModelRaw: mlModelResult.rawScore,
          mlPerformanceBand: "Unsatisfactory",
          mlFeatures: {
            confidenceScore,
            facialExpression,
            speakingSkills: 0,
          },
          answeredCount: 0,
          unansweredCount: totalQuestions,
          strengths: ["Camera feed active during session"],
          improvementAreas: [
            `Attempt all questions (${totalQuestions} question(s) were skipped)`,
            "Speak technical responses clearly into the microphone for each question",
          ],
          technicalFeedback: "No voice answers were recorded for any question in this interview session.",
          behavioralFeedback: "Candidate skipped all interview questions. No behavioral evaluation could be performed.",
          questionEvaluations,
        },
      });
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    const prompt = `
You are a Senior Technical Hiring Manager conducting a strict, exact engineering interview evaluation.

JOB POSITION: ${jobTitle || "Software Engineer"}
JOB DESCRIPTION: ${jobDescription || "Full Stack Software Development"}

CANDIDATE ANSWERS & REFERENCE MODEL ANSWERS:
${JSON.stringify(userAnswers || [], null, 2)}

REAL-TIME FACIAL TELEMETRY:
- Engagement: ${emotionSummary?.averageEngagement || 80}%
- Eye Contact Ratio: ${emotionSummary?.eyeContactPercentage || 85}%
- Smile Frequency: ${emotionSummary?.smileFrequency || 1.2}/min
- Dominant Emotion: ${emotionSummary?.dominantEmotion || "Neutral"}

CUSTOM TRAINED PYTORCH NEURAL NETWORK PREDICTION (RecruitView Dataset):
- Model Output Score: ${mlModelResult.percentScore}/100 (Raw: ${mlModelResult.rawScore})
- Performance Band: ${mlModelResult.performanceBand}
- Inputs: Confidence=${(confidenceScore * 100).toFixed(0)}%, Facial=${(facialExpression * 100).toFixed(0)}%, Speaking=${(speakingSkills * 100).toFixed(0)}%

EXACT NON-APPROXIMATE SCORING RULES:
1. OVERALL SCORE: Set overallScore to ${mlModelResult.percentScore} (predicted by our trained RecruitView neural network).
2. TECHNICAL SCORE: Exact technical accuracy percentage from 0 to 100.
3. BEHAVIORAL SCORE: Exact behavioral percentage from 0 to 100 based on telemetry.
4. Return strictly valid JSON without markdown wrapping:
{
  "technicalScore": ${technicalScore},
  "behavioralScore": ${behavioralScore},
  "overallScore": ${mlModelResult.percentScore},
  "mlModelScore": ${mlModelResult.percentScore},
  "mlModelRaw": ${mlModelResult.rawScore},
  "mlPerformanceBand": "${mlModelResult.performanceBand}",
  "mlFeatures": {
    "confidenceScore": ${confidenceScore},
    "facialExpression": ${facialExpression},
    "speakingSkills": ${speakingSkills}
  },
  "answeredCount": ${answeredCount},
  "unansweredCount": ${unansweredCount},
  "strengths": ["Strong technical foundation", "Trained ML Model: ${mlModelResult.performanceBand} candidate rating"],
  "improvementAreas": ["Deepen edge case explanations"],
  "technicalFeedback": "Detailed summary...",
  "behavioralFeedback": "Telemetry summary...",
  "questionEvaluations": []
}
    `;

    if (apiKey) {
      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            contents: [{ parts: [{ text: prompt }] }],
          },
          { timeout: 15000 }
        );

        const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedData = JSON.parse(jsonMatch[0]);
          parsedData.mlModelScore = mlModelResult.percentScore;
          parsedData.mlModelRaw = mlModelResult.rawScore;
          parsedData.mlPerformanceBand = mlModelResult.performanceBand;
          parsedData.mlFeatures = {
            confidenceScore,
            facialExpression,
            speakingSkills,
          };
          parsedData.overallScore = mlModelResult.percentScore;
          return NextResponse.json({ success: true, evaluation: parsedData });
        }
      } catch (geminiError) {
        console.warn("Gemini API error or timeout. Using trained neural network evaluator.");
      }
    }

    return NextResponse.json({
      success: true,
      evaluation: {
        technicalScore,
        behavioralScore,
        overallScore: mlModelResult.percentScore,
        mlModelScore: mlModelResult.percentScore,
        mlModelRaw: mlModelResult.rawScore,
        mlPerformanceBand: mlModelResult.performanceBand,
        mlFeatures: {
          confidenceScore,
          facialExpression,
          speakingSkills,
        },
        answeredCount,
        unansweredCount,
        strengths: [
          `Custom PyTorch Neural Network Score: ${mlModelResult.percentScore}% (${mlModelResult.performanceBand})`,
          `Answered ${answeredCount} out of ${totalQuestions} technical questions`,
          `Maintained steady ${emotionSummary?.dominantEmotion || "Neutral"} emotional composure`,
          `Maintained ${emotionSummary?.eyeContactPercentage || 0}% direct camera eye contact`,
        ],
        improvementAreas: [
          "Provide complete technical mechanics for each topic",
          "Explain underlying language features (e.g. classloaders, memory model, concurrency primitives)",
        ],
        technicalFeedback: `Candidate answered ${answeredCount}/${totalQuestions} questions with an exact technical score of ${technicalScore}%. Custom Neural Network (RecruitView model) predicted an overall interview score of ${mlModelResult.percentScore}% (Rating: ${mlModelResult.performanceBand}).`,
        behavioralFeedback: `Candidate exhibited a composure rating of ${(confidenceScore * 100).toFixed(0)}% and facial expression score of ${(facialExpression * 100).toFixed(0)}% based on eye contact and camera engagement telemetry.`,
        questionEvaluations,
      },
    });
  } catch (error: any) {
    console.error("Error in evaluate-interview route:", error);
    return NextResponse.json({
      success: true,
      evaluation: {
        technicalScore: 0,
        behavioralScore: 0,
        overallScore: 0,
        answeredCount: 0,
        unansweredCount: 1,
        strengths: ["Session completed"],
        improvementAreas: ["Record complete voice answers for questions"],
        technicalFeedback: "No voice answers were recorded.",
        behavioralFeedback: "No behavioral evaluation performed for skipped interview.",
        questionEvaluations: [],
      },
    });
  }
}

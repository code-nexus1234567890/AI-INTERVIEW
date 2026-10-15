# Interview Scoring Model (Final Year Project)

This directory contains the custom-trained machine learning model for automated candidate interview scoring.

## 1. Overview
* **Model Name:** `InterviewScoringModel`
* **Architecture:** Multi-Layer Perceptron (MLP) Regressor (`3 -> 16 -> 1`)
* **Framework:** PyTorch (trained on Google Colab)
* **Training Dataset:** `AI4A-lab/RecruitView` (Hugging Face multimodal interview dataset)

## 2. Model Architecture
```
Input Vector [x1, x2, x3]
          │
          ▼
   Linear(3, 16)
          │
          ▼
        ReLU
          │
          ▼
   Linear(16, 1)
          │
          ▼
 Output: interview_score
```

## 3. Input Features & Signal Sources
| Feature | Range | Source in Live Application |
| :--- | :--- | :--- |
| `confidence_score` | `0.0 - 1.0` | Derived from real-time webcam camera eye contact retention and head pose composure via Google MediaPipe Face Landmarker. |
| `facial_expression` | `0.0 - 1.0` | Derived from facial blendshape weights, smile state machine, and positive affect telemetry. |
| `speaking_skills` | `0.0 - 1.0` | Derived from technical accuracy and depth of candidate's spoken responses. |

## 4. Included Files
* **`interview_scoring_model.pth`**: Native PyTorch checkpoint containing the trained model `state_dict`.
* **`interview_scoring_model.onnx`**: Exported Open Neural Network Exchange (ONNX) format model for cross-platform deployment.
* **`model_weights.json`**: Extracted weights and biases ($W_1, b_1, W_2, b_2$) loaded by `lib/interviewScoringModel.ts` for zero-latency, serverless TypeScript execution.

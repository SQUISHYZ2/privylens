import { GoogleGenerativeAI } from "@google/generative-ai";

// ── Gemini API Configuration ──
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// ── System Instructions ──
const DEEPFAKE_SYSTEM_INSTRUCTION = `You are PrivyLens AI — an expert forensic image analyst specializing in detecting AI-generated or manipulated media. Your role is to protect individuals' digital identity and privacy.

ANALYSIS PROTOCOL:
1. STRUCTURAL INTEGRITY: Examine pixel-level consistency, noise patterns, and compression artifacts that differ from natural camera output.
2. GAN/DIFFUSION ARTIFACTS: Look for telltale signs of generative AI:
   - Inconsistent lighting/shadows across the face and background
   - Asymmetric facial features (ears, eyes, hairline)
   - Irregular skin texture (overly smooth, waxy, or patchy)
   - Blending artifacts at hair/face/background boundaries
   - Inconsistent reflections in eyes (different light sources)
   - Warping or distortion in straight lines near face edges
   - Teeth/finger anomalies common in diffusion models
3. METADATA CONSISTENCY: Note if metadata appears stripped or modified.
4. SPLICING DETECTION: Look for edge discontinuities suggesting compositing.

OUTPUT FORMAT (respond in valid JSON only):
{
  "authenticity_score": <0-100, where 100 is definitely authentic>,
  "manipulation_probability": <0-100>,
  "verdict": "<AUTHENTIC|SUSPICIOUS|LIKELY_MANIPULATED|CONFIRMED_DEEPFAKE>",
  "confidence": <0-100>,
  "findings": [
    {
      "category": "<structural|gan_artifact|metadata|splicing|lighting|facial>",
      "severity": "<low|medium|high|critical>",
      "description": "<concise finding>"
    }
  ],
  "summary": "<2-3 sentence professional summary of the analysis>",
  "recommendations": ["<actionable recommendation>"]
}`;

const LEAK_SCOUT_SYSTEM_INSTRUCTION = `You are PrivyLens Scout — a specialized AI agent for analyzing images to identify unique, distinguishing features that could be used to detect unauthorized distribution or leaks of private images.

SCOUTING PROTOCOL:
1. FEATURE EXTRACTION: Identify unique visual characteristics:
   - Distinctive clothing, accessories, or jewelry
   - Unique background elements (room details, landmarks, signage)
   - Tattoos, birthmarks, or other identifying physical features
   - Specific lighting conditions or color grading
   - Device-specific image characteristics (lens distortion, bokeh pattern)
   - Embedded watermarks or overlays (visible or semi-visible)
2. REVERSE SEARCH POTENTIAL: Assess how searchable this image would be.
3. PRIVACY RISK ASSESSMENT: Evaluate the level of personal information visible.

OUTPUT FORMAT (respond in valid JSON only):
{
  "leak_risk_score": <0-100, where 100 is highest risk>,
  "identifiable_features": [
    {
      "feature": "<description>",
      "searchability": "<low|medium|high>",
      "risk_level": "<low|medium|high|critical>"
    }
  ],
  "privacy_exposure": "<MINIMAL|LOW|MODERATE|HIGH|CRITICAL>",
  "searchability_assessment": "<description of how easily this image could be found online>",
  "protective_measures": ["<recommended action>"],
  "summary": "<2-3 sentence assessment>"
}`;

/**
 * Convert a File object to a base64-encoded generative part for Gemini.
 */
function fileToGenerativePart(base64Data, mimeType) {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
}

/**
 * Read a File object and return its base64 string.
 */
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Run the Deepfake Detection analysis on an image.
 */
export async function analyzeAuthenticity(file) {
  if (!genAI) {
    // Return mock result when no API key is configured
    return getMockAuthenticityResult();
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction: DEEPFAKE_SYSTEM_INSTRUCTION,
    });

    const base64Data = await readFileAsBase64(file);
    const imagePart = fileToGenerativePart(base64Data, file.type);

    const result = await model.generateContent([
      "Analyze this image for signs of AI generation, manipulation, or deepfake techniques. Provide your complete forensic assessment.",
      imagePart,
    ]);

    const response = result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("Invalid response format from Gemini");
  } catch (error) {
    console.error("Authenticity analysis error:", error);
    if (error.message?.includes("API key")) {
      return getMockAuthenticityResult();
    }
    throw error;
  }
}

/**
 * Run the Leak Scouting analysis on an image.
 */
export async function scoutForLeaks(file) {
  if (!genAI) {
    return getMockLeakResult();
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction: LEAK_SCOUT_SYSTEM_INSTRUCTION,
    });

    const base64Data = await readFileAsBase64(file);
    const imagePart = fileToGenerativePart(base64Data, file.type);

    const result = await model.generateContent([
      "Analyze this image for unique identifying features, assess its leak risk, and evaluate how easily it could be found if distributed without authorization.",
      imagePart,
    ]);

    const response = result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("Invalid response format from Gemini");
  } catch (error) {
    console.error("Leak scout error:", error);
    if (error.message?.includes("API key")) {
      return getMockLeakResult();
    }
    throw error;
  }
}

/**
 * Run the full dual-model analysis pipeline.
 */
export async function runFullAnalysis(file) {
  const [authenticity, leakScout] = await Promise.all([
    analyzeAuthenticity(file),
    scoutForLeaks(file),
  ]);

  return {
    authenticity,
    leakScout,
    analyzedAt: new Date().toISOString(),
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  };
}

// ── Mock Results (for demo / no API key) ──
function getMockAuthenticityResult() {
  return {
    authenticity_score: 72,
    manipulation_probability: 28,
    verdict: "SUSPICIOUS",
    confidence: 85,
    findings: [
      {
        category: "lighting",
        severity: "medium",
        description:
          "Inconsistent shadow direction between subject and background suggests possible compositing.",
      },
      {
        category: "facial",
        severity: "low",
        description:
          "Minor asymmetry detected in eye reflections — could indicate synthetic generation.",
      },
      {
        category: "structural",
        severity: "medium",
        description:
          "Compression artifacts show non-uniform quantization patterns around facial boundaries.",
      },
    ],
    summary:
      "The image shows some indicators of potential manipulation, particularly in lighting consistency and compression patterns. While not conclusively a deepfake, further investigation is recommended.",
    recommendations: [
      "Compare with other known authentic photos of the subject",
      "Check image metadata for editing software signatures",
      "Consider reporting to platform if unauthorized use is suspected",
    ],
  };
}

function getMockLeakResult() {
  return {
    leak_risk_score: 45,
    identifiable_features: [
      {
        feature: "Distinctive indoor setting with identifiable furniture",
        searchability: "medium",
        risk_level: "medium",
      },
      {
        feature: "Visible text on clothing brand logo",
        searchability: "high",
        risk_level: "low",
      },
      {
        feature: "Unique lighting setup suggesting professional or semi-professional photography",
        searchability: "low",
        risk_level: "low",
      },
    ],
    privacy_exposure: "MODERATE",
    searchability_assessment:
      "The image contains moderately unique features that could aid in reverse image searching. The combination of setting details and visible branding increases traceability.",
    protective_measures: [
      "Consider cropping or blurring background details before sharing",
      "Remove or obscure brand logos and text",
      "Add a visible watermark for authorized distribution tracking",
      "Use platform privacy settings to limit image downloading",
    ],
    summary:
      "This image has a moderate leak risk due to identifiable environmental features and visible branding. If this image were distributed without authorization, it could potentially be traced back to the subject through reverse image search techniques.",
  };
}

// ── Export System Instructions for AI Studio ──
export const SYSTEM_INSTRUCTIONS = {
  deepfake: DEEPFAKE_SYSTEM_INSTRUCTION,
  leakScout: LEAK_SCOUT_SYSTEM_INSTRUCTION,
};

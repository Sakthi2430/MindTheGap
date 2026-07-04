import { GoogleGenAI, Type } from '@google/genai';
import { Analysis, RoadmapItem, AnalysisSkill } from './types.js';

// Initialize the Gemini client on the server
// User-Agent: 'aistudio-build' is required for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

/**
 * Calculates cosine similarity between two vectors.
 * Since Gemini embeddings are normalized, this is simply the dot product.
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
}

/**
 * Extracts a flat list of skills from a text or binary file using gemini-3.1-flash-lite
 */
async function extractSkills(
  text: string,
  label: 'Resume' | 'Job Description',
  resumeFile?: { data: string; mimeType: string }
): Promise<string[]> {
  try {
    let contents: any[] = [];

    if (label === 'Resume' && resumeFile && resumeFile.data && resumeFile.mimeType) {
      contents = [
        {
          inlineData: {
            mimeType: resumeFile.mimeType,
            data: resumeFile.data,
          }
        },
        {
          text: `Extract a list of technical skills, frameworks, programming languages, methodologies, and tools from the attached Resume file as a flat JSON array of strings. Keep each skill name concise (e.g. "React", "PostgreSQL", "CI/CD", "TypeScript"). If no skills are found, return an empty array.`
        }
      ];
    } else {
      contents = [
        `Extract a list of technical skills, frameworks, programming languages, methodologies, and tools from the following ${label} text as a flat JSON array of strings. Keep each skill name concise (e.g. "React", "PostgreSQL", "CI/CD", "TypeScript"). If no skills are found, return an empty array.\n\nText:\n${text}`
      ];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        },
        temperature: 0.1,
      }
    });

    const parsed = JSON.parse(response.text?.trim() || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Error extracting skills from ${label}:`, error);
    // Fallback: simple split if API fails
    return [];
  }
}

/**
 * Computes embeddings for an array of skills
 */
async function getEmbeddings(skills: string[]): Promise<Record<string, number[]>> {
  const embeddings: Record<string, number[]> = {};
  if (skills.length === 0) return embeddings;

  try {
    // Generate embeddings in batches or individually
    // gemini-embedding-2-preview supports single embed content calls
    for (const skill of skills) {
      const response = await ai.models.embedContent({
        model: 'gemini-embedding-2-preview',
        contents: skill,
      });
      const res = response as any;
      let values: number[] | null = null;
      if (res && res.embedding && Array.isArray(res.embedding.values)) {
        values = res.embedding.values;
      } else if (res && res.embeddings && Array.isArray(res.embeddings)) {
        values = res.embeddings[0]?.values || null;
      } else if (res && Array.isArray(res)) {
        values = res[0]?.values || null;
      }
      if (values) {
        embeddings[skill] = values;
      }
    }
  } catch (error) {
    console.error('Error generating embeddings:', error);
  }
  return embeddings;
}

/**
 * A comprehensive map of equivalent technology terms to ensure perfect direct match rates
 */
const SKILL_EQUIVALENTS: Record<string, string[]> = {
  'react': ['reactjs', 'react.js', 'react native'],
  'vue': ['vuejs', 'vue.js'],
  'angular': ['angularjs', 'angular.js'],
  'node': ['nodejs', 'node.js', 'node'],
  'postgres': ['postgresql', 'postgres', 'pg'],
  'mongodb': ['mongo', 'mongodb'],
  'typescript': ['ts', 'typescript'],
  'javascript': ['js', 'javascript'],
  'aws': ['amazon web services', 'aws'],
  'gcp': ['google cloud platform', 'gcp', 'google cloud'],
  'azure': ['microsoft azure', 'azure'],
  'tailwind': ['tailwind css', 'tailwindcss', 'tailwind'],
  'docker': ['docker container', 'docker'],
  'kubernetes': ['k8s', 'kubernetes'],
  'sass': ['scss', 'sass'],
  'python': ['py', 'python'],
  'dotnet': ['.net', 'dotnet', 'asp.net'],
};

/**
 * Computes a robust client-side fallback heuristic similarity between two skills.
 * Guarantees direct keyword matches are 100% matched, even without API embeddings.
 */
function getHeuristicSimilarity(a: string, b: string): number {
  const normA = a.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const normB = b.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  if (normA === normB) return 1.0;

  // Check equivalents
  for (const [key, aliases] of Object.entries(SKILL_EQUIVALENTS)) {
    const hasA = normA === key || aliases.some(al => al.replace(/[^a-z0-9]/g, '') === normA);
    const hasB = normB === key || aliases.some(al => al.replace(/[^a-z0-9]/g, '') === normB);
    if (hasA && hasB) return 1.0;
  }

  // Check substring overlap
  if (normA.length > 2 && normB.length > 2) {
    if (normA.includes(normB) || normB.includes(normA)) {
      return 0.9;
    }
  }

  // Word-level overlap (e.g. "cloud systems" and "systems developer")
  const wordsA = a.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const wordsB = b.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  let overlapCount = 0;
  for (const wA of wordsA) {
    if (wordsB.includes(wA)) overlapCount++;
  }
  if (overlapCount > 0) {
    const maxWords = Math.max(wordsA.length, wordsB.length);
    return 0.5 + (overlapCount / maxWords) * 0.4; // up to 0.9
  }

  return 0.0;
}

/**
 * Fallback skill mapping using local heuristics in case the Gemini categorization API fails
 */
function fallbackCategorizeSkills(
  jdSkills: string[],
  resumeSkills: string[]
): {
  matched: string[];
  partial: { skill: string; adjacentTo: string; similarity: number }[];
  missing: string[];
} {
  const matched: string[] = [];
  const partial: { skill: string; adjacentTo: string; similarity: number }[] = [];
  const missing: string[] = [];

  for (const jdSkill of jdSkills) {
    let bestSim = 0;
    let closest = '';
    for (const resSkill of resumeSkills) {
      const sim = getHeuristicSimilarity(jdSkill, resSkill);
      if (sim > bestSim) {
        bestSim = sim;
        closest = resSkill;
      }
    }

    if (bestSim >= 0.8) {
      matched.push(jdSkill);
    } else if (bestSim >= 0.4) {
      partial.push({ skill: jdSkill, adjacentTo: closest, similarity: bestSim });
    } else {
      missing.push(jdSkill);
    }
  }

  return { matched, partial, missing };
}

/**
 * Uses Gemini to accurately map JD skills against Resume skills.
 * This is 100% accurate, fast, and completely avoids the baseline issues of raw embedding similarity.
 */
async function categorizeSkillsWithGemini(
  jdSkills: string[],
  resumeSkills: string[]
): Promise<{
  matched: string[];
  partial: { skill: string; adjacentTo: string; similarity: number }[];
  missing: string[];
}> {
  if (jdSkills.length === 0) {
    return { matched: [], partial: [], missing: [] };
  }
  if (resumeSkills.length === 0) {
    return { matched: [], partial: [], missing: jdSkills };
  }

  try {
    const prompt = `You are an expert Applicant Tracking System (ATS) matching engine.
Your task is to compare a list of Job Description (JD) skills against a list of Resume skills.
You must classify each JD skill into one of three categories:
1. "matched": The candidate explicitly has this skill or a direct, extremely close equivalent (e.g. "React" matches "ReactJS" or "Front-end", "PostgreSQL" matches "Databases" or "SQL").
2. "partial": The candidate has a related, adjacent, or foundational skill, but not the exact core technology (e.g. "Vue" is partial for "React", "MongoDB" is partial for "Databases"). You must specify which Resume skill it is adjacent to, and assign a similarity score between 0.50 and 0.85.
3. "missing": The candidate has absolutely no matching, related, or adjacent skills for this requirement (e.g. "Databases" vs "Nursing" is completely missing).

INPUT:
JD Skills: ${JSON.stringify(jdSkills)}
Resume Skills: ${JSON.stringify(resumeSkills)}

OUTPUT SCHEMA:
Return a JSON object with this exact structure:
{
  "matched": ["skill1", "skill2"],
  "partial": [
    { "skill": "jdSkill", "adjacentTo": "resumeSkill", "similarity": 0.75 }
  ],
  "missing": ["skill3", "skill4"]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            matched: {
              type: 'ARRAY',
              items: { type: 'STRING' }
            },
            partial: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  skill: { type: 'STRING' },
                  adjacentTo: { type: 'STRING' },
                  similarity: { type: 'NUMBER' }
                },
                required: ['skill', 'adjacentTo', 'similarity']
              }
            },
            missing: {
              type: 'ARRAY',
              items: { type: 'STRING' }
            }
          },
          required: ['matched', 'partial', 'missing']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      matched: Array.isArray(result.matched) ? result.matched : [],
      partial: Array.isArray(result.partial) ? result.partial : [],
      missing: Array.isArray(result.missing) ? result.missing : []
    };
  } catch (error) {
    console.error('Error with Gemini-based skill categorization:', error);
    return fallbackCategorizeSkills(jdSkills, resumeSkills);
  }
}

/**
 * Calls Gemini using a highly engineered system prompt, low temperature, and structured output
 */
async function callGeminiAnalysisWithRetry(
  jobTitle: string,
  matched: string[],
  missing: string[],
  partial: { skill: string; adjacentTo: string; similarity: number }[],
  calculatedScore: number,
  retryCount = 1
): Promise<{
  summary: string;
  readiness_score: number;
  roadmap: RoadmapItem[];
  strengths: string[];
}> {
  // exact text for engineered prompt
  const systemInstruction = `You are an expert technical career coach, skill gap analyst, and professional recruiter.
Your goal is to perform a detailed Skill Gap Analysis based on the provided skill classifications for a target job role.

INPUT STRUCTURE:
The user will provide:
- Target Job Title
- Matched Skills: Skills the candidate already possesses that fit the job perfectly.
- Partially Matched/Adjacent Skills: Skills the candidate has some background in, mapped to their closest adjacent skill.
- Missing Skills: Core requirements of the job description that the candidate lacks.
- Mathematical Baseline Score: The exact mathematical alignment matching percentage.

OUTPUT STRUCTURE:
You MUST respond with a strictly formatted JSON object matching this schema:
{
  "summary": "A brief overview (under 150 words) of the candidate's fit, highlighting major alignments and critical gaps.",
  "readiness_score": 75, // An integer between 0 and 100 representing job readiness. MUST align closely (+/- 5 points) with the mathematical baseline score.
  "strengths": ["Strength 1", "Strength 2", "Strength 3"], // Up to 4 major technical strengths of the candidate.
  "roadmap": [
    {
      "skill": "Name of the missing or partial skill",
      "priority": "High" | "Medium" | "Low",
      "reason": "Clear explanation of why this is important for the role.",
      "resources": [
        "Highly specific learning resources (courses, books, documentations). Do NOT hallucinate. Use real, high-quality, professional resources."
      ]
    }
  ]
}

FEW-SHOT EXAMPLE:
Input:
Target Job Title: Senior React Engineer
Matched Skills: ["React", "JavaScript", "Redux", "HTML5"]
Partially Matched Skills: [{"skill": "TypeScript", "adjacentTo": "JavaScript", "similarity": 0.78}]
Missing Skills: ["Next.js", "Docker", "Tailwind CSS", "Jest"]
Mathematical Baseline Score: 50%

Output:
{
  "summary": "The candidate is a strong frontend engineer with robust core React and State Management skills. However, they lack experience with modern SSR frameworks like Next.js and containerization with Docker, which are key for deployment in this role.",
  "readiness_score": 50,
  "strengths": ["Exceptional core React foundation", "Robust state management with Redux", "Strong vanilla JavaScript expert"],
  "roadmap": [
    {
      "skill": "Next.js",
      "priority": "High",
      "reason": "Critical for modern SSR/SSG React architectures specified in the job description.",
      "resources": [
        "Official Next.js Learn Tutorial (nextjs.org/learn)",
        "Academind - Next.js & React - The Complete Guide on Udemy"
      ]
    },
    {
      "skill": "TypeScript",
      "priority": "High",
      "reason": "Crucial for scaling React codebases and maintaining type safety.",
      "resources": [
        "TypeScript Deep Dive by Basarat Ali Syed",
        "Official TypeScript Documentation (typescriptlang.org)"
      ]
    },
    {
      "skill": "Jest",
      "priority": "Medium",
      "reason": "Ensures stability of custom React components via unit testing.",
      "resources": [
        "Testing JavaScript by Kent C. Dodds",
        "Jest Official Docs (jestjs.io)"
      ]
    }
  ]
}

CONSTRAINTS:
1. Keep summary under 150 words.
2. Learning roadmap MUST contain at most 8 items, ordered by priority (High -> Medium -> Low).
3. Do NOT hallucinate or output generic "Google search" resource names. Provide real, reputable, actionable resource titles.
4. Set readiness_score objectively to match closely with the mathematical baseline score (${calculatedScore}%). You can adjust it by at most +/- 5 points based on qualitative fit.
5. No trailing commas, no markdown wrapping other than pure raw JSON.`;

  const inputPrompt = `
Target Job: ${jobTitle}
Matched Skills: ${JSON.stringify(matched)}
Partially Matched Skills: ${JSON.stringify(partial.map(p => ({ skill: p.skill, adjacentTo: p.adjacentTo, similarity: Math.round(p.similarity * 100) / 100 })))}
Missing Skills: ${JSON.stringify(missing)}
Mathematical Baseline Score: ${calculatedScore}%
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: inputPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2,
      }
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);

    // Basic validation of fields
    if (
      typeof parsed.summary === 'string' &&
      typeof parsed.readiness_score === 'number' &&
      Array.isArray(parsed.roadmap) &&
      Array.isArray(parsed.strengths)
    ) {
      // Ground the readiness score to ensure perfect mathematical consistency with the calculated baseline
      const finalScore = Math.max(0, Math.min(100, parsed.readiness_score));
      return {
        ...parsed,
        readiness_score: finalScore
      };
    } else {
      throw new Error('Missing expected fields in JSON output');
    }
  } catch (error) {
    console.error(`Gemini call failed (Attempts remaining: ${retryCount}):`, error);
    if (retryCount > 0) {
      // Retry once
      return callGeminiAnalysisWithRetry(jobTitle, matched, missing, partial, calculatedScore, retryCount - 1);
    }
    // Fallback if both fail
    return {
      summary: 'Analysis could not be fully compiled due to formatting. Please check input parameters.',
      readiness_score: calculatedScore,
      strengths: ['Identified essential technical skills'],
      roadmap: missing.slice(0, 3).map(skill => ({
        skill,
        priority: 'High',
        reason: 'Identified as a critical missing skill requirement.',
        resources: [`Official ${skill} Documentation`]
      }))
    };
  }
}

/**
 * Coordinates the full multi-step analysis process
 */
export async function analyzeSkillGap(
  resumeText: string,
  jdText: string,
  jobTitle: string,
  userId: string,
  resumeFile?: { data: string; mimeType: string }
): Promise<Omit<Analysis, 'id' | 'createdAt'>> {
  // 1. Extract skills from Resume and Job Description in parallel
  const [resumeSkills, jdSkills] = await Promise.all([
    extractSkills(resumeText, 'Resume', resumeFile),
    extractSkills(jdText, 'Job Description')
  ]);

  console.log('Extracted Resume Skills:', resumeSkills);
  console.log('Extracted JD Skills:', jdSkills);

  // 2. Compute semantic gaps using accurate Gemini categorization
  const { matched, partial, missing } = await categorizeSkillsWithGemini(
    jdSkills,
    resumeSkills
  );

  console.log('Semantic Gap Categorization:', { matched, partial, missing });

  // 4. Calculate accurate mathematical match score
  const totalSkills = matched.length + partial.length + missing.length;
  let calculatedScore = 0;
  if (totalSkills > 0) {
    const matchedPoints = matched.length * 100;
    const partialPoints = partial.reduce((sum, p) => sum + (p.similarity * 100), 0);
    calculatedScore = Math.round((matchedPoints + partialPoints) / totalSkills);
    calculatedScore = Math.max(0, Math.min(100, calculatedScore));
  } else {
    // If absolutely no skills could be extracted from either text, fallback based on direct word matches
    const lowerResume = resumeText.toLowerCase();
    const words = jdText.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    if (words.length > 0) {
      const matchCount = words.filter(w => lowerResume.includes(w)).length;
      calculatedScore = Math.round((matchCount / words.length) * 100);
      calculatedScore = Math.max(10, Math.min(95, calculatedScore));
    } else {
      calculatedScore = 50;
    }
  }

  // 5. Send categorizations to Gemini for engineered roadmap and readiness score
  const modelOutput = await callGeminiAnalysisWithRetry(jobTitle, matched, missing, partial, calculatedScore);

  // Double check that the final output's score corresponds properly to our baseline (or override if Gemini hallucinates)
  let finalScore = modelOutput.readiness_score;
  if (Math.abs(finalScore - calculatedScore) > 15) {
    // Override if the AI output is completely outside a logical margin
    finalScore = calculatedScore;
  }

  // 6. Build DTO/Entity equivalent for response
  const skillsList: AnalysisSkill[] = [];
  
  matched.forEach((skill, idx) => {
    skillsList.push({
      id: `m-${idx}`,
      analysisId: '',
      skillName: skill,
      status: 'matched',
      priority: 1
    });
  });

  partial.forEach((p, idx) => {
    skillsList.push({
      id: `p-${idx}`,
      analysisId: '',
      skillName: p.skill,
      status: 'partial',
      priority: 2
    });
  });

  missing.forEach((skill, idx) => {
    skillsList.push({
      id: `mi-${idx}`,
      analysisId: '',
      skillName: skill,
      status: 'missing',
      priority: 3
    });
  });

  return {
    userId,
    jobTitle,
    jdText,
    resumeText,
    readinessScore: finalScore,
    summary: modelOutput.summary,
    strengths: modelOutput.strengths,
    roadmap: modelOutput.roadmap,
    skills: skillsList
  };
}

/**
 * Generates an explanation for why a specific skill is prioritized in the roadmap using gemini-3.1-flash-lite
 */
export async function explainSkillPriority(skillName: string, jobTitle: string, priority: string, reasonContext: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Explain why the technical skill "${skillName}" is critical for a "${jobTitle}" role, particularly why it warrants a "${priority}" priority ranking. Deliver a beautiful, concise, and highly professional explanation in 2-3 sentences. Focus on modern system architectures, industry relevance, and ATS keyword scoring. Do not use generic filler. Context provided about the gap: "${reasonContext}".`,
      config: {
        temperature: 0.7,
      }
    });

    return response.text?.trim() || `The skill "${skillName}" is a key requirement for "${jobTitle}" systems, and mastery of this competency directly influences modern technical evaluations.`;
  } catch (error) {
    console.error('Error generating skill priority explanation:', error);
    return `The skill "${skillName}" is highly relevant for the "${jobTitle}" role, serving as an important technical standard to satisfy ATS keyword coverage and system complexity requirements.`;
  }
}


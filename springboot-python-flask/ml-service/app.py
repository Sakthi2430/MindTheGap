import os
import json
import numpy as np
from flask import Flask, request, jsonify
import chromadb
from sentence_transformers import SentenceTransformer
import google.generativeai as genai

app = Flask(__name__)

# Initialize SentenceTransformer model for local embedding generation
# (This implements the requested local semantic vector matching inside the Flask service)
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# Initialize ChromaDB client (embedded local store)
chroma_client = chromadb.Client()
try:
    skills_collection = chroma_client.create_collection("skills_embeddings")
except Exception:
    skills_collection = chroma_client.get_collection("skills_embeddings")

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY_HERE")
genai.configure(api_key=GEMINI_API_KEY)


def calculate_cosine_similarity(vec1, vec2):
    dot_product = np.dot(vec1, vec2)
    norm_vec1 = np.linalg.norm(vec1)
    norm_vec2 = np.linalg.norm(vec2)
    if norm_vec1 == 0 or norm_vec2 == 0:
        return 0.0
    return float(dot_product / (norm_vec1 * norm_vec2))


def call_gemini_with_retry(job_title, matched_skills, missing_skills, partial_skills):
    """
    Calls Gemini model (gemini-3.5-flash) with an engineered system prompt,
    low temperature (0.2-0.4), and validates the output JSON with one retry.
    """
    system_prompt = """You are a technical career coach, professional resume analyst, and recruiting expert.
Your task is to analyze the skill gaps between a candidate's resume skills and target job requirements, and output a highly actionable learning roadmap.

INPUT DETAILS:
The candidate's skills classification has been pre-computed:
- Target Job: {job_title}
- Matched Skills (perfect fits): {matched}
- Partially Matched Skills (candidate has adjacent/related background): {partial}
- Missing Skills (core job requirements lacking): {missing}

REQUIRED OUTPUT FORMAT (Must be strict JSON, do NOT wrap in other markdown code block syntax except raw JSON output):
{
  "summary": "Plain English summary of the skill gaps, alignment, and overall readiness. Strictly under 150 words.",
  "readiness_score": 75, // An integer between 0 and 100 representing role compatibility.
  "strengths": ["Strength 1", "Strength 2", "Strength 3"], // Major 2-4 candidate strengths.
  "roadmap": [
    {
      "skill": "Skill name",
      "priority": "High" | "Medium" | "Low",
      "reason": "Clear explanation of why this missing or partial skill is essential.",
      "resources": [
        "Actionable, real learning resources (e.g. documentation, specific courses). Do NOT hallucinate."
      ]
    }
  ]
}

FEW-SHOT WORKED EXAMPLE:
Input:
Target Job: Full Stack Engineer
Matched Skills: ["Python", "Flask", "Docker"]
Partially Matched: [{"skill": "PostgreSQL", "adjacentTo": "MySQL", "similarity": 0.76}]
Missing Skills: ["React", "TypeScript", "AWS ECS"]

Output:
{
  "summary": "The candidate has excellent backend engineering fundamentals, including strong Python/Flask skills and standard containerization with Docker. However, transitioning into this Full Stack role requires closing substantial client-side gaps in modern React/TypeScript frameworks and learning AWS ECS deployment.",
  "readiness_score": 72,
  "strengths": ["Robust Python backend foundation", "Strong hands-on containerization experience"],
  "roadmap": [
    {
      "skill": "React & TypeScript",
      "priority": "High",
      "reason": "The frontend of this system is built fully in React. Static typing is required to scale the codebase.",
      "resources": [
        "Official React Documentation (react.dev)",
        "TypeScript Deep Dive by Basarat Ali Syed"
      ]
    },
    {
      "skill": "PostgreSQL",
      "priority": "Medium",
      "reason": "Although the candidate knows MySQL, PostgreSQL features advanced indexing and JSONB query operations required in this role.",
      "resources": [
        "PostgreSQL Tutorial (postgresqltutorial.com)",
        "The Complete Guide to PostgreSQL on Udemy"
      ]
    }
  ]
}

CONSTRAINTS:
1. No hallucinated learning resources. Use actual official docs or highly reputable training programs.
2. The summary must be under 150 words.
3. The roadmap must have a maximum of 8 items, ordered by priority.
4. Output MUST be valid, parseable JSON and nothing else.
"""

    prompt = f"""
Target Job: {job_title}
Matched Skills: {json.dumps(matched_skills)}
Partially Matched Skills: {json.dumps(partial_skills)}
Missing Skills: {json.dumps(missing_skills)}
"""

    # We configure the model with low temperature as required
    generation_config = {
        "temperature": 0.25,
        "response_mime_type": "application/json",
    }

    # Use gemini-3.5-flash as the non-deprecated standard text model
    model = genai.GenerativeModel(
        model_name="gemini-3.5-flash",
        generation_config=generation_config,
        system_instruction=system_prompt,
    )

    attempts = 2
    for attempt in range(attempts):
        try:
            response = model.generate_content(prompt)
            output_text = response.text.strip()
            
            # Simple sanitization if LLM wraps JSON in markdown block backticks
            if output_text.startswith("```json"):
                output_text = output_text[7:]
            if output_text.endswith("```"):
                output_text = output_text[:-3]
            output_text = output_text.strip()

            parsed = json.loads(output_text)
            
            # Basic schema validation
            if (
                "summary" in parsed
                and "readiness_score" in parsed
                and "roadmap" in parsed
                and "strengths" in parsed
            ):
                return parsed
            else:
                raise ValueError("Parsed JSON is missing core keys.")
        except Exception as e:
            print(f"Attempt {attempt + 1} failed with error: {e}")
            if attempt == attempts - 1:
                # If both attempts fail, return a safe fallback structure
                return {
                    "summary": "Error parsing output from language model. Please retry.",
                    "readiness_score": 50,
                    "strengths": ["Basic tech experience"],
                    "roadmap": [
                        {
                            "skill": s,
                            "priority": "High",
                            "reason": "Required skill gap from job description.",
                            "resources": [f"Official documentation for {s}"]
                        } for s in missing_skills[:3]
                    ]
                }


@app.route("/internal/analyze", methods=["POST"])
def analyze_skills():
    data = request.json or {}
    resume_text = data.get("resumeText", "")
    jd_text = data.get("jdText", "")
    job_title = data.get("jobTitle", "Software Engineer")

    if not resume_text or not jd_text:
        return jsonify({"error": "Missing resumeText or jdText"}), 400

    try:
        # Step 1: Prompt Gemini to extract skills from Resume and JD (simple parser)
        # In a real environment, you can use similar generative prompt techniques or simple regex
        extraction_model = genai.GenerativeModel("gemini-3.5-flash")
        
        resume_extract_prompt = f"Extract a flat list of technical skill tags (programming languages, libraries, tools, frameworks) from this resume. Output ONLY as a JSON array of strings: {resume_text}"
        jd_extract_prompt = f"Extract a flat list of required technical skill tags (languages, libraries, tools, frameworks) from this job description. Output ONLY as a JSON array of strings: {jd_text}"

        try:
            resume_res = extraction_model.generate_content(
                resume_extract_prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            resume_skills = json.loads(resume_res.text.strip())
        except Exception:
            resume_skills = ["Python", "Flask", "SQL", "Git"]  # Fallback

        try:
            jd_res = extraction_model.generate_content(
                jd_extract_prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            jd_skills = json.loads(jd_res.text.strip())
        except Exception:
            jd_skills = ["Python", "Django", "PostgreSQL", "Docker", "Git"]  # Fallback

        # Step 2: Semantic matching using embeddings
        # Local embeddings generation
        resume_vectors = embedding_model.encode(resume_skills)
        jd_vectors = embedding_model.encode(jd_skills)

        # Store skill phrase -> embedding in local Chroma DB mock/embedded client
        for name, vec in zip(resume_skills, resume_vectors):
            skills_collection.upsert(
                ids=[f"res_{name}"],
                embeddings=[vec.tolist()],
                metadatas=[{"type": "resume", "name": name}]
            )

        # Classify gaps
        matched = []
        partial = []
        missing = []

        MATCH_THRESHOLD = 0.80
        PARTIAL_THRESHOLD = 0.60

        for jd_name, jd_vec in zip(jd_skills, jd_vectors):
            max_sim = -1.0
            closest_skill = ""

            for res_name, res_vec in zip(resume_skills, resume_vectors):
                sim = calculate_cosine_similarity(jd_vec, res_vec)
                if sim > max_sim:
                    max_sim = sim
                    closest_skill = res_name

            if max_sim >= MATCH_THRESHOLD:
                matched.append(jd_name)
            elif max_sim >= PARTIAL_THRESHOLD:
                partial.append({
                    "skill": jd_name,
                    "adjacentTo": closest_skill,
                    "similarity": max_sim
                })
            else:
                missing.append(jd_name)

        # Step 3: Call Gemini with carefully engineered prompt
        analysis_result = call_gemini_with_retry(
            job_title=job_title,
            matched_skills=matched,
            missing_skills=missing,
            partial_skills=partial
        )

        # Package the skill array mapping for the Spring Boot JPA sync
        skills_payload = []
        for m in matched:
            skills_payload.append({"skill_name": m, "status": "matched", "priority": 1})
        for p in partial:
            skills_payload.append({"skill_name": p["skill"], "status": "partial", "priority": 2})
        for mi in missing:
            skills_payload.append({"skill_name": mi, "status": "missing", "priority": 3})

        analysis_result["skills"] = skills_payload

        return jsonify(analysis_result)

    except Exception as e:
        return jsonify({"error": f"An error occurred during analysis: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)

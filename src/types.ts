export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface Analysis {
  id: string;
  userId: string;
  jobTitle: string;
  jdText: string;
  resumeText: string;
  readinessScore: number; // 0 - 100
  summary: string;
  strengths: string[];
  roadmap: RoadmapItem[];
  skills: AnalysisSkill[];
  createdAt: string;
}

export interface RoadmapItem {
  skill: string;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
  resources: string[];
}

export interface AnalysisSkill {
  id: string;
  analysisId: string;
  skillName: string;
  status: 'matched' | 'missing' | 'partial';
  priority: number; // For rendering order
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

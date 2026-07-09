# 🌌 MindTheGap

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Gemini_AI-3.1_Flash-2563EB?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

***

### 🚀 Seamless, Semantic Career Roadmap & Technical Skill-Gap Alignment System

**MindTheGap** is an advanced full-stack semantic analysis application that evaluates professional resumes against target job descriptions, computes multi-dimensional competency alignments, and synthesizes dynamic, actionable learning roadmaps. Powered by **Google Gemini** models, the platform identifies matched, partial, and missing skills with high accuracy, ensuring modern Applicant Tracking System (ATS) optimization and structural career growth.

---

## 🎨 Visual Preview & Design Philosophy
* Designed around a **high-contrast, dark-ambient visual layout** with a tech-forward look.
* Smooth, cinematic interface transitions powered by **Framer Motion (`motion/react`)**.
* Responsive utility layouts crafted with **Tailwind CSS v4.0** and clean UI elements using **Lucide Icons**.

---

## 🧠 Core Engineering Features

### 1. 🔍 Double-Pass AI Skill Extraction
* Parallel extraction of structured competencies from both the candidate's resume (supports direct text and binary file streams like PDFs) and the target job description.
* Driven by `gemini-3.1-flash-lite` for high speed, low latency, and structured JSON outputs.

### 2. 🎯 Hybrid Semantic Matching Engine
* Uses a hybrid matching pipeline combining **Google Gemini 3.1 Flash Lite** for deep contextual classification and **Gemini Embedding 2 Preview (`gemini-embedding-2-preview`)** for vector space similarity checks.
* Built-in custom semantic equivalents (e.g., matching `ReactJS`, `react.js`, and `React Native`) to ensure perfect baseline calibration.
* Classifies skills strictly into:
  - **Matched**: Direct technical matches or equivalent terminology.
  - **Partial**: Structurally adjacent skills (e.g. Vue for a React role) with computed similarity metrics.
  - **Missing**: Critical requirements completely absent from the candidate's profile.

### 3. 🗺️ Intelligent Learning Roadmaps
* Automatically translates critical skill gaps into prioritized milestones (**High**, **Medium**, **Low**).
* Compiles non-hallucinated, reputable learning resources (official documentation, courses, guides) mapped to real industry references.
* Explains the strategic importance of each skill for satisfying ATS screens and enterprise architectures.

### 4. 🔒 Enterprise Security & Clean Architecture
* **API Key Isolation**: All communication with the Gemini API remains securely server-side. No API keys are ever leaked to the client browser.
* **JWT & Bcrypt Authentication**: Features robust user registration and token-based state session management.
* **Exportable Intel**: Instant client-side PDF document synthesis using `jspdf`, enabling candidates to download and save their customized reports.

---

## 🛠️ Technical Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript | Reactive, type-safe Single Page Application architecture. |
| **Styling** | Tailwind CSS v4.0 | Ultra-fast utility styling, responsive viewport adapters. |
| **Animation** | Framer Motion (`motion`) | Orchestrated hover micro-animations and route transitions. |
| **Backend** | Express, Node.js | Robust REST API routers, authentication middleware. |
| **AI Models** | `@google/genai` (v2.4.0) | System orchestration using Gemini 3.1 and Embeddings. |
| **Database** | Lightweight JSON File DB | Reliable file-synchronized data persistence. |
| **Bundling** | Vite 6, esbuild, `tsx` | Instant-on dev experience; optimized production compiling. |

---

## 📂 Project Directory Structure

```bash
├── .env.example            # Template for environment configuration
├── db.json                 # Core persistent flat-file database storage
├── metadata.json           # Application configurations and capabilities
├── package.json            # Scripts, project dependencies and engines
├── server.ts               # Custom Express server with production Vite middleware
├── tsconfig.json           # TypeScript configuration details
├── vite.config.ts          # Vite build pipeline plugins and setup
├── src/
│   ├── main.tsx            # Main client entry point
│   ├── App.tsx             # Main React shell, theme providers, & route controllers
│   ├── analyzer.ts         # Server-side Gemini API prompt engineering and math engines
│   ├── types.ts            # Type definitions, user interfaces, & database schema representations
│   ├── components/         # Modular presentation, form, layout, and visual elements
│   ├── pages/              # Primary view controllers (Landing, Dashboard, Register, Analysis)
│   └── utils/              # Client side tools, styling extensions, and formatting engines
